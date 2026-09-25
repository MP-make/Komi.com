import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { LayoutWrapper } from "@/components/shared/LayoutWrapper";

const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontHeading = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Komi — Catálogo Digital, Tienda Online & POS en Tiempo Real",
  description: "Plataforma SaaS para comercios y restaurantes. Catálogo web interactivo con pedidos directos a WhatsApp, punto de venta (POS) sincronizado, comandero móvil y control total de inventario sin comisiones.",
  icons: {
    icon: [
      { url: "/logokomi.png", sizes: "any" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
      <body
        className={`${fontSans.variable} ${fontHeading.variable} antialiased bg-gray-50`}
      >
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}