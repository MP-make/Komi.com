"use client";
import Link from "next/link";
import { Sparkles, ArrowRight, Smartphone, MessageCircle } from "lucide-react";

export default function SaasCta() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-tr from-orange-600 via-amber-600 to-orange-500 p-8 sm:p-12 lg:p-16 text-center text-white shadow-2xl shadow-orange-600/25 overflow-hidden">
          {/* Círculos decorativos de fondo */}
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-black/20 blur-2xl pointer-events-none" />

          <div className="relative max-w-3xl mx-auto space-y-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Empieza Hoy Mismo
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight leading-tight">
              ¿Listo para modernizar tu restaurante y aumentar tu margen?
            </h2>

            <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
              Configura tu menú digital, mesas y equipo en menos de 5 minutos. Prueba la plataforma gratis durante 14 días sin compromiso ni tarjeta.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/register"
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-neutral-950 hover:bg-neutral-900 text-white font-bold text-base shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Crear mi Restaurante Gratis</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="https://wa.me/51987654321?text=Hola,%20deseo%20una%20demostraci%C3%B3n%20de%20RestoOS%20SaaS%20para%20mi%20restaurante"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-base border border-white/30 backdrop-blur-sm transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Hablar con un Asesor por WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
