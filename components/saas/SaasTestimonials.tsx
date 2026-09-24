"use client";
import { Star, Quote } from "lucide-react";

export default function SaasTestimonials() {
  const testimonials = [
    {
      name: "Carlos Mendoza",
      role: "Dueño de Restobar Fuego Urbano (Lima)",
      quote: "Antes de Komi, un viernes por la noche era un caos: comandas mojadas en la cocina, platos devueltos y mozos corriendo con libretas. Ahora los pedidos entran directos a la pantalla de cocina y la rotación de mesas aumentó un 40%.",
      stars: 5,
      metric: "+40% rotación de mesas"
    },
    {
      name: "Valeria Ríos",
      role: "Gerente de Pollería & Brasas La Leña (Surco)",
      quote: "El ahorro en comisiones fue brutal. Estábamos dejando más de S/ 4,000 al mes en comisiones de delivery a apps. Pusimos nuestra carta QR con Yape directo y nuestros clientes ahora piden por nuestra web propia sin que nos quiten un porcentaje.",
      stars: 5,
      metric: "S/ 4,200 ahorrados al mes"
    },
    {
      name: "Eduardo Castillo",
      role: "Socio Fundador de Smash Burger Co. (Arequipa)",
      quote: "Manejo 2 locales y antes tenía que esperar a la medianoche para que me manden fotos de los cuadres de caja por WhatsApp. Hoy abro el panel de dueño desde mi celular y veo las ventas en vivo, los pagos por Yape y el stock en tiempo real.",
      stars: 5,
      metric: "Cierre de caja en 5 min"
    }
  ];

  return (
    <section className="py-24 bg-neutral-900/30 border-t border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-1 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <h2 className="text-3xl sm:text-4xl font-heading font-black text-white">
            Restaurantes Reales, Resultados Comprobados
          </h2>
          <p className="text-base text-neutral-400">
            Mira cómo negocios gastronómicos transformaron su operación diaria con nuestra plataforma en la nube.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, idx) => (
            <div
              key={idx}
              className="bg-neutral-950 border border-neutral-800 rounded-2xl p-7 flex flex-col justify-between hover:border-neutral-700 transition-all shadow-xl relative"
            >
              <Quote className="w-8 h-8 text-orange-500/20 absolute top-6 right-6" />

              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 mb-4">
                  {item.metric}
                </div>

                <p className="text-sm text-neutral-300 leading-relaxed italic mb-6">
                  &quot;{item.quote}&quot;
                </p>
              </div>

              <div className="border-t border-neutral-800/80 pt-4">
                <p className="font-bold text-white text-sm">{item.name}</p>
                <p className="text-xs text-neutral-400 mt-0.5">{item.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
