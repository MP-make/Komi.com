"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
  Search,
  Receipt,
  QrCode,
  CookingPot,
  ChefHat,
  Smartphone,
  Store,
  ArrowRight,
  Check,
  CreditCard,
  Banknote,
  UtensilsCrossed,
  Printer,
  ChevronRight,
  Flame,
  BadgePercent
} from "lucide-react";

// =========================================================================
// 1. DUEÑO / ADMINISTRADOR DEMO VIEW
// =========================================================================
export function AdminDemoView({ isCompact = false }: { isCompact?: boolean }) {
  const [period, setPeriod] = useState<"hoy" | "semana" | "mes">("hoy");

  const metrics = {
    hoy: { sales: "S/ 3,420.50", orders: 58, ticket: "S/ 58.90", tables: "8/12 Activas", growth: "+18.4%" },
    semana: { sales: "S/ 24,850.00", orders: 412, ticket: "S/ 60.30", tables: "92% Ocupación", growth: "+12.1%" },
    mes: { sales: "S/ 102,400.00", orders: 1740, ticket: "S/ 58.85", tables: "88% Ocupación", growth: "+24.5%" }
  };

  const current = metrics[period];

  const recentOrders = [
    { id: "#ORD-108", table: "Mesa 4", waiter: "Carlos R.", items: "2x Ceviche Clásico, 1x Chicha Jarra", total: "S/ 94.00", status: "Cobrado", time: "Hace 5 min" },
    { id: "#ORD-107", table: "Mesa 2", waiter: "Lucía M.", items: "1x Lomo Saltado, 2x Gaseosas", total: "S/ 56.00", status: "En Cocina", time: "Hace 12 min" },
    { id: "#ORD-106", table: "Delivery", waiter: "Web Online", items: "1x Arroz con Mariscos, 1x Causa", total: "S/ 68.00", status: "En Reparto", time: "Hace 18 min" },
    { id: "#ORD-105", table: "Mesa 7", waiter: "Carlos R.", items: "3x Cervezas Cusqueña, 1x Tequeños", total: "S/ 48.00", status: "Cobrado", time: "Hace 25 min" }
  ];

  const topDishes = [
    { name: "Ceviche Carretillero", sales: 142, revenue: "S/ 4,970", tag: "+32% esta sem." },
    { name: "Lomo Saltado Criollo", sales: 118, revenue: "S/ 4,484", tag: "Estrella" },
    { name: "Arroz Chaufa de Mariscos", sales: 95, revenue: "S/ 3,610", tag: "Popular" },
    { name: "Chicha Morada (1L)", sales: 160, revenue: "S/ 2,400", tag: "Bebida Top" }
  ];

  return (
    <div className="bg-stone-950 text-stone-100 min-h-full p-3 sm:p-5 flex flex-col gap-4 font-sans select-none">
      {/* Header Admin */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-sm">
            👑
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-white leading-tight">
              Dashboard Gerencial
            </h3>
            <p className="text-[11px] text-stone-400">
              Komi Restobar • Sucursal Principal (Miraflores)
            </p>
          </div>
        </div>

        {/* Selector de periodo */}
        <div className="flex items-center gap-1 bg-stone-900 border border-stone-800 p-1 rounded-xl text-xs">
          {(["hoy", "semana", "mes"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition-all cursor-pointer ${
                period === p
                  ? "bg-amber-500 text-black shadow-sm"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-3 sm:p-4">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
            <span>Ventas Netas</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-base sm:text-xl font-black text-white">{current.sales}</div>
          <div className="text-[10px] text-emerald-400 font-bold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> {current.growth} vs periodo ant.
          </div>
        </div>

        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-3 sm:p-4">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
            <span>Comandas / Pedidos</span>
            <ShoppingCart className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-base sm:text-xl font-black text-white">{current.orders} órdenes</div>
          <div className="text-[10px] text-stone-400 mt-1">100% sincronizadas</div>
        </div>

        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-3 sm:p-4">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
            <span>Ticket Promedio</span>
            <Receipt className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-base sm:text-xl font-black text-white">{current.ticket}</div>
          <div className="text-[10px] text-sky-400 mt-1">+8.2% con sugerencias</div>
        </div>

        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-3 sm:p-4">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
            <span>Ocupación Salón</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-base sm:text-xl font-black text-white">{current.tables}</div>
          <div className="text-[10px] text-purple-400 mt-1">Rotación ágil 42m</div>
        </div>
      </div>

      {/* Grid de Contenido Principal */}
      <div className={`grid ${isCompact ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3"} gap-3`}>
        {/* Comandas Recientes */}
        <div className="lg:col-span-2 bg-stone-900/70 border border-stone-800 rounded-2xl p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Últimas Comandas en Vivo
            </h4>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold border border-emerald-500/20 animate-pulse">
              ● Sincronizado
            </span>
          </div>

          <div className="divide-y divide-stone-800/80 overflow-x-auto">
            {recentOrders.map((o) => (
              <div key={o.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{o.id}</span>
                    <span className="text-stone-300 bg-stone-800 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                      {o.table}
                    </span>
                    <span className="text-stone-500 text-[10px] hidden sm:inline">{o.waiter}</span>
                  </div>
                  <p className="text-[11px] text-stone-400 truncate mt-0.5">{o.items}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-extrabold text-amber-400 block">{o.total}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    o.status === "Cobrado"
                      ? "text-emerald-400 bg-emerald-500/10"
                      : "text-amber-400 bg-amber-500/10"
                  }`}>
                    {o.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platos Top Ventas */}
        <div className="bg-stone-900/70 border border-stone-800 rounded-2xl p-3.5 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            Platos Más Vendidos
          </h4>
          <div className="space-y-2.5">
            {topDishes.map((dish, i) => (
              <div key={dish.name} className="p-2 rounded-xl bg-stone-950/60 border border-stone-800/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 h-5 rounded-md bg-stone-800 text-stone-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <span className="font-semibold text-white block truncate">{dish.name}</span>
                    <span className="text-[10px] text-stone-400">{dish.sales} vendidos</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-stone-200 block">{dish.revenue}</span>
                  <span className="text-[9px] text-emerald-400 font-bold">{dish.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 2. MESERO / COMANDERO DEMO VIEW
// =========================================================================
export function WaiterDemoView() {
  const [selectedTable, setSelectedTable] = useState<number>(3);
  const [cart, setCart] = useState<{ id: string; name: string; price: number; qty: number }[]>([
    { id: "1", name: "Ceviche Mixto", price: 38, qty: 1 },
    { id: "2", name: "Chicha Morada 1L", price: 15, qty: 1 }
  ]);
  const [category, setCategory] = useState<"todos" | "marinos" | "criollos" | "bebidas">("todos");
  const [sentOrder, setSentOrder] = useState(false);

  const tables = [
    { num: 1, status: "ocupada", total: "S/ 84.00", people: 3 },
    { num: 2, status: "cuenta", total: "S/ 120.00", people: 4 },
    { num: 3, status: "activa", total: "S/ 53.00", people: 2 },
    { num: 4, status: "libre", total: "S/ 0.00", people: 0 },
    { num: 5, status: "ocupada", total: "S/ 65.00", people: 2 },
    { num: 6, status: "libre", total: "S/ 0.00", people: 0 }
  ];

  const menuItems = [
    { id: "1", name: "Ceviche Mixto", price: 38, category: "marinos", icon: "🐟" },
    { id: "2", name: "Chicha Morada 1L", price: 15, category: "bebidas", icon: "🥤" },
    { id: "3", name: "Lomo Saltado", price: 42, category: "criollos", icon: "🥩" },
    { id: "4", name: "Arroz con Mariscos", price: 39, category: "marinos", icon: "🍤" },
    { id: "5", name: "Causa de Pollo", price: 24, category: "criollos", icon: "🥔" },
    { id: "6", name: "Cerveza Cuzqueña", price: 12, category: "bebidas", icon: "🍺" }
  ];

  const filteredItems = category === "todos" ? menuItems : menuItems.filter((i) => i.category === category);

  const addItem = (item: (typeof menuItems)[0]) => {
    setCart((prev) => {
      const exists = prev.find((p) => p.id === item.id);
      if (exists) {
        return prev.map((p) => (p.id === item.id ? { ...p, qty: p.qty + 1 } : p));
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1 }];
    });
    setSentOrder(false);
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, qty: p.qty + delta } : p))
        .filter((p) => p.qty > 0)
    );
  };

  const total = cart.reduce((acc, curr) => acc + curr.price * curr.qty, 0);

  return (
    <div className="bg-stone-950 text-stone-100 min-h-full p-3 sm:p-5 flex flex-col gap-4 font-sans select-none">
      {/* Header Mesero */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold text-sm">
            📱
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-white leading-tight">
              Comandero de Mesas
            </h3>
            <p className="text-[11px] text-stone-400">Atendiendo: Mozo Carlos R. • Salón Principal</p>
          </div>
        </div>

        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          Mesa {selectedTable} Seleccionada
        </span>
      </div>

      {/* Selector de Mesas Rápido */}
      <div className="space-y-1.5">
        <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
          Seleccionar Mesa del Salón:
        </span>
        <div className="grid grid-cols-6 gap-2">
          {tables.map((t) => (
            <button
              key={t.num}
              onClick={() => setSelectedTable(t.num)}
              className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                selectedTable === t.num
                  ? "bg-amber-500 text-black border-amber-400 font-extrabold shadow-md scale-105"
                  : t.status === "libre"
                  ? "bg-stone-900/60 text-stone-400 border-stone-800 hover:border-stone-700"
                  : t.status === "cuenta"
                  ? "bg-red-500/20 text-red-300 border-red-500/30"
                  : "bg-stone-900 text-white border-stone-700"
              }`}
            >
              <div className="text-xs font-bold">M-{t.num}</div>
              <div className="text-[9px] capitalize">{t.status}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Contenido: Menú + Comanda Actual */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 flex-1">
        {/* Catálogo de Platos */}
        <div className="md:col-span-7 bg-stone-900/70 border border-stone-800 rounded-2xl p-3 flex flex-col gap-3">
          {/* Filtros de categoría */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {(["todos", "marinos", "criollos", "bebidas"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-2.5 py-1 rounded-lg font-semibold capitalize whitespace-nowrap cursor-pointer transition-colors ${
                  category === cat
                    ? "bg-orange-500 text-white shadow-sm"
                    : "bg-stone-800/80 text-stone-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid de productos para agregar a comanda */}
          <div className="grid grid-cols-2 gap-2 flex-1 overflow-y-auto">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => addItem(item)}
                className="p-2.5 rounded-xl bg-stone-950/80 border border-stone-800 hover:border-amber-500/60 text-left transition-all active:scale-95 cursor-pointer flex flex-col justify-between group"
              >
                <div className="flex items-start justify-between">
                  <span className="text-xl">{item.icon}</span>
                  <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 group-hover:bg-amber-500 group-hover:text-black flex items-center justify-center font-bold text-xs">
                    +
                  </span>
                </div>
                <div className="mt-2">
                  <h5 className="font-bold text-xs text-white line-clamp-1">{item.name}</h5>
                  <span className="text-amber-400 font-extrabold text-xs">S/ {item.price.toFixed(2)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Resumen de la Comanda Activa */}
        <div className="md:col-span-5 bg-stone-900 border border-stone-800 rounded-2xl p-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <span className="font-bold text-xs text-white">Comanda Mesa {selectedTable}</span>
              <span className="text-[10px] text-stone-400">{cart.length} ítems</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {cart.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-xs bg-stone-950/70 p-2 rounded-lg border border-stone-800/70">
                  <div className="min-w-0">
                    <p className="font-bold text-white truncate">{p.name}</p>
                    <span className="text-[10px] text-stone-400">S/ {(p.price * p.qty).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => updateQty(p.id, -1)}
                      className="w-5 h-5 rounded bg-stone-800 text-stone-300 hover:bg-stone-700 flex items-center justify-center cursor-pointer font-bold"
                    >
                      -
                    </button>
                    <span className="w-4 text-center font-bold text-white text-xs">{p.qty}</span>
                    <button
                      onClick={() => updateQty(p.id, 1)}
                      className="w-5 h-5 rounded bg-stone-800 text-stone-300 hover:bg-stone-700 flex items-center justify-center cursor-pointer font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-stone-800 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-400 font-semibold">Total a Cobrar:</span>
              <span className="text-base font-black text-amber-400">S/ {total.toFixed(2)}</span>
            </div>

            {sentOrder ? (
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold text-center border border-emerald-500/30 flex items-center justify-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ¡Comanda enviada a Cocina KDS!
              </div>
            ) : (
              <button
                disabled={cart.length === 0}
                onClick={() => setSentOrder(true)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                ⚡ Enviar Comanda a Cocina
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 3. CAJERO / PUNTO DE VENTA (POS) DEMO VIEW
// =========================================================================
export function CashierDemoView() {
  const [method, setMethod] = useState<"yape" | "plin" | "efectivo" | "tarjeta">("yape");
  const [amountPaid, setAmountPaid] = useState<number>(100);
  const [paidSuccess, setPaidSuccess] = useState(false);

  const orderToPay = {
    id: "#ORD-109",
    table: "Mesa 3",
    waiter: "Carlos R.",
    items: [
      { name: "Ceviche Mixto Especial", price: 38, qty: 1 },
      { name: "Chicha Morada Jarra 1L", price: 15, qty: 1 },
      { name: "Lomo Saltado Criollo", price: 42, qty: 1 }
    ],
    subtotal: 80.51,
    igv: 14.49,
    total: 95.00
  };

  const change = Math.max(0, amountPaid - orderToPay.total);

  return (
    <div className="bg-stone-950 text-stone-100 min-h-full p-3 sm:p-5 flex flex-col gap-4 font-sans select-none">
      {/* Header Caja */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-sm">
            💳
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-white leading-tight">
              Punto de Venta & Caja Rápida
            </h3>
            <p className="text-[11px] text-stone-400">Cobro de Mesa 3 • Comprobante Boleta / Factura</p>
          </div>
        </div>

        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/25">
          Caja Abierta: Turno Tarde
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 flex-1">
        {/* Desglose de Cuenta */}
        <div className="md:col-span-6 bg-stone-900/80 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-stone-800 pb-2">
              <span className="font-bold text-sm text-white">Detalle de Consumo</span>
              <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                Mesa 3
              </span>
            </div>

            <div className="space-y-2 text-xs divide-y divide-stone-800/60">
              {orderToPay.items.map((it) => (
                <div key={it.name} className="pt-2 flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-stone-200">{it.qty}x {it.name}</span>
                    <span className="text-[10px] text-stone-400 block">Cocina KDS • Despachado</span>
                  </div>
                  <span className="font-bold text-stone-300">S/ {(it.price * it.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-stone-800 space-y-1.5 text-xs">
            <div className="flex justify-between text-stone-400">
              <span>Subtotal (Op. Gravada):</span>
              <span>S/ {orderToPay.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-stone-400">
              <span>I.G.V. (18%):</span>
              <span>S/ {orderToPay.igv.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-black text-white pt-1 border-t border-stone-800">
              <span>Total a Cobrar:</span>
              <span className="text-emerald-400">S/ {orderToPay.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Pasarela y Selección de Método de Pago */}
        <div className="md:col-span-6 bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-300 block">
              Seleccionar Método de Cobro:
            </span>

            {/* Tabs de Métodos de Pago */}
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: "yape", label: "Yape", color: "purple" },
                { id: "plin", label: "Plin", color: "sky" },
                { id: "efectivo", label: "Efectivo", color: "emerald" },
                { id: "tarjeta", label: "Tarjeta", color: "amber" }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setMethod(m.id as any);
                    setPaidSuccess(false);
                  }}
                  className={`py-2 px-1 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer border ${
                    method === m.id
                      ? "bg-amber-500 text-black border-amber-400 shadow-md"
                      : "bg-stone-950 text-stone-400 border-stone-800 hover:text-white"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Contenido dinámico según el método */}
            {method === "yape" && (
              <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl bg-purple-900/60 border border-purple-400/40 flex items-center justify-center shrink-0">
                  <QrCode className="w-10 h-10 text-purple-300" />
                </div>
                <div className="text-xs">
                  <h6 className="font-bold text-white">QR Yape Oficial</h6>
                  <p className="text-[11px] text-purple-300">Komi Restobar • 987-654-321</p>
                  <span className="text-[10px] text-stone-400 block mt-1">Escaneo directo y confirmación inmediata</span>
                </div>
              </div>
            )}

            {method === "plin" && (
              <div className="p-3 rounded-xl bg-sky-950/20 border border-sky-500/30 flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl bg-sky-900/60 border border-sky-400/40 flex items-center justify-center shrink-0">
                  <QrCode className="w-10 h-10 text-sky-300" />
                </div>
                <div className="text-xs">
                  <h6 className="font-bold text-white">QR Plin Oficial</h6>
                  <p className="text-[11px] text-sky-300">Komi Restobar • BBVA/Interbank</p>
                  <span className="text-[10px] text-stone-400 block mt-1">Validación en caja sin comisiones</span>
                </div>
              </div>
            )}

            {method === "efectivo" && (
              <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Monto recibido del cliente:</span>
                  <div className="flex gap-1.5">
                    {[100, 150, 200].map((val) => (
                      <button
                        key={val}
                        onClick={() => setAmountPaid(val)}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                          amountPaid === val ? "bg-amber-500 text-black" : "bg-stone-800 text-stone-300"
                        }`}
                      >
                        S/ {val}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between font-bold text-emerald-400 pt-1 border-t border-stone-800">
                  <span>Vuelto a entregar:</span>
                  <span className="text-sm font-black">S/ {change.toFixed(2)}</span>
                </div>
              </div>
            )}

            {method === "tarjeta" && (
              <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex items-center gap-3 text-xs">
                <CreditCard className="w-6 h-6 text-amber-400 shrink-0" />
                <div>
                  <span className="font-bold text-white block">POS Izipay / Niubiz</span>
                  <span className="text-[11px] text-stone-400">Visa, Mastercard, Amex • Enlace automático</span>
                </div>
              </div>
            )}
          </div>

          <div>
            {paidSuccess ? (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-center text-xs font-bold space-y-1 animate-in fade-in">
                <div className="flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>¡Venta Procesada con Éxito!</span>
                </div>
                <p className="text-[10px] text-stone-300">Ticket B001-00428 emitido • Mesa 3 liberada</p>
              </div>
            ) : (
              <button
                onClick={() => setPaidSuccess(true)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Cobrar S/ {orderToPay.total.toFixed(2)} & Imprimir Boleta</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 4. COCINERO / COCINA KDS DEMO VIEW
// =========================================================================
export function ChefDemoView() {
  const [orders, setOrders] = useState([
    {
      id: "#K-401",
      table: "Mesa 2",
      waiter: "Lucía M.",
      time: "Hace 3 min",
      status: "nuevo",
      items: [
        { name: "Ceviche Mixto", notes: "Sin rocoto, bien helado", qty: 2 },
        { name: "Chicharrón de Calamar", notes: "Yucas doradas extras", qty: 1 }
      ]
    },
    {
      id: "#K-400",
      table: "Mesa 5",
      waiter: "Carlos R.",
      time: "Hace 8 min",
      status: "preparando",
      items: [
        { name: "Lomo Saltado Criollo", notes: "Término 3/4 jugoso", qty: 2 },
        { name: "Arroz con Mariscos", notes: "Poco picante", qty: 1 }
      ]
    },
    {
      id: "#K-399",
      table: "Delivery #12",
      waiter: "Tienda Online",
      time: "Hace 14 min",
      status: "listo",
      items: [
        { name: "Pollo a la Brasa 1/2", notes: "Papas crocantes + táper", qty: 1 },
        { name: "Tequeños de Queso (8u)", notes: "Guacamole extra", qty: 1 }
      ]
    }
  ]);

  const updateStatus = (id: string, nextStatus: "preparando" | "listo") => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: nextStatus } : o))
    );
  };

  return (
    <div className="bg-stone-950 text-stone-100 min-h-full p-3 sm:p-5 flex flex-col gap-4 font-sans select-none">
      {/* Header Cocina KDS */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center font-bold text-sm">
            👨‍🍳
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-white leading-tight">
              Pantalla de Cocina (KDS)
            </h3>
            <p className="text-[11px] text-stone-400">Área Caliente & Fría • 3 Comandas en preparación</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-900 border border-stone-800 text-stone-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" /> Tiempo Prom: 11m
          </span>
        </div>
      </div>

      {/* Columnas Kanban de Cocina */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1 overflow-y-auto">
        {/* Columna 1: Nuevos */}
        <div className="bg-stone-900/50 border border-stone-800 rounded-2xl p-3 flex flex-col gap-2.5">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <span className="font-bold text-xs text-orange-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              Nuevos ({orders.filter((o) => o.status === "nuevo").length})
            </span>
          </div>

          <div className="space-y-2">
            {orders
              .filter((o) => o.status === "nuevo")
              .map((o) => (
                <div key={o.id} className="p-3 rounded-xl bg-stone-900 border border-orange-500/40 space-y-2 shadow-md">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-black text-white">{o.id} • {o.table}</span>
                    <span className="text-[10px] text-orange-400 font-bold bg-orange-500/15 px-2 py-0.5 rounded">
                      {o.time}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {o.items.map((it, idx) => (
                      <div key={idx} className="bg-stone-950/80 p-2 rounded-lg border border-stone-800">
                        <span className="font-bold text-white">{it.qty}x {it.name}</span>
                        {it.notes && (
                          <p className="text-[10px] text-amber-300/90 font-medium">⚠️ {it.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => updateStatus(o.id, "preparando")}
                    className="w-full py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    ▶ Empezar a Cocinar
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Columna 2: En Preparación */}
        <div className="bg-stone-900/50 border border-stone-800 rounded-2xl p-3 flex flex-col gap-2.5">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <span className="font-bold text-xs text-amber-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-spin" />
              En Preparación ({orders.filter((o) => o.status === "preparando").length})
            </span>
          </div>

          <div className="space-y-2">
            {orders
              .filter((o) => o.status === "preparando")
              .map((o) => (
                <div key={o.id} className="p-3 rounded-xl bg-stone-900 border border-amber-500/40 space-y-2 shadow-md">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-black text-white">{o.id} • {o.table}</span>
                    <span className="text-[10px] text-amber-400 font-bold bg-amber-500/15 px-2 py-0.5 rounded">
                      {o.time}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {o.items.map((it, idx) => (
                      <div key={idx} className="bg-stone-950/80 p-2 rounded-lg border border-stone-800">
                        <span className="font-bold text-white">{it.qty}x {it.name}</span>
                        {it.notes && (
                          <p className="text-[10px] text-amber-300/90 font-medium">⚠️ {it.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => updateStatus(o.id, "listo")}
                    className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    ✓ Marcar como Listo
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Columna 3: Listos para Servir */}
        <div className="bg-stone-900/50 border border-stone-800 rounded-2xl p-3 flex flex-col gap-2.5">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <span className="font-bold text-xs text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Listo para Servir ({orders.filter((o) => o.status === "listo").length})
            </span>
          </div>

          <div className="space-y-2">
            {orders
              .filter((o) => o.status === "listo")
              .map((o) => (
                <div key={o.id} className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2 shadow-sm">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-black text-white">{o.id} • {o.table}</span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded">
                      Notificado a Mozo
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-stone-300">
                    {o.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{it.qty}x {it.name}</span>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 5. CARTA DIGITAL QR & TIENDA ONLINE DEMO VIEW
// =========================================================================
export function StorefrontDemoView() {
  const [cartItems, setCartItems] = useState<{ id: string; name: string; price: number; taper: number; qty: number }[]>([
    { id: "1", name: "Ceviche Carretillero", price: 36, taper: 1, qty: 1 }
  ]);
  const [showCart, setShowCart] = useState(false);

  const dishes = [
    { id: "1", name: "Ceviche Carretillero", price: 36, desc: "Pescado fresco, chicharrón de pota y leche de tigre.", icon: "🐟", taper: 1 },
    { id: "2", name: "Lomo Saltado Jugoso", price: 40, desc: "Trozos de lomo fino, cebolla, tomate y papas fritas.", icon: "🥩", taper: 1 },
    { id: "3", name: "Arroz con Mariscos", price: 38, desc: "Arroz criollo con mixtura de mariscos y parmesano.", icon: "🍤", taper: 1 },
    { id: "4", name: "Chicha Morada Botella (500ml)", price: 8, desc: "Elaborada con maíz morado y frutas naturales.", icon: "🥤", taper: 0 }
  ];

  const addToCart = (d: (typeof dishes)[0]) => {
    setCartItems((prev) => {
      const exists = prev.find((p) => p.id === d.id);
      if (exists) {
        return prev.map((p) => (p.id === d.id ? { ...p, qty: p.qty + 1 } : p));
      }
      return [...prev, { id: d.id, name: d.name, price: d.price, taper: d.taper, qty: 1 }];
    });
  };

  const subtotal = cartItems.reduce((acc, it) => acc + it.price * it.qty, 0);
  const totalTaper = cartItems.reduce((acc, it) => acc + it.taper * it.qty, 0);
  const grandTotal = subtotal + totalTaper;

  return (
    <div className="bg-stone-950 text-stone-100 min-h-full p-3 sm:p-5 flex flex-col gap-3 font-sans select-none relative">
      {/* Banner / Portada de la Tienda */}
      <div className="relative rounded-2xl overflow-hidden h-28 sm:h-32 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-4 flex flex-col justify-end border border-amber-500/30">
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] text-amber-300 font-bold border border-white/10">
          Abierto • Delivery & Pick-up
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-full overflow-hidden bg-white shrink-0 border-2 border-white/60 shadow-lg">
            <Image src="/logokomi.png" alt="Komi" fill className="object-cover scale-[1.2]" unoptimized />
          </div>
          <div>
            <h3 className="font-black text-white text-base sm:text-lg leading-tight">
              Komi Restobar
            </h3>
            <p className="text-[11px] text-white/90">Cocina Marina & Criolla • Pedidos directos a WhatsApp</p>
          </div>
        </div>
      </div>

      {/* Grid de Platos del Catálogo */}
      <div className="space-y-2 flex-1 overflow-y-auto">
        <div className="flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-wider">
          <span>Platos Recomendados de la Carta</span>
          <span>4 opciones</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {dishes.map((dish) => (
            <div
              key={dish.id}
              className="p-3 rounded-xl bg-stone-900 border border-stone-800 hover:border-amber-500/50 flex justify-between items-center gap-2 transition-all"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{dish.icon}</span>
                  <h5 className="font-bold text-xs text-white truncate">{dish.name}</h5>
                </div>
                <p className="text-[10px] text-stone-400 line-clamp-1 mt-0.5">{dish.desc}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-extrabold text-amber-400 text-xs">S/ {dish.price.toFixed(2)}</span>
                  {dish.taper > 0 ? (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                      🥡 Táper +S/ {dish.taper.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-[9px] text-stone-500">Exento de táper</span>
                  )}
                </div>
              </div>

              <button
                onClick={() => addToCart(dish)}
                className="w-7 h-7 rounded-lg bg-orange-600 hover:bg-orange-500 text-white flex items-center justify-center font-bold text-xs shrink-0 cursor-pointer shadow-md active:scale-90 transition-all"
                title="Agregar al pedido"
              >
                +
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Barra Flotante de Carrito */}
      {cartItems.length > 0 && (
        <div className="pt-2 border-t border-stone-800 flex items-center justify-between gap-3 text-xs bg-stone-950">
          <div>
            <span className="text-stone-400 block text-[10px]">
              {cartItems.length} ítems • Incluye S/ {totalTaper.toFixed(2)} táperes
            </span>
            <span className="font-black text-sm text-emerald-400">Total: S/ {grandTotal.toFixed(2)}</span>
          </div>

          <a
            href="https://wa.me/51987654321?text=Hola%20Komi%20Restobar,%20deseo%20confirmar%20este%20pedido%20de%20demostracion."
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg flex items-center gap-1.5 transition-all"
          >
            <span>Pedir por WhatsApp</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}
