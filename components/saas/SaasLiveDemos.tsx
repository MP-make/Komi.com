"use client";
import Link from "next/link";
import { 
  Smartphone, 
  ChefHat, 
  Store, 
  BarChart3, 
  ArrowUpRight, 
  KeyRound, 
  Layers,
  CheckCircle,
  Sparkles
} from "lucide-react";

export default function SaasLiveDemos() {
  const demos = [
    {
      id: "waiter",
      badge: "Módulo Meseros",
      badgeColor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      title: "Comandero Móvil para Salón",
      desc: "Prueba cómo un mesero toma un pedido en mesa, elige guarniciones, anota observaciones y envía la orden a cocina en 15 segundos.",
      href: "/waiter",
      icon: Smartphone,
      color: "from-orange-600 to-amber-600",
      stats: "20 mesas interactivas",
      hint: "Ingresa con DNI o credenciales de prueba demo",
      features: [
        "Selección visual de mesas libres y ocupadas",
        "Búsqueda y filtros rápidos de platos y tragos",
        "Notas personalizadas por plato para cocina",
        "Cálculo automático de cuenta y pagos"
      ]
    },
    {
      id: "chef",
      badge: "Módulo Cocina KDS",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      title: "Pantalla KDS en Tiempo Real",
      desc: "Experimenta la pantalla que usan los cocineros para ver los pedidos en fila, priorizar órdenes retrasadas y marcar comandas listas.",
      href: "/chef",
      icon: ChefHat,
      color: "from-emerald-600 to-teal-600",
      stats: "Alertas visuales de tiempo",
      hint: "Ideal para tablets o pantallas táctiles en cocina",
      features: [
        "Cola de tickets organizados cronológicamente",
        "Cronómetro con semáforo de retrasos",
        "Sonido o alerta al recibir nueva comanda",
        "Despacho y sincronización instantánea con mozos"
      ]
    },
    {
      id: "menu",
      badge: "Módulo Carta QR & Delivery",
      badgeColor: "bg-sky-500/20 text-sky-400 border-sky-500/30",
      title: "Menú Digital & Delivery Propio",
      desc: "Observa la tienda online y carta QR interactiva que ven los clientes finales para pedir en el salón o solicitar delivery con Yape/Plin.",
      href: "/menu",
      icon: Store,
      color: "from-sky-600 to-blue-600",
      stats: "0% comisiones de intermediarios",
      hint: "Escaneable mediante código QR en cada mesa",
      features: [
        "Catálogo con fotos, precios y promociones",
        "Menú programable (almuerzos vs. cenas)",
        "Carrito de compras intuitivo con pedidos WhatsApp",
        "Cobro directo a tu billetera Yape o Plin"
      ]
    },
    {
      id: "owner",
      badge: "Módulo Dueño / Admin",
      badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      title: "Panel de Gestión & Auditoría",
      desc: "Supervisa las ventas del día, el rendimiento de tu personal, el catálogo de platos, configuración de pagos y cierres de turno.",
      href: "/owner",
      icon: BarChart3,
      color: "from-purple-600 to-indigo-600",
      stats: "Métricas y cierres de caja",
      hint: "Acceso con usuario de administración",
      features: [
        "Resumen de ventas y ticket promedio",
        "Configuración de platos, precios y categorías",
        "Gestión de personal y accesos por rol",
        "Configuración de números Yape y datos del local"
      ]
    }
  ];

  return (
    <section id="demos" className="py-20 bg-neutral-950/60 border-y border-neutral-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-300">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            Acceso Directo Sin Fricción
          </div>
          <h2 className="text-3xl sm:text-4xl font-heading font-black text-white">
            Prueba Cada Módulo del Sistema en Vivo
          </h2>
          <p className="text-sm sm:text-base text-neutral-400">
            No te quedes solo con capturas de pantalla. Interactúa con las pantallas reales diseñadas para el día a día operativo de tu restaurante.
          </p>
        </div>

        {/* Grid de 4 tarjetas de demos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {demos.map((demo) => {
            const Icon = demo.icon;
            return (
              <div
                key={demo.id}
                className="group relative bg-neutral-900/70 border border-neutral-800/90 rounded-2xl p-6 sm:p-8 hover:border-neutral-700 transition-all duration-300 hover:shadow-2xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${demo.color} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${demo.badgeColor}`}>
                          {demo.badge}
                        </span>
                        <h3 className="text-xl font-heading font-bold text-white mt-1 group-hover:text-orange-400 transition-colors">
                          {demo.title}
                        </h3>
                      </div>
                    </div>

                    <Link
                      href={demo.href}
                      className="p-2 rounded-lg bg-neutral-800 text-neutral-300 group-hover:bg-orange-600 group-hover:text-white transition-colors"
                      title="Abrir demo en vivo"
                    >
                      <ArrowUpRight className="w-5 h-5" />
                    </Link>
                  </div>

                  <p className="text-sm text-neutral-300 leading-relaxed mb-5">
                    {demo.desc}
                  </p>

                  <div className="space-y-2 mb-6 border-t border-neutral-800/80 pt-4">
                    {demo.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-neutral-300">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <span className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    {demo.hint}
                  </span>

                  <Link
                    href={demo.href}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition-all group-hover:bg-orange-600"
                  >
                    <span>Lanzar {demo.badge}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
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
