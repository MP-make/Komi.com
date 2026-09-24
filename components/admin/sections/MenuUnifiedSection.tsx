"use client";

import AdminDailyMenu from "./DailyMenuSection";
import AdminSchedules from "./SchedulesSection";
import { UtensilsCrossed, CalendarCheck, Clock } from "lucide-react";

export default function AdminUnifiedMenu() {
  return (
    <div className="space-y-6">
      {/* Encabezado Principal de la Sección Menú */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <UtensilsCrossed className="w-7 h-7 text-amber-400" />
          Menú
        </h1>
        <p className="text-stone-400 text-sm mt-1">
          Gestiona el banner del Menú del Día y la programación de Horarios de disponibilidad de tu carta
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Bloque 1: Menú del Día (Banner flotante para clientes) */}
        <div className="xl:col-span-5 bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 shadow-md">
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-stone-800">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <CalendarCheck size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Menú del Día</h2>
              <p className="text-stone-400 text-xs">Flyer o imagen emergente visible en la tienda</p>
            </div>
          </div>
          <AdminDailyMenu hideHeader />
        </div>

        {/* Bloque 2: Horarios de Menú y Carta */}
        <div className="xl:col-span-7 bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 shadow-md">
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-stone-800">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Clock size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Horarios de Carta</h2>
              <p className="text-stone-400 text-xs">Define qué carta o turno se muestra según día y hora</p>
            </div>
          </div>
          <AdminSchedules hideHeader />
        </div>
      </div>
    </div>
  );
}
