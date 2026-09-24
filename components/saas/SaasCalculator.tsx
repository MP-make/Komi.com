"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Calculator, ArrowRight, DollarSign, TrendingUp, Sparkles } from "lucide-react";

export default function SaasCalculator() {
  const [ordersPerMonth, setOrdersPerMonth] = useState<number>(400);
  const [avgTicket, setAvgTicket] = useState<number>(45);

  const { thirdPartyCommission, saasCost, monthlySavings, annualSavings } = useMemo(() => {
    const totalVolume = ordersPerMonth * avgTicket;
    // Comisión promedio de Rappi / PedidosYa es entre 25% y 30% (usamos 27%)
    const commission = totalVolume * 0.27;
    const planPro = 149; // S/ 149 al mes
    const saved = Math.max(0, commission - planPro);
    return {
      thirdPartyCommission: Math.round(commission),
      saasCost: planPro,
      monthlySavings: Math.round(saved),
      annualSavings: Math.round(saved * 12),
    };
  }, [ordersPerMonth, avgTicket]);

  return (
    <section id="calculadora" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-10 lg:p-14 shadow-2xl relative">
          {/* Luz sutil */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 blur-[100px] pointer-events-none rounded-full" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Controles de la Calculadora */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
                <Calculator className="w-3.5 h-3.5" />
                Calculadora de Rentabilidad
              </div>

              <h2 className="text-3xl sm:text-4xl font-heading font-black text-white leading-tight">
                ¿Cuánto dinero estás regalando en comisiones cada mes?
              </h2>

              <p className="text-sm sm:text-base text-neutral-300">
                Las apps de delivery cobran entre el 25% y 30% de cada plato que vendes. Con nuestro canal propio de Delivery QR y pedidos web, todo ese dinero se queda en tu restaurante.
              </p>

              {/* Slider 1: Pedidos por mes */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-neutral-200">Pedidos de delivery al mes:</span>
                  <span className="font-mono font-bold text-orange-400 text-base bg-orange-500/10 px-3 py-1 rounded-md border border-orange-500/20">
                    {ordersPerMonth.toLocaleString()} pedidos
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="2000"
                  step="25"
                  value={ordersPerMonth}
                  onChange={(e) => setOrdersPerMonth(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="flex justify-between text-[11px] text-neutral-500">
                  <span>50 pedidos</span>
                  <span>1,000 pedidos</span>
                  <span>2,000 pedidos</span>
                </div>
              </div>

              {/* Slider 2: Ticket promedio */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-neutral-200">Ticket promedio por pedido:</span>
                  <span className="font-mono font-bold text-amber-400 text-base bg-amber-500/10 px-3 py-1 rounded-md border border-amber-500/20">
                    S/ {avgTicket.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="150"
                  step="5"
                  value={avgTicket}
                  onChange={(e) => setAvgTicket(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[11px] text-neutral-500">
                  <span>S/ 15</span>
                  <span>S/ 80</span>
                  <span>S/ 150</span>
                </div>
              </div>
            </div>

            {/* Resultado de Ahorro */}
            <div className="lg:col-span-6 bg-neutral-900/90 border border-neutral-800 p-6 sm:p-8 rounded-2xl space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm border-b border-neutral-800 pb-3">
                  <span className="text-neutral-400">Comisiones estimadas a apps (27%):</span>
                  <span className="font-mono font-bold text-red-400 text-base line-through">
                    - S/ {thirdPartyCommission.toLocaleString()} / mes
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm border-b border-neutral-800 pb-3">
                  <span className="text-neutral-400">Costo mensual Komi SaaS:</span>
                  <span className="font-mono font-bold text-white text-base">
                    S/ {saasCost} / mes fijo
                  </span>
                </div>
              </div>

              {/* Caja de Ahorro Destacado */}
              <div className="bg-gradient-to-tr from-emerald-950/60 to-emerald-900/30 border border-emerald-500/40 rounded-xl p-5 sm:p-6 text-center space-y-2">
                <p className="text-xs uppercase font-bold text-emerald-400 tracking-wider flex items-center justify-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  Tu Ahorro Neto Mensual
                </p>
                <div className="text-4xl sm:text-5xl font-heading font-black text-emerald-300">
                  S/ {monthlySavings.toLocaleString()}
                </div>
                <p className="text-xs text-emerald-200/80">
                  ¡Ahorras aproximadamente <strong className="text-white">S/ {annualSavings.toLocaleString()}</strong> al año en comisiones!
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/register"
                  className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 transition-all hover:scale-[1.01]"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Empezar a Ahorrar con mi Restaurante</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
