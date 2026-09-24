"use client";
import SaasHeader from "@/components/saas/SaasHeader";
import SaasHero from "@/components/saas/SaasHero";
import SaasLiveDemos from "@/components/saas/SaasLiveDemos";
import SaasFeatures from "@/components/saas/SaasFeatures";
import SaasCalculator from "@/components/saas/SaasCalculator";
import SaasPricing from "@/components/saas/SaasPricing";
import SaasTestimonials from "@/components/saas/SaasTestimonials";
import SaasFaq from "@/components/saas/SaasFaq";
import SaasCta from "@/components/saas/SaasCta";
import SaasFooter from "@/components/saas/SaasFooter";

export default function SaasLandingPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-orange-500 selection:text-white">
      {/* Header SaaS con accesos directos y navegación */}
      <SaasHeader />

      {/* Hero Section con simulador interactivo de módulos */}
      <SaasHero />

      {/* Demos en Vivo interactivas (Mesero, Cocina KDS, Carta QR, Dueño) */}
      <SaasLiveDemos />

      {/* Módulos y Ventajas Competitivas */}
      <SaasFeatures />

      {/* Calculadora Interactiva de Ahorro frente a Apps de Delivery */}
      <SaasCalculator />

      {/* Planes y Precios Transparentes */}
      <SaasPricing />

      {/* Testimonios y Casos de Éxito de Restaurantes */}
      <SaasTestimonials />

      {/* Preguntas Frecuentes Acordeón */}
      <SaasFaq />

      {/* Banner de Conversión Pre-Footer */}
      <SaasCta />

      {/* Footer SaaS */}
      <SaasFooter />
    </div>
  );
}
