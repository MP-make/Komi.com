"use client";
import { useState } from "react";
import Link from "next/link";
import { 
  Smartphone, 
  ChefHat, 
  Store, 
  BarChart3, 
  ArrowRight, 
  Play, 
  UtensilsCrossed,
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Flame,
  Receipt,
  Users,
  Layers,
  ChevronRight
} from "lucide-react";

export default function SaasHero() {
  const [activeTab, setActiveTab] = useState<'waiter' | 'chef' | 'menu' | 'owner'>('waiter');

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Luces y degradados de fondo */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-orange-600/20 to-amber-500/10 blur-[130px] -z-10 pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-orange-500/10 blur-[120px] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado Principal */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/90 border border-orange-500/30 text-orange-400 shadow-inner">
            <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-ping" />
            <span className="text-xs font-semibold tracking-wide uppercase">
              SaaS Multi-Restaurante de Nueva Generación
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black tracking-tight text-white leading-[1.12]">
            El Sistema Operativo que tu Restaurante necesita para{" "}
            <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">
              Vender Más y Erradicar el Caos
            </span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-neutral-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Comandero móvil para meseros, pantalla KDS de cocina en vivo, menú QR con pedidos directos al 0% de comisiones y control total de caja. Todo sincronizado en tiempo real en la nube.
          </p>

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 rounded-xl shadow-xl shadow-orange-600/30 hover:shadow-orange-600/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <UtensilsCrossed className="w-5 h-5 text-amber-200" />
              <span>Crear mi Restaurante Gratis</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#demos"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 text-base font-semibold text-neutral-200 hover:text-white bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700/80 rounded-xl transition-all"
            >
              <Play className="w-4 h-4 text-orange-400 fill-orange-400" />
              <span>Ver Demos en Vivo</span>
            </a>
          </div>

          {/* Badges de confianza */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-neutral-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              14 días de prueba gratis
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Sin tarjeta de crédito
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Funciona en cualquier celular o tablet
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              0% comisiones por pedido
            </span>
          </div>
        </div>

        {/* Simulador Interactivo de Módulos (Hero Interactive Preview) */}
        <div className="mt-14 max-w-5xl mx-auto">
          {/* Barra de pestañas */}
          <div className="flex items-center justify-center gap-2 p-1.5 bg-neutral-900/90 border border-neutral-800 rounded-2xl max-w-2xl mx-auto shadow-2xl overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('waiter')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'waiter'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>1. Comandero Mesero</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('chef')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'chef'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <ChefHat className="w-4 h-4" />
              <span>2. Cocina KDS</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('menu')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'menu'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>3. Carta QR / Delivery</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('owner')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'owner'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>4. Panel de Dueño</span>
            </button>
          </div>

          {/* Marco del visor interactivo */}
          <div className="mt-4 relative rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl p-4 sm:p-6 lg:p-8 overflow-hidden">
            {/* Cabecera de ventana estilo browser/app */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="text-xs text-neutral-400 font-mono ml-2">
                  resto-os.cloud / {activeTab}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Sincronizado en Vivo
                </span>
                <Link
                  href={
                    activeTab === 'waiter' ? '/waiter' :
                    activeTab === 'chef' ? '/chef' :
                    activeTab === 'menu' ? '/menu' : '/owner'
                  }
                  className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1 hover:underline"
                >
                  Abrir demo completa
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Contenido según pestaña */}
            {activeTab === 'waiter' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-6 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-orange-500/20 text-orange-400 text-xs font-semibold">
                    <Smartphone className="w-3.5 h-3.5" />
                    Comandero Móvil para Meseros
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-heading font-black text-white">
                    Toma pedidos en mesa sin libretas ni errores
                  </h3>
                  <p className="text-sm text-neutral-300 leading-relaxed">
                    Tus mozos eligen la mesa, agregan productos con observaciones (&quot;sin cebolla&quot;, &quot;término medio&quot;) y con un toque la comanda sale disparada a cocina y barra.
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-neutral-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                      Visualización de 20+ mesas (Libres, Ocupadas, Por Cobrar).
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                      Acceso ultrarrápido con número de DNI personal.
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                      Cálculo automático de cuenta y propina.
                    </li>
                  </ul>
                  <div className="pt-2">
                    <Link
                      href="/waiter"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold text-sm shadow-md transition-colors"
                    >
                      <span>Probar Comandero de Mesero</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                <div className="md:col-span-6 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                  <div className="flex items-center justify-between mb-3 text-xs text-neutral-400 border-b border-neutral-800 pb-2">
                    <span className="font-semibold text-neutral-200">Plano de Mesas en Vivo</span>
                    <span className="text-emerald-400 font-medium">8 Ocupadas / 12 Libres</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => {
                      const isOccupied = [2, 3, 6, 7, 11].includes(num);
                      return (
                        <div
                          key={num}
                          className={`p-3 rounded-lg border font-bold transition-all ${
                            isOccupied
                              ? "bg-orange-500/20 border-orange-500/40 text-orange-300"
                              : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                          }`}
                        >
                          <div className="text-[10px] text-neutral-400 font-normal">Mesa</div>
                          <div className="text-base">{num}</div>
                          <div className="text-[9px] uppercase font-semibold mt-1">
                            {isOccupied ? "Ocupada" : "Libre"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'chef' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-6 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
                    <ChefHat className="w-3.5 h-3.5" />
                    Pantalla KDS en Cocina (Kitchen Display)
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-heading font-black text-white">
                    Despacha 2x más rápido con comandas en vivo
                  </h3>
                  <p className="text-sm text-neutral-300 leading-relaxed">
                    Adiós a los papeles mojados y comandas perdidas. El equipo de cocina ve los pedidos en columnas con cronómetro y alertas visuales cuando un plato supera el tiempo estipulado.
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-neutral-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      Tickets en tiempo real clasificados por mesa o delivery.
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      Cronómetro de espera por ticket (verde / amarillo / rojo).
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      Marcar &quot;Listo para Servir&quot; con un solo toque.
                    </li>
                  </ul>
                  <div className="pt-2">
                    <Link
                      href="/chef"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-md transition-colors"
                    >
                      <span>Probar Pantalla de Cocina</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                <div className="md:col-span-6 bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {/* Ticket 1 */}
                    <div className="bg-neutral-900 border border-emerald-500/40 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-emerald-400">Mesa 04 (Salón)</span>
                        <span className="text-neutral-400 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-emerald-400" />
                          04:12m
                        </span>
                      </div>
                      <div className="text-neutral-200 text-xs space-y-1">
                        <div className="font-semibold">1x 1/4 Pollo a la Brasa</div>
                        <div className="text-[11px] text-neutral-400 pl-2">• Papas crocantes</div>
                        <div className="font-semibold">1x Alitas BBQ (x12)</div>
                        <div className="text-[11px] text-amber-300 pl-2">• Salsa aparte</div>
                      </div>
                      <div className="pt-1">
                        <span className="inline-block w-full py-1 text-center bg-emerald-600/30 text-emerald-300 rounded text-[10px] font-bold">
                          EN PREPARACIÓN
                        </span>
                      </div>
                    </div>

                    {/* Ticket 2 */}
                    <div className="bg-neutral-900 border border-amber-500/40 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-amber-400">Delivery #108</span>
                        <span className="text-amber-400 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          12:45m
                        </span>
                      </div>
                      <div className="text-neutral-200 text-xs space-y-1">
                        <div className="font-semibold">2x Hamburguesa Royale</div>
                        <div className="text-[11px] text-neutral-400 pl-2">• Con huevo y queso</div>
                        <div className="font-semibold">1x Porción Tequeños</div>
                      </div>
                      <div className="pt-1">
                        <span className="inline-block w-full py-1 text-center bg-amber-600/30 text-amber-300 rounded text-[10px] font-bold">
                          APURAR PEDIDO
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'menu' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-6 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-sky-500/20 text-sky-400 text-xs font-semibold">
                    <Store className="w-3.5 h-3.5" />
                    Menú Digital QR & Delivery Propio
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-heading font-black text-white">
                    Vende online directamente sin comisiones abusivas
                  </h3>
                  <p className="text-sm text-neutral-300 leading-relaxed">
                    Tus comensales escanean el QR en mesa o piden a domicilio desde su celular. Integrado con pagos Yape, Plin y pedidos que caen directo a tu WhatsApp y sistema.
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-neutral-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                      Carta visual responsive con fotos apetitosas y precios actualizados.
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                      0% de comisiones por venta (ahorra el 25-30% de apps).
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                      Soporte de menú criollo al mediodía y comida rápida nocturna.
                    </li>
                  </ul>
                  <div className="pt-2">
                    <Link
                      href="/menu"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm shadow-md transition-colors"
                    >
                      <span>Ver Carta QR Digital</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                <div className="md:col-span-6 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                  <div className="max-w-xs mx-auto bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-3">
                      <div className="text-xs font-bold text-white">Carta Digital QR</div>
                      <span className="text-[10px] bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded font-mono">
                        Mesa 12
                      </span>
                    </div>
                    <div className="space-y-2.5">
                      <div className="flex gap-3 items-center p-2 rounded-lg bg-neutral-950 border border-neutral-800/80">
                        <div className="w-12 h-12 rounded-lg bg-orange-600/30 flex items-center justify-center text-orange-400 text-lg">
                          🍔
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-white">Bravaza Doble Queso</p>
                          <p className="text-[11px] text-neutral-400">S/ 24.90</p>
                        </div>
                        <span className="text-xs font-bold px-2 py-1 rounded bg-orange-600 text-white">+</span>
                      </div>

                      <div className="flex gap-3 items-center p-2 rounded-lg bg-neutral-950 border border-neutral-800/80">
                        <div className="w-12 h-12 rounded-lg bg-amber-600/30 flex items-center justify-center text-amber-400 text-lg">
                          🍗
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-white">1/4 Broaster Clásico</p>
                          <p className="text-[11px] text-neutral-400">S/ 18.50</p>
                        </div>
                        <span className="text-xs font-bold px-2 py-1 rounded bg-orange-600 text-white">+</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs font-bold text-white">
                      <span>Total: S/ 43.40</span>
                      <span className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px]">
                        Pagar con Yape
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'owner' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-6 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-purple-500/20 text-purple-400 text-xs font-semibold">
                    <BarChart3 className="w-3.5 h-3.5" />
                    Panel de Control & Dueño
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-heading font-black text-white">
                    Toma decisiones con métricas reales de tu negocio
                  </h3>
                  <p className="text-sm text-neutral-300 leading-relaxed">
                    Sabe en cualquier momento desde tu teléfono cuánto estás vendiendo hoy, cuáles son tus platos más rentables, el rendimiento de tus meseros y el cierre de caja exacto.
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-neutral-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                      Ventas en vivo discriminadas por salón, delivery y método de pago.
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                      Cierre de caja sin descuadres ni fugas de dinero.
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                      Control multi-sucursal desde una sola cuenta.
                    </li>
                  </ul>
                  <div className="pt-2">
                    <Link
                      href="/owner"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-md transition-colors"
                    >
                      <span>Ver Panel de Dueño</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                <div className="md:col-span-6 bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg">
                      <p className="text-[10px] text-neutral-400 uppercase">Ventas de Hoy</p>
                      <p className="text-base font-bold text-white mt-1">S/ 3,420</p>
                      <span className="text-[10px] text-emerald-400 font-semibold">+18% vs ayer</span>
                    </div>
                    <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg">
                      <p className="text-[10px] text-neutral-400 uppercase">Pedidos</p>
                      <p className="text-base font-bold text-white mt-1">84</p>
                      <span className="text-[10px] text-neutral-400">Ticket prom: S/ 40.7</span>
                    </div>
                    <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg">
                      <p className="text-[10px] text-neutral-400 uppercase">Yape / Plin</p>
                      <p className="text-base font-bold text-emerald-400 mt-1">68%</p>
                      <span className="text-[10px] text-neutral-400">Sin comisiones</span>
                    </div>
                  </div>

                  <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">Top Platos Más Vendidos</span>
                      <span className="text-[10px] text-neutral-400">Hoy</span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-neutral-300">
                        <span>1. 1/4 Pollo Broaster Especial</span>
                        <span className="font-mono text-neutral-400">34 vendidos</span>
                      </div>
                      <div className="flex items-center justify-between text-neutral-300">
                        <span>2. Hamburguesa Bravaza</span>
                        <span className="font-mono text-neutral-400">22 vendidos</span>
                      </div>
                      <div className="flex items-center justify-between text-neutral-300">
                        <span>3. Alitas BBQ x12</span>
                        <span className="font-mono text-neutral-400">18 vendidos</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
