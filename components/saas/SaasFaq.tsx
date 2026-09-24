"use client";
import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function SaasFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "¿Necesito comprar hardware costoso o terminales especiales?",
      a: "No, para nada. Komi funciona 100% en la nube a través de la web. Tus meseros y cajeros pueden usar sus propios teléfonos móviles, tablets o computadoras comunes, y la tienda online funciona al instante sin instalar nada."
    },
    {
      q: "¿Cómo funciona la carta QR y el cobro con Yape o Plin?",
      a: "Tus clientes escanean el código QR en la mesa o entran a tu enlace de delivery. Seleccionan sus platos y pagan directamente enviando dinero a tu número o QR de Yape/Plin configurado en el panel. El dinero entra directo a tu cuenta bancaria sin retenciones ni comisiones de intermediarios."
    },
    {
      q: "¿Puedo manejar más de un restaurante o varias sucursales?",
      a: "Sí. La plataforma está construida con arquitectura multi-tenant. Con el plan Enterprise puedes gestionar múltiples locales bajo una misma cuenta, ver reportes consolidados y comparar el rendimiento de cada sede."
    },
    {
      q: "¿Cómo acceden los meseros y el personal de cocina?",
      a: "El personal ingresa con su número de DNI o credenciales individuales asignadas por el administrador. Cada perfil tiene permisos estrictos: los meseros solo toman pedidos de sus mesas y no pueden borrar comandas sin autorización; los cocineros solo ven la cola de pedidos en preparación."
    },
    {
      q: "¿Qué sucede al terminar los 14 días de prueba gratis?",
      a: "Puedes probar todas las funciones durante 14 días sin ingresar ninguna tarjeta de crédito. Al finalizar el período, podrás elegir el plan que mejor se adapte a tu restaurante (Starter, Pro o Enterprise) para continuar operando sin perder ninguna configuración ni dato."
    },
    {
      q: "¿Puedo programar menús diferentes para el almuerzo y la noche?",
      a: "¡Sí! El sistema incluye un programador de horarios de menú. Por ejemplo, puedes activar automáticamente platos criollos de 12:00 pm a 6:00 pm y cambiar la carta a hamburguesas, alitas y tragos de 6:00 pm a medianoche."
    }
  ];

  return (
    <section id="faq" className="py-24 bg-neutral-950 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-300">
            <HelpCircle className="w-3.5 h-3.5 text-orange-400" />
            Resolvemos tus Dudas
          </div>
          <h2 className="text-3xl sm:text-4xl font-heading font-black text-white">
            Preguntas Frecuentes
          </h2>
          <p className="text-sm sm:text-base text-neutral-400">
            Todo lo que necesitas saber antes de implementar el sistema en tu restaurante.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-neutral-900/60 border border-neutral-800 rounded-2xl overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-neutral-800/40 transition-colors cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-bold text-white pr-4">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-neutral-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-orange-400" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 text-sm text-neutral-300 leading-relaxed border-t border-neutral-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
