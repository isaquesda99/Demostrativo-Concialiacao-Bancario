"use client";

import type { AnalyzeFinancialDocumentsOutput } from "@/ai/flows/extract-and-compare-values";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, XCircle, Landmark, CalendarDays, WalletCards, FileText } from "lucide-react";
import Image from "next/image";

interface ComparisonResultProps {
  result: AnalyzeFinancialDocumentsOutput;
}

export function ComparisonResult({ result }: ComparisonResultProps) {
  const { accountGroups } = result;

  if (!accountGroups || accountGroups.length === 0) {
    return (
      <Card className="w-full max-w-4xl animate-fade-in">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-3 text-2xl">
            <Image src="/logo.png" alt="Logo" width={28} height={28} />
            Resultado da Comparação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Nenhum grupo de contas foi encontrado nos documentos fornecidos.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full max-w-4xl animate-fade-in">
      <CardHeader>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="font-headline flex items-center gap-3 text-2xl">
            <Image src="/logo.png" alt="Logo" width={28} height={28} />
            Resultado da Comparação
          </CardTitle>
        </div>
        <CardDescription>
          A análise dos documentos foi concluída. Encontramos {accountGroups.length} grupo(s) de conta(s).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Accordion 
          type="multiple"
          className="w-full"
        >
          {accountGroups.map((group, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger>
                <div className="flex w-full items-center justify-between pr-4">
                  <div className="flex items-center gap-3">
                    <WalletCards className="h-5 w-5 text-muted-foreground" />
                    <span className="font-headline text-lg">Conta: {group.accountNumber}</span>
                  </div>
                   {group.valuesMatch ? (
                      <Badge variant="default" className="border-green-600 bg-green-100 text-green-800 hover:bg-green-200">
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        Valores Conferem
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="mr-2 h-5 w-5" />
                        Valores Divergentes
                      </Badge>
                    )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-4">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {group.documents.map((doc, docIndex) => (
                    <Card key={docIndex}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="font-headline text-base truncate" title={doc.fileName}>{doc.fileName}</CardTitle>
                            <FileText className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
                            <Landmark className="h-4 w-4" />
                            <span>{doc.bankName}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                         <div>
                            <p className="text-xl font-bold">{doc.balance}</p>
                            <p className="text-xs text-muted-foreground">Saldo extraído</p>
                         </div>
                         <Separator />
                         <div className="flex items-center gap-2 text-sm">
                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Data:</span>
                            <span>{doc.documentDate}</span>
                         </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div>
                  <h3 className="font-headline text-lg font-semibold">Detalhes da Análise da Conta</h3>
                  <Separator className="my-2" />
                  <p className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm text-muted-foreground">
                    {group.details}
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
