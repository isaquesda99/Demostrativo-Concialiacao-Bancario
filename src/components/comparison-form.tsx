"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, UploadCloud, FileText, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { fileToDataUri } from "@/lib/utils";
import { comparePdfsAction } from "@/actions/compare-pdfs";
import type { AnalyzeFinancialDocumentsOutput } from "@/ai/flows/extract-and-compare-values";
import { ComparisonResult } from "./comparison-result";

const formSchema = z.object({
  pdfs: z.custom<FileList>().refine(files => files && files.length > 0, "Pelo menos um PDF é obrigatório.").refine(files => files && files.length >= 2, "É necessário enviar pelo menos dois arquivos para comparação."),
});

type FormValues = z.infer<typeof formSchema>;

export function ComparisonForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeFinancialDocumentsOutput | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pdfs: undefined,
    },
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = e.target.files ? Array.from(e.target.files) : [];
    if (newFiles.length > 0) {
      const updatedFiles = [...selectedFiles, ...newFiles];
      setSelectedFiles(updatedFiles);
      
      const dataTransfer = new DataTransfer();
      updatedFiles.forEach(file => dataTransfer.items.add(file));
      form.setValue("pdfs", dataTransfer.files, { shouldValidate: true });
    }
  };
  
  const handleRemoveFile = (indexToRemove: number) => {
    const updatedFiles = selectedFiles.filter((_, index) => index !== indexToRemove);
    setSelectedFiles(updatedFiles);

    const dataTransfer = new DataTransfer();
    updatedFiles.forEach(file => dataTransfer.items.add(file));
    form.setValue("pdfs", dataTransfer.files, { shouldValidate: true });
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setResult(null);

    try {
      const documents = await Promise.all(
        Array.from(data.pdfs).map(async file => ({
          pdfDataUri: await fileToDataUri(file),
          fileName: file.name
        }))
      );

      const response = await comparePdfsAction({
        documents,
      });

      if (response.success && response.data) {
        setResult(response.data);
      } else {
        toast({
          variant: "destructive",
          title: "Erro na Análise",
          description: response.error || "Ocorreu um erro desconhecido.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro no Upload",
        description: "Não foi possível processar os arquivos. Verifique se são PDFs válidos.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Documentos</CardTitle>
                <CardDescription>Faça o upload de múltiplos arquivos Limite 12 PDF ou 50mb(Extratos, Anexos SEI, etc.)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="pdfs"
                  render={() => (
                    <FormItem>
                      <FormLabel>Arquivos PDF</FormLabel>
                      <FormControl>
                        <div>
                          <label htmlFor="pdfs-input" className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-border p-6 text-center transition-colors hover:border-primary hover:bg-accent/20">
                              <UploadCloud className="h-10 w-10 text-muted-foreground"/>
                              <span className="mt-2 text-sm text-muted-foreground">
                                Clique ou arraste para enviar os arquivos
                              </span>
                          </label>
                          <Input
                            id="pdfs-input"
                            type="file"
                            accept="application/pdf"
                            multiple
                            className="hidden"
                            onChange={handleFileChange}
                            // Add a key to reset the input when files are removed
                            key={selectedFiles.length}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 {selectedFiles.length > 0 && (
                    <div className="space-y-2 pt-4">
                        <h4 className="text-sm font-medium">Arquivos Selecionados:</h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            {selectedFiles.map((file, index) => (
                                <li key={index} className="flex items-center justify-between gap-2 rounded-md border bg-muted p-2">
                                    <div className="flex items-center gap-2 truncate">
                                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                                      <span className="truncate flex-1">{file.name}</span>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => handleRemoveFile(index)}>
                                      <X className="h-4 w-4" />
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
              </CardContent>
            </Card>

          <div className="flex justify-center">
            <Button type="submit" size="lg" disabled={isLoading || selectedFiles.length < 2} className="font-headline w-full max-w-xs text-lg">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analisando...
                </>
              ) : (
                "Comparar Documentos"
              )}
            </Button>
          </div>
        </form>
      </Form>
      
      {result && (
        <div className="mt-12 flex justify-center">
          <ComparisonResult result={result} />
        </div>
      )}
    </div>
  );
}
