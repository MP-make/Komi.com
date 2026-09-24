"use client";
import { 
  Building2, 
  Smartphone, 
  Percent, 
  Zap, 
  QrCode, 
  ShieldCheck, 
  Clock, 
  Receipt,
  Sparkles
} from "lucide-react";

export default function SaasFeatures() {
  const features = [
    {
      icon: Building2,
      color: "from-orange-500 to-amber-500",
      title: "Arquitectura Multi-Restaurante",
      desc: "Administra 1 restaurante o una cadena de 20 sucursales. Cada local tiene sus mesas, cartas, meseros e inventarios completamente independientes y consolidados."
    },
    {
      icon: Smartphone,
      color: "from-blue-500 to-cyan-500",
      title: "Cero Inversión en Hardware",
      desc: "No compres costosas terminales táctiles de miles de soles. El sistema funciona en cualquier smartphone, tablet o laptop que tu equipo ya posee."
    },
    {
      icon: Percent,
      color: "from-emerald-500 to-teal-500",
      title: "0% Comisiones por Pedido",
      desc: "Vende por delivery con tu propia carta web interactiva. Los pagos con Yape, Plin o efectivo van directo a tu bolsillo sin pagarle el 28% a plataformas de terceros."
    },
    {
      icon: Zap,
      color: "from-amber-500 to-yellow-500",
      title: "Sincronización a la Velocidad de la Luz",
      desc: "Apenas el mesero presiona 'Enviar Comanda', la orden aparece al instante en la pantalla KDS de la cocina. Cero demoras, cero gritos y cero platos equivocados."
    },
    {
      icon: QrCode,
      color: "from-pink-500 to-rose-500",
      title: "Carta QR Dinámica con Horarios",
      desc: "Muestra menú criollo al mediodía y comida rápida en la noche de manera 100% automatizada según el horario programado. Cambia precios y fotos con un clic."
    },
    {
      icon: ShieldCheck,
      color: "from-purple-500 to-indigo-500",
      title: "Control de Personal & Antifraude",
      desc: "Tus meseros ingresan de forma segura con su DNI. Registro exacto de quién tomó cada comanda, anulaciones restringidas y auditoría de cada sol cobrado."
    }
  ];

  return (
    <section id="modulos" className="py-24 bg-neutral-900/40 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Diseñado para la Realidad Gastronómica
          </div>
          <h2 className="text-3xl sm:text-4xl font-heading font-black text-white">
            Todo lo que necesitas para operar sin fricción
          </h2>
          <p className="text-base text-neutral-300">
            Diseñamos esta plataforma escuchando los problemas reales de dueños de restobares, pollerías y cevicherías: velocidad, control de caja y libertad de comisiones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-neutral-950/70 border border-neutral-800/80 rounded-2xl p-7 hover:border-orange-500/40 hover:bg-neutral-900/80 transition-all duration-300 hover:shadow-xl group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${item.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-heading font-bold text-white mb-2.5 group-hover:text-orange-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
