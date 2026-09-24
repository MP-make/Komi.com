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
  title: "RestoOS SaaS — Sistema Operativo Todo-en-Uno para Restaurantes y Bares",
  description: "Plataforma SaaS en la nube para restaurantes. Comandero móvil para meseros, pantalla KDS de cocina, carta QR interactiva y control total de ventas y caja con 0% de comisiones.",
  icons: {
    icon: [
      { url: "/favicon.webp", sizes: "any", type: "image/webp" },
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