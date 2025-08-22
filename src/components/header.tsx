import Image from 'next/image';

export function Header() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto flex h-24 items-center justify-start px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Image src="/logo.png" alt="Logo" width={60} height={60} className="h-auto w-auto"/>
          <div>
            <h1 className="font-headline text-2xl font-bold tracking-tight text-accent md:text-3xl">
              Tribunal de Justiça do Piauí
            </h1>
            <p className="font-body text-base text-primary-foreground">
              Poder Judiciário do Estado do Piauí
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
