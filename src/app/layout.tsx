import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aliny | Quiz Interativo - Descubra seu Perfil",
  description:
    "Responda nosso quiz interativo e descubra qual é o seu perfil. Receba dicas personalizadas para alcançar seus objetivos.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
