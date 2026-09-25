"use client";
import { useState } from "react";
import Link from "next/link";
import { Check, UtensilsCrossed, ArrowRight } from "lucide-react";

export default function SaasPricing() {
  const [annualBilling, setAnnualBilling] = useState(false);

  const plans = [
    {
      id: "starter",
      name: "Starter / Emprendedor",
      badge: "Ideal para huariques y cafeterías",
      priceMonthly: 79,
      priceAnnual: 63,
      desc: "Todo lo fundamental para digitalizar tu salón y comenzar a tomar pedidos.",
      popular: false,
      features: [
        "1 Local / Restaurante",
        "Hasta 10 Mesas interactivas",
        "Menú Digital QR escaneable",
        "Comandero móvil para 3 meseros",
        "Cobro con QR Yape y Plin",
        "Reporte básico de ventas diarias",
        "Soporte por WhatsApp"
      ],
      cta: "Empezar Prueba de 14 Días",
      href: "/register?plan=starter"
    },
    {
      id: "pro",
      name: "Pro / Restaurante",
      badge: "El más elegido por restobares y pollerías",
      priceMonthly: 149,
      priceAnnual: 119,
      desc: "El paquete completo para eliminar el caos entre meseros, cocina y delivery.",
      popular: true,
      features: [
        "Todo lo del plan Starter +",
        "Mesas ILIMITADAS",
        "Pantalla de Cocina KDS en vivo",
        "Delivery Propio 0% comisiones",
        "Hasta 10 cuentas de personal (DNI seguro)",
        "Menú del Día programable por horario",
        "Panel de Dueño con métricas en tiempo real",
        "Control de caja y arqueos diarios",
        "Soporte prioritario 7 días a la semana"
      ],
      cta: "Comenzar Prueba Gratis",
      href: "/register?plan=pro"
    },
    {
      id: "enterprise",
      name: "Enterprise / Franquicias",
      badge: "Para cadenas de restaurantes",
      priceMonthly: 299,
      priceAnnual: 239,
      desc: "Potencia multi-sucursal y arquitectura dedicada para negocios en expansión.",
      popular: false,
      features: [
        "Todo lo del plan Pro +",
        "Multi-Sucursal (Múltiples locales)",
        "Meseros y cocineros ILIMITADOS",
        "Dominio web propio personalizado",
        "API abierta e integraciones a medida",
        "Facturación electrónica integrada",
        "Auditoría avanzada y exportación contable",
        "Gerente de cuenta y asesor 24/7"
      ],
      cta: "Contactar a Ventas",
      href: "/register?plan=enterprise"
    }
  ];

  return (
    <section id="precios" className="py-24 bg-neutral-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-semibold border border-orange-500/20">
            <UtensilsCrossed className="w-3.5 h-3.5" />
            Planes Transparentes y Sin Sorpresas
          </div>
          <h2 className="text-3xl sm:text-4xl font-heading font-black text-white">
            Invierte en Crecimiento, No en Comisiones
          </h2>
          <p className="text-sm sm:text-base text-neutral-400">
            Comienza con 14 días de prueba gratis. Sin contrato de permanencia, cancela o cambia de plan en cualquier momento.
          </p>

          {/* Toggle Facturación Mensual / Anual */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <span className={`text-sm ${!annualBilling ? 'text-white font-semibold' : 'text-neutral-400'}`}>
              Facturación Mensual
            </span>
            <button
              type="button"
              onClick={() => setAnnualBilling(!annualBilling)}
              className="w-14 h-8 bg-neutral-800 rounded-full p-1 transition-colors relative cursor-pointer"
            >
              <div
                className={`w-6 h-6 rounded-full bg-orange-500 transition-transform ${
                  annualBilling ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-sm flex items-center gap-1.5 ${annualBilling ? 'text-white font-semibold' : 'text-neutral-400'}`}>
              Facturación Anual
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                20% OFF
              </span>
            </span>
          </div>
        </div>

        {/* Grid de Precios */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => {
            const price = annualBilling ? plan.priceAnnual : plan.priceMonthly;
            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                  plan.popular
                    ? "bg-gradient-to-b from-neutral-900 to-neutral-950 border-2 border-orange-500 shadow-2xl shadow-orange-500/10 scale-105 z-10"
                    : "bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-600 to-amber-600 text-white text-[11px] font-extrabold uppercase px-4 py-1 rounded-full shadow-lg">
                    Recomendado para Crecer
                  </div>
                )}

                <div>
                  <div className="mb-4">
                    <h3 className="text-xl font-heading font-bold text-white">{plan.name}</h3>
                    <p className="text-xs text-neutral-400 mt-1">{plan.badge}</p>
                  </div>

                  <div className="flex items-baseline gap-1 my-6">
                    <span className="text-sm font-semibold text-neutral-400">S/</span>
                    <span className="text-5xl font-heading font-black text-white">{price}</span>
                    <span className="text-sm text-neutral-400 font-medium">/ mes</span>
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-6">
                    {plan.desc}
                  </p>

                  <div className="space-y-3 mb-8 border-t border-neutral-800 pt-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                      Lo que incluye:
                    </p>
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-800">
                  <Link
                    href={plan.href}
                    className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg ${
                      plan.popular
                        ? "bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-orange-600/30 hover:scale-[1.02]"
                        : "bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white"
                    }`}
                  >
                    <span>{plan.cta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
