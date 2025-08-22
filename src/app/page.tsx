import { ComparisonForm } from '@/components/comparison-form';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 flex-col items-center p-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl text-center">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl">
              DEMONSTRATIVO DA CONCILIAÇÃO BANCÁRIA
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Faça o upload de múltiplos extratos em PDF para comparar os saldos de forma automática e segura, agrupados por conta.
            </p>
        </div>
        <div className="mt-10 w-full max-w-4xl">
            <ComparisonForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
