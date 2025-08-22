'use server';
/**
 * @fileOverview This file defines a Genkit flow to extract financial data from multiple PDF documents,
 * group them by account number, and compare their final balances.
 *
 * - analyzeFinancialDocuments - The main function that orchestrates the document analysis.
 * - AnalyzeFinancialDocumentsInput - The input type for the analysis function.
 * - AnalyzeFinancialDocumentsOutput - The output type containing grouped analysis results.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PdfInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PDF file as a data URI, including MIME type and Base64 encoding. Format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  fileName: z.string().describe('The original name of the PDF file.'),
});

const AnalyzeFinancialDocumentsInputSchema = z.object({
  documents: z
    .array(PdfInputSchema)
    .describe('An array of PDF documents to be analyzed.'),
});
export type AnalyzeFinancialDocumentsInput = z.infer<
  typeof AnalyzeFinancialDocumentsInputSchema
>;

const DocumentDetailsSchema = z.object({
  fileName: z
    .string()
    .describe('The original name of the source PDF file (e.g., "extrato.pdf").'),
  bankName: z.string().describe('The name of the bank (e.g., "Banco do Brasil").'),
  documentDate: z.string().describe('The document date (e.g., "31/07/2025").'),
  balance: z
    .string()
    .describe('The final balance, formatted as it appears in the document.'),
});

const AccountGroupSchema = z.object({
  accountNumber: z
    .string()
    .describe('The common account number for this group.'),
  documents: z
    .array(DocumentDetailsSchema)
    .describe('A list of documents belonging to this account group.'),
  valuesMatch: z
    .boolean()
    .describe(
      'Whether the balances of all documents in this group are identical.'
    ),
  details: z
    .string()
    .describe(
      'A detailed explanation of the comparison for this account group.'
    ),
});

const AnalyzeFinancialDocumentsOutputSchema = z.object({
  accountGroups: z
    .array(AccountGroupSchema)
    .describe(
      'An array of account groups, each containing documents and comparison results.'
    ),
});
export type AnalyzeFinancialDocumentsOutput = z.infer<
  typeof AnalyzeFinancialDocumentsOutputSchema
>;

export async function analyzeFinancialDocuments(
  input: AnalyzeFinancialDocumentsInput
): Promise<AnalyzeFinancialDocumentsOutput> {
  return analyzeFinancialDocumentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeFinancialDocumentsPrompt',
  input: {schema: AnalyzeFinancialDocumentsInputSchema},
  output: {schema: AnalyzeFinancialDocumentsOutputSchema},
  prompt: `Você é um analista de dados financeiros especialista.

Sua tarefa é processar uma lista de documentos financeiros em PDF, fornecidos como data URIs com seus nomes de arquivo originais. A resposta deve ser em português do Brasil.

Documentos Fornecidos:
{{#each documents}}
- Arquivo: {{{this.fileName}}}
- Documento: {{media url=this.pdfDataUri}}
{{/each}}

Siga estes passos rigorosamente:
1.  **Extração de Dados**: Primeiro, analise CADA um dos PDFs fornecidos e extraia as seguintes informações de cada um:
    - **Nome do Arquivo Original**: Use o nome do arquivo fornecido (ex: "extrato_julho.pdf").
    - **Nome do Banco**: Identifique o nome do banco (ex: "Banco do Brasil", "Caixa Econômica Federal", "BB").
    - **Número da Conta**: Identifique o número da conta (ex: "12292-0").
    - **Data do Documento**: Identifique a data do documento (ex: "31/07/2025").
    - **SALDO**: Extraia o valor do saldo final. No documento "Anexo SEI", este valor está na linha "7-SALDO". **O valor do saldo deve ser extraído por completo, exatamente como aparece no documento. A formatação do número está no padrão brasileiro, onde "." é um separador de milhares e "," é um separador decimal. Exemplo: um valor como "2.417.764,24" deve ser extraído como "2.417.764,24". Não abrevie ou altere o formato do número. O campo "balance" na saída DEVE conter o valor completo.**

2.  **Agrupamento por Conta**: Após ter extraído as informações de TODOS os documentos, agrupe os documentos que pertencem ao mesmo **Número da Conta**. Cada grupo deve conter todos os documentos associados àquele número de conta. É crucial que todos os documentos fornecidos sejam processados e agrupados antes de gerar a resposta.

3.  **Comparação de Saldos**: Dentro de cada grupo de contas, compare os valores de **SALDO**. Para fazer a comparação corretamente, siga este procedimento:
    a. Para cada valor de saldo, normalize-o removendo todos os caracteres que não sejam dígitos (0-9) ou a vírgula decimal (","). Por exemplo, "R$ 74.710,15" se torna "74710,15" e "74.710,15" também se torna "74710,15".
    b. Compare as strings normalizadas. Se todas as strings normalizadas no grupo forem idênticas, então os valores conferem.
    c. Defina o campo 'valuesMatch' como 'true' se conferem e 'false' caso contrário.

4.  **Geração da Saída e Análise Detalhada**: Formate a saída final em um JSON contendo uma lista de "accountGroups". Para cada grupo:
    a. Forneça o número da conta, uma lista dos detalhes de cada documento (nome do arquivo, banco, data, saldo) e o booleano 'valuesMatch'.
    b. **Crie o campo 'details' com uma explicação completa e informativa da análise**:
        - **Se 'valuesMatch' for verdadeiro**, o texto deve confirmar a consistência e informar o valor correspondente. Exemplo: "Os saldos para a conta [número da conta] são consistentes, com o valor de R$ [saldo] verificado nos documentos [lista de nomes de arquivos]."
        - **Se 'valuesMatch' for falso**, o texto deve descrever claramente a divergência, listando os valores diferentes e seus respectivos arquivos de origem. Exemplo: "Foi encontrada uma divergência nos saldos da conta [número da conta]. O documento '[nome do arquivo 1]' apresenta um saldo de R$ [saldo 1], enquanto o documento '[nome do arquivo 2]' apresenta um saldo de R$ [saldo 2]."
`,
});

const analyzeFinancialDocumentsFlow = ai.defineFlow(
  {
    name: 'analyzeFinancialDocumentsFlow',
    inputSchema: AnalyzeFinancialDocumentsInputSchema,
    outputSchema: AnalyzeFinancialDocumentsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
