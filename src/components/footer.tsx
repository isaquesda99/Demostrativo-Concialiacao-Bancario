"use client";

import { useState, useEffect } from 'react';

export function Footer() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="mt-auto bg-muted py-4">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground md:px-6">
        <p>
          &copy; {currentYear} Tribunal de Justiça do Estado do Piauí. Todos os direitos reservados.
        </p>
        <p className="mt-1">
            Superintendência de Controle Interno - SCI
        </p>
      </div>
    </footer>
  );
}
