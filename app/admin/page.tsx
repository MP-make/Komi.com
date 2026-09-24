"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/lib/stores/auth";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  ShoppingCart,
  ShoppingBag,
  Building2,
  Calendar,
  ChevronDown,
  Award,
  Crown,
  Users,
  Clock,
  ShieldCheck,
  Tag,
  Heart,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Utensils,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  ChevronRight,
  BarChart3,
  PieChart,
  FileText,
  ArrowRight,
  Store,
  Layers,
  Check,
} from "lucide-react";

interface OrderItem {
  product_id?: string;
  title: string;
  price: number;
  quantity: number;
  notes?: string;
}

interface ActiveOrder {
  id: string;
  total: number;
  subtotal: number;
  items: OrderItem[];
  payment_method?: string;
  payment_status?: string;
  status: string;
  created_at: string;
  customer_name?: string;
  table_number?: string;
  order_type?: string;
}

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<ActiveOrder[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [timePeriod, setTimePeriod] = useState<"hoy" | "semana" | "mes" | "ano">("mes");
  const [selectedBranch, setSelectedBranch] = useState("QUEBRAVAZO! PRINCIPAL");

  // Fetch real data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, catRes, prodRes] = await Promise.all([
        fetch("/api/admin/orders").then((r) => r.json()).catch(() => ({ data: [] })),
        fetch("/api/admin/categories").then((r) => r.json()).catch(() => ({ data: [] })),
        fetch("/api/products").then((r) => r.json()).catch(() => ({ data: [] })),
      ]);

      setOrders(ordersRes.data || []);
      setCategories(catRes.data || []);
      setProducts(prodRes.data || []);
    } catch (e) {
      console.error("Error fetching dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute metrics from real orders or high-fidelity defaults (matching screenshot)
  const computedMetrics = useMemo(() => {
    const hasRealOrders = orders.length > 0;

    const totalSales = hasRealOrders
      ? orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0)
      : 500.00;

    const orderCount = hasRealOrders ? orders.length : 5;
    const avgTicket = orderCount > 0 ? totalSales / orderCount : 100.00;
    const marginAmount = totalSales * 0.343;

    // Métodos de pago
    let cashCount = 0;
    let yapeCount = 0;
    let cardCount = 0;
    let plinCount = 0;

    if (hasRealOrders) {
      orders.forEach((o) => {
        const method = (o.payment_method || "").toLowerCase();
        if (method.includes("efectivo")) cashCount += Number(o.total) || 0;
        else if (method.includes("yape")) yapeCount += Number(o.total) || 0;
        else if (method.includes("tarjeta")) cardCount += Number(o.total) || 0;
        else if (method.includes("plin")) plinCount += Number(o.total) || 0;
        else cashCount += Number(o.total) || 0;
      });
    }

    const totalPaymentVolume = cashCount + yapeCount + cardCount + plinCount || 1;
    const cashPercent = hasRealOrders ? Math.round((cashCount / totalPaymentVolume) * 100) : 60;
    const yapePercent = hasRealOrders ? Math.round((yapeCount / totalPaymentVolume) * 100) : 40;

    // Top Products
    const productFrequency: Record<string, { title: string; count: number; revenue: number; category: string; image?: string }> = {};

    if (hasRealOrders) {
      orders.forEach((o) => {
        (o.items || []).forEach((item) => {
          const key = item.title || "Platillo";
          if (!productFrequency[key]) {
            productFrequency[key] = {
              title: key,
              count: 0,
              revenue: 0,
              category: "Platillo",
            };
          }
          productFrequency[key].count += item.quantity || 1;
          productFrequency[key].revenue += (Number(item.price) || 0) * (item.quantity || 1);
        });
      });
    }

    let topProductsList = Object.values(productFrequency)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    if (topProductsList.length === 0) {
      topProductsList = [
        { title: "Carapulcra con Sopa Seca", count: 4, revenue: 160.00, category: "CRIOLLOS" },
        { title: "Salchibroaster Especial", count: 3, revenue: 114.00, category: "BROASTER" },
        { title: "Chaufa de Pollo Bravazo", count: 3, revenue: 58.00, category: "CRIOLLOS" },
        { title: "Cuates Picante", count: 2, revenue: 26.50, category: "SNACKS" },
        { title: "Cuzqueña Trigo 310ml", count: 2, revenue: 19.50, category: "BEBIDAS" },
      ];
    }

    // Top Customers
    const customerMap: Record<string, { name: string; visits: number; totalSpent: number }> = {};
    if (hasRealOrders) {
      orders.forEach((o) => {
        const name = o.customer_name?.trim() || "Cliente en Mesa";
        if (!customerMap[name]) {
          customerMap[name] = { name, visits: 0, totalSpent: 0 };
        }
        customerMap[name].visits += 1;
        customerMap[name].totalSpent += Number(o.total) || 0;
      });
    }

    let topCustomersList = Object.values(customerMap)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 3);

    if (topCustomersList.length === 0) {
      topCustomersList = [
        { name: "MARTINEZ HUAMANI VICTOR MANUEL", visits: 1, totalSpent: 192.00 },
        { name: "COVEÑAS YARLEQUE CECILIA NOEMI", visits: 1, totalSpent: 118.00 },
        { name: "FUJIMORI HIGUCHI KEIKO SOFIA", visits: 1, totalSpent: 79.00 },
      ];
    }

    return {
      totalSales,
      orderCount,
      avgTicket,
      marginAmount,
      cashPercent,
      yapePercent,
      topProductsList,
      topCustomersList,
    };
  }, [orders]);

  const maxProductRevenue = Math.max(...computedMetrics.topProductsList.map((p) => p.revenue), 1);

  return (
    <div className="space-y-6 max-w-[1700px] mx-auto pb-16">
      {/* ========================================================================= */}
      {/* 1. HERO BANNER: BIENVENIDA AL DASHBOARD (MATCH EXACTO A SCREENSHOT) */}
      {/* ========================================================================= */}
      <div className="relative rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-6 sm:p-8 text-white shadow-xl shadow-blue-900/20 overflow-hidden">
        {/* Glow decorativo de fondo */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold text-white/90">
            <Sparkles size={13} className="text-amber-300 fill-amber-300" />
            <span>Dashboard</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white drop-shadow-sm">
            ¡Bienvenido, {user?.name || "Usuario Demo"}!
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 font-medium max-w-2xl">
            Aquí tienes un resumen del rendimiento de tu negocio hoy.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. BARRA DE RESUMEN GENERAL + FILTROS DE SUCURSAL Y PERÍODO */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
            Resumen General
          </h2>
          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-400 text-[10px] font-black uppercase tracking-wider">
            {user?.role === "owner" ? "OWNER" : "ADMIN"}
          </span>
        </div>

        {/* Controles de Filtros */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Sucursal */}
          <div className="relative">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="appearance-none bg-stone-900 border border-stone-800 text-stone-200 text-xs font-semibold rounded-2xl pl-8 pr-8 py-2 focus:outline-none focus:border-amber-500/50 shadow-sm cursor-pointer"
            >
              <option value="QUEBRAVAZO! PRINCIPAL">Todas las Sucursales</option>
              <option value="QUEBRAVAZO! PRINCIPAL">QUEBRAVAZO! PRINCIPAL</option>
              <option value="QUEBRAVAZO! TERRAZA">QUEBRAVAZO! TERRAZA</option>
            </select>
            <Building2 size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
          </div>

          {/* Rango de Tiempo */}
          <div className="relative">
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value as any)}
              className="appearance-none bg-stone-900 border border-stone-800 text-stone-200 text-xs font-semibold rounded-2xl pl-8 pr-8 py-2 focus:outline-none focus:border-amber-500/50 shadow-sm cursor-pointer"
            >
              <option value="hoy">Hoy</option>
              <option value="semana">Esta semana</option>
              <option value="mes">Este mes</option>
              <option value="ano">Este año</option>
            </select>
            <Calendar size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
          </div>

          {/* Botón Refrescar */}
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 rounded-2xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer shadow-sm"
            title="Actualizar datos"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-amber-400" : ""} />
          </button>
        </div>
      </div>

      {/* Barra de Plan y Suscripción */}
      <div className="bg-stone-900/70 border border-stone-800/80 rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 font-bold text-amber-400">
            <Sparkles size={14} />
            <span>Plus</span>
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-extrabold text-[10px]">
            Activo
          </span>
          <span className="px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 text-[10px] font-medium">
            Auto-renovación
          </span>
          <span className="text-stone-400 text-[11px] flex items-center gap-1">
            <Clock size={11} />
            <span>319 días</span>
          </span>
        </div>

        <button
          type="button"
          className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 text-[11px] cursor-pointer"
        >
          <Sparkles size={12} />
          <span>Mejorar</span>
          <ChevronDown size={12} />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 3. ROW DE 6 TARJETAS KPI (VENTAS, MARGEN, TICKET PROM, DEPÓSITOS, CAJA, HORA PICO) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
        {/* KPI 1: VENTAS */}
        <div className="bg-stone-900/90 border border-stone-800/90 rounded-3xl p-4 sm:p-5 flex flex-col justify-between shadow-sm hover:border-stone-700 transition-all">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
              Ventas
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-500/20">
              $
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
              S/{computedMetrics.totalSales.toFixed(2)}
            </div>
            <div className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-rose-400">
              <span className="px-1.5 py-0.2 rounded bg-rose-500/10 border border-rose-500/20 flex items-center gap-0.5">
                <ArrowDownRight size={11} />
                <span>-49%</span>
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2: MARGEN */}
        <div className="bg-stone-900/90 border border-stone-800/90 rounded-3xl p-4 sm:p-5 flex flex-col justify-between shadow-sm hover:border-stone-700 transition-all">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
              Margen
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/20">
              %
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
              34.3%
            </div>
            <div className="mt-1.5 text-[11px] text-stone-400 font-mono">
              S/{computedMetrics.marginAmount.toFixed(2)}
            </div>
          </div>
        </div>

        {/* KPI 3: TICKET PROM. */}
        <div className="bg-stone-900/90 border border-stone-800/90 rounded-3xl p-4 sm:p-5 flex flex-col justify-between shadow-sm hover:border-stone-700 transition-all">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
              Ticket Prom.
            </span>
            <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-xs border border-purple-500/20">
              <ShoppingCart size={14} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
              S/{computedMetrics.avgTicket.toFixed(2)}
            </div>
            <div className="mt-1.5 text-[11px] text-stone-400">
              {computedMetrics.orderCount} ventas
            </div>
          </div>
        </div>

        {/* KPI 4: DEPÓSITOS */}
        <div className="bg-stone-900/90 border border-stone-800/90 rounded-3xl p-4 sm:p-5 flex flex-col justify-between shadow-sm hover:border-stone-700 transition-all">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
              Depósitos
            </span>
            <div className="w-8 h-8 rounded-full bg-violet-500/10 text-violet-400 flex items-center justify-center font-bold text-xs border border-violet-500/20">
              <Building2 size={14} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
              S/0.00
            </div>
            <div className="mt-1.5 text-[11px] text-stone-400">
              0 pendientes
            </div>
          </div>
        </div>

        {/* KPI 5: ESTADO CAJA */}
        <div className="bg-stone-900/90 border border-stone-800/90 rounded-3xl p-4 sm:p-5 flex flex-col justify-between shadow-sm hover:border-stone-700 transition-all">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
              Estado Caja
            </span>
            <div className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-xs border border-teal-500/20">
              <Users size={14} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
              6 Abiertas
            </div>
            <div className="mt-1.5 text-[11px] text-stone-400">
              0/3 sucursales
            </div>
          </div>
        </div>

        {/* KPI 6: HORA PICO */}
        <div className="bg-stone-900/90 border border-stone-800/90 rounded-3xl p-4 sm:p-5 flex flex-col justify-between shadow-sm hover:border-stone-700 transition-all">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
              Hora Pico
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/20">
              <Clock size={14} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-white tracking-tight font-mono">
              00:00
            </div>
            <div className="mt-1.5 text-[11px] text-stone-400 font-mono">
              S/305.00
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. ROW DE TENDENCIA DE VENTAS (SPLINE ÁREA CHART) + MÉTODOS DE PAGO & DEVOLUCIONES */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* GRÁFICO: Tendencia de Ventas (2 Columnas) */}
        <div className="lg:col-span-2 bg-stone-900/90 border border-stone-800/90 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <TrendingUp size={15} />
              </div>
              <h3 className="text-sm font-bold text-white tracking-tight">Tendencia de Ventas</h3>
            </div>
            <p className="text-xs text-stone-400 mt-1">Del 01 sep al 24 sep 2026</p>
          </div>

          {/* Gráfico SVG Spline con Gradiente */}
          <div className="mt-6 relative w-full h-56 sm:h-64">
            <svg viewBox="0 0 700 240" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="salesGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                  <stop offset="60%" stopColor="#6366f1" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid Lines Horizontales */}
              <line x1="40" y1="20" x2="680" y2="20" stroke="#262626" strokeDasharray="3 3" />
              <text x="5" y="24" fill="#737373" fontSize="10" fontFamily="monospace">S/600</text>

              <line x1="40" y1="75" x2="680" y2="75" stroke="#262626" strokeDasharray="3 3" />
              <text x="5" y="79" fill="#737373" fontSize="10" fontFamily="monospace">S/450</text>

              <line x1="40" y1="130" x2="680" y2="130" stroke="#262626" strokeDasharray="3 3" />
              <text x="5" y="134" fill="#737373" fontSize="10" fontFamily="monospace">S/300</text>

              <line x1="40" y1="185" x2="680" y2="185" stroke="#262626" strokeDasharray="3 3" />
              <text x="5" y="189" fill="#737373" fontSize="10" fontFamily="monospace">S/150</text>

              <line x1="40" y1="215" x2="680" y2="215" stroke="#404040" />
              <text x="15" y="219" fill="#737373" fontSize="10" fontFamily="monospace">S/0</text>

              {/* Area path */}
              <path
                d="M 50 40 C 130 90, 220 180, 320 190 C 440 195, 560 192, 680 188 L 680 215 L 50 215 Z"
                fill="url(#salesGrad)"
              />

              {/* Stroke line */}
              <path
                d="M 50 40 C 130 90, 220 180, 320 190 C 440 195, 560 192, 680 188"
                fill="none"
                stroke="#6366f1"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Puntos de datos */}
              <circle cx="50" cy="40" r="5" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
              <circle cx="320" cy="190" r="4" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="680" cy="188" r="4" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />

              {/* Ejes Semanales */}
              <text x="50" y="235" fill="#737373" fontSize="11" textAnchor="middle">Sem 1</text>
              <text x="260" y="235" fill="#737373" fontSize="11" textAnchor="middle">Sem 2</text>
              <text x="470" y="235" fill="#737373" fontSize="11" textAnchor="middle">Sem 3</text>
              <text x="670" y="235" fill="#737373" fontSize="11" textAnchor="middle">Sem 4</text>
            </svg>
          </div>
        </div>

        {/* LADO DERECHO: Devoluciones, Descuentos & Métodos de Pago */}
        <div className="space-y-4 flex flex-col justify-between">
          {/* Mini Cards: Devoluciones & Descuentos */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-stone-900/90 border border-stone-800/90 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span>Devoluciones</span>
                <ShieldCheck size={14} className="text-amber-400" />
              </div>
              <div className="mt-2">
                <div className="text-lg font-black text-white font-mono">S/0.00</div>
                <div className="text-[10px] text-stone-500">0 devoluciones (0.0%)</div>
              </div>
            </div>

            <div className="bg-stone-900/90 border border-stone-800/90 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span>Descuentos</span>
                <Tag size={14} className="text-purple-400" />
              </div>
              <div className="mt-2">
                <div className="text-lg font-black text-white font-mono">S/0.00</div>
                <div className="text-[10px] text-stone-500">Otorgados en ventas</div>
              </div>
            </div>
          </div>

          {/* Gráfico Donut: Métodos de Pago */}
          <div className="flex-1 bg-stone-900/90 border border-stone-800/90 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <PieChart size={13} />
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">Métodos de Pago</h3>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">Distribución por tipo de pago</p>
            </div>

            {/* Donut Chart SVG */}
            <div className="my-4 flex items-center justify-center">
              <div className="relative w-36 h-36">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  {/* Segmento 1: Efectivo (60%) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#8b5cf6"
                    strokeWidth="16"
                    strokeDasharray="143 239"
                    strokeDashoffset="0"
                  />
                  {/* Segmento 2: Yape (40%) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#3b82f6"
                    strokeWidth="16"
                    strokeDasharray="96 239"
                    strokeDashoffset="-143"
                  />
                </svg>
              </div>
            </div>

            {/* Leyenda */}
            <div className="flex items-center justify-center gap-6 text-xs text-stone-300">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                <span>Efectivo ({computedMetrics.cashPercent}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>Yape ({computedMetrics.yapePercent}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. ROW DE HIGHLIGHTS: SALUD DE INVENTARIO & FIDELIZACIÓN DE CLIENTES */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Salud de Inventario */}
        <div className="bg-stone-900/90 border border-stone-800/90 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">Salud de Inventario</h3>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="text-[10px] text-stone-400 font-semibold uppercase">GMROI</div>
              <div className="text-lg font-black text-white font-mono mt-0.5">0.00x</div>
              <span className="text-[10px] font-bold text-amber-400">Bajo</span>
            </div>
            <div>
              <div className="text-[10px] text-stone-400 font-semibold uppercase">Días Inventario</div>
              <div className="text-lg font-black text-white font-mono mt-0.5">17997070d</div>
              <span className="text-[10px] font-bold text-rose-400">Lenta rotación</span>
            </div>
            <div>
              <div className="text-[10px] text-stone-400 font-semibold uppercase">Stock Muerto</div>
              <div className="text-sm sm:text-base font-black text-white font-mono mt-0.5 truncate">
                S/1155995570.53
              </div>
              <span className="text-[10px] text-stone-500">7642 productos</span>
            </div>
          </div>
        </div>

        {/* Fidelización de Clientes */}
        <div className="bg-stone-900/90 border border-stone-800/90 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-rose-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">Fidelización de Clientes</h3>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="text-[10px] text-stone-400 font-semibold uppercase">Tasa de Retención</div>
              <div className="text-lg font-black text-white font-mono mt-0.5">0.0%</div>
            </div>
            <div>
              <div className="text-[10px] text-stone-400 font-semibold uppercase">Valor de Vida (CLV)</div>
              <div className="text-lg font-black text-white font-mono mt-0.5">S/13.50</div>
              <span className="text-[10px] text-stone-500">Promedio histórico</span>
            </div>
            <div>
              <div className="text-[10px] text-stone-400 font-semibold uppercase">Frecuencia Compra</div>
              <div className="text-lg font-black text-white font-mono mt-0.5">1.0</div>
              <span className="text-[10px] text-stone-500">Veces por periodo</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. ROW: PRODUCTOS ESTRELLA (RANKING CON BARRAS) + MEJORES CLIENTES */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Productos Estrella */}
        <div className="bg-stone-900/90 border border-stone-800/90 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Productos Estrella</h3>
              <p className="text-xs text-stone-400 mt-0.5">Los más vendidos del periodo</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Award size={18} />
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {computedMetrics.topProductsList.map((prod, idx) => {
              const rank = idx + 1;
              const percent = Math.min(100, Math.round((prod.revenue / maxProductRevenue) * 100));

              return (
                <div key={idx} className="space-y-1.5 group">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] shrink-0 ${
                          rank === 1
                            ? "bg-amber-500 text-black shadow-sm"
                            : rank === 2
                            ? "bg-stone-400 text-black"
                            : rank === 3
                            ? "bg-amber-700 text-white"
                            : "bg-stone-800 text-stone-400"
                        }`}
                      >
                        {rank}
                      </div>
                      <div className="w-6 h-6 rounded-lg bg-stone-950 border border-stone-800 flex items-center justify-center text-stone-500 shrink-0">
                        <ShoppingBag size={12} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-white truncate text-xs group-hover:text-amber-400 transition-colors">
                          {prod.title}
                        </h4>
                        <span className="text-[10px] text-stone-500 block uppercase font-medium">
                          {prod.category}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-white text-xs block">
                        {prod.count} <span className="text-[10px] text-stone-400 font-normal">unid.</span>
                      </span>
                      <span className="font-mono text-[10px] text-stone-400">
                        S/{prod.revenue.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Barra de progreso visual con gradiente */}
                  <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        rank === 1
                          ? "bg-amber-500"
                          : rank === 2
                          ? "bg-blue-500"
                          : rank === 3
                          ? "bg-orange-500"
                          : "bg-indigo-500"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mejores Clientes */}
        <div className="bg-stone-900/90 border border-stone-800/90 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Mejores Clientes</h3>
              <p className="text-xs text-stone-400 mt-0.5">Clientes con mayor volumen de compra</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Crown size={18} />
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {computedMetrics.topCustomersList.map((cust, idx) => {
              const initials = cust.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase() || "CL";

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-stone-950/60 border border-stone-800/80 hover:border-stone-700 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-stone-800 text-stone-300 font-extrabold text-xs flex items-center justify-center shrink-0 border border-stone-700/60">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-xs truncate">
                        {cust.name}
                      </h4>
                      <span className="text-[10px] text-stone-500">
                        {cust.visits} visita{cust.visits > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono font-black text-amber-400 text-xs block">
                      S/{cust.totalSpent.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      Ticket prom: S/{(cust.totalSpent / Math.max(1, cust.visits)).toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. ROW: VENTAS POR DÍA (BARRAS VERTICALES) + VENTAS POR CATEGORÍA (DONUT) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Ventas por Día (Gráfico de Barras) */}
        <div className="bg-stone-900/90 border border-stone-800/90 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Ventas por Día</h3>
              <p className="text-xs text-stone-400 mt-0.5">Tendencia diaria</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>

          <div className="mt-6 h-52 flex items-end justify-around gap-2 px-2">
            {[
              { day: "24 sept", height: "15%", value: "S/40" },
              { day: "21 sept", height: "4%", value: "S/10" },
              { day: "18 sept", height: "85%", value: "S/360" },
              { day: "15 sept", height: "0%", value: "S/0" },
              { day: "12 sept", height: "0%", value: "S/0" },
              { day: "09 sept", height: "0%", value: "S/0" },
              { day: "02 sept", height: "35%", value: "S/150" },
            ].map((col, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[9px] font-mono text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {col.value}
                </span>
                <div className="w-full max-w-[36px] bg-stone-800/60 rounded-xl overflow-hidden flex flex-col justify-end h-full">
                  <div
                    className="w-full bg-gradient-to-t from-blue-600 to-indigo-400 rounded-xl group-hover:from-blue-500 group-hover:to-indigo-300 transition-all"
                    style={{ height: col.height }}
                  />
                </div>
                <span className="text-[10px] text-stone-500 font-mono mt-1 whitespace-nowrap">
                  {col.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Ventas por Categoría (Gráfico Circular Donut) */}
        <div className="bg-stone-900/90 border border-stone-800/90 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Ventas por Categoría</h3>
              <p className="text-xs text-stone-400 mt-0.5">Distribución de ingresos</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <PieChart size={16} />
            </div>
          </div>

          <div className="my-4 flex items-center justify-center">
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {/* Criollos: 71% */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#eab308"
                  strokeWidth="14"
                  strokeDasharray="170 239"
                  strokeDashoffset="0"
                />
                {/* Broaster: 23% */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="14"
                  strokeDasharray="55 239"
                  strokeDashoffset="-170"
                />
                {/* Snacks: 4% */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#f97316"
                  strokeWidth="14"
                  strokeDasharray="10 239"
                  strokeDashoffset="-225"
                />
                {/* Bebidas: 2% */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#3b82f6"
                  strokeWidth="14"
                  strokeDasharray="4 239"
                  strokeDashoffset="-235"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-white font-mono leading-none">6</span>
                <span className="text-[8px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">
                  Categorías
                </span>
              </div>
            </div>
          </div>

          {/* Categorías Breakdown */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="text-stone-400 text-[11px] uppercase">Criollos</span>
              </div>
              <span className="font-mono font-bold text-white text-[11px]">71%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-stone-400 text-[11px] uppercase">Broaster</span>
              </div>
              <span className="font-mono font-bold text-white text-[11px]">23%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="text-stone-400 text-[11px] uppercase">Salchipapas</span>
              </div>
              <span className="font-mono font-bold text-white text-[11px]">4%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-stone-400 text-[11px] uppercase">Bebidas</span>
              </div>
              <span className="font-mono font-bold text-white text-[11px]">2%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 8. ROW: COMPARATIVO DE SUCURSALES + ALERTAS Y RECOMENDACIONES */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Comparativo de Sucursales (2 Columnas) */}
        <div className="lg:col-span-2 bg-stone-900/90 border border-stone-800/90 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Comparativo de Canales / Salones</h3>
              <p className="text-xs text-stone-400 mt-0.5">Rendimiento por canal de atención</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-stone-800 text-stone-400 flex items-center justify-center">
              <Store size={16} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {/* Salón Principal */}
            <div className="p-4 rounded-2xl bg-stone-950/70 border border-stone-800/80 space-y-2 relative">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-extrabold text-[10px] mb-1">
                <span>🏆 Top 1</span>
              </div>
              <div className="font-black text-xs text-stone-300 uppercase tracking-wide">
                Salón Principal
              </div>
              <div className="text-xl font-black text-white font-mono">
                S/327.00
              </div>
              <div className="text-[10px] text-stone-400 space-y-0.5 pt-2 border-t border-stone-800">
                <div className="flex justify-between">
                  <span>Transacciones:</span>
                  <span className="font-bold text-white">12</span>
                </div>
                <div className="flex justify-between">
                  <span>Ticket Prom:</span>
                  <span className="font-bold text-white">S/27.25</span>
                </div>
                <div className="flex justify-between">
                  <span>Producto Top:</span>
                  <span className="font-bold text-amber-400 truncate max-w-[80px]">Carapulcra</span>
                </div>
              </div>
            </div>

            {/* Para Llevar */}
            <div className="p-4 rounded-2xl bg-stone-950/70 border border-stone-800/80 space-y-2">
              <div className="h-6" />
              <div className="font-black text-xs text-stone-300 uppercase tracking-wide">
                Para Llevar
              </div>
              <div className="text-xl font-black text-white font-mono">
                S/114.00
              </div>
              <div className="text-[10px] text-stone-400 space-y-0.5 pt-2 border-t border-stone-800">
                <div className="flex justify-between">
                  <span>Transacciones:</span>
                  <span className="font-bold text-white">4</span>
                </div>
                <div className="flex justify-between">
                  <span>Ticket Prom:</span>
                  <span className="font-bold text-white">S/28.50</span>
                </div>
                <div className="flex justify-between">
                  <span>Producto Top:</span>
                  <span className="font-bold text-amber-400 truncate max-w-[80px]">Broaster</span>
                </div>
              </div>
            </div>

            {/* Terraza / Delivery */}
            <div className="p-4 rounded-2xl bg-stone-950/70 border border-stone-800/80 space-y-2">
              <div className="h-6" />
              <div className="font-black text-xs text-stone-300 uppercase tracking-wide">
                Terraza
              </div>
              <div className="text-xl font-black text-white font-mono">
                S/59.00
              </div>
              <div className="text-[10px] text-stone-400 space-y-0.5 pt-2 border-t border-stone-800">
                <div className="flex justify-between">
                  <span>Transacciones:</span>
                  <span className="font-bold text-white">2</span>
                </div>
                <div className="flex justify-between">
                  <span>Ticket Prom:</span>
                  <span className="font-bold text-white">S/29.50</span>
                </div>
                <div className="flex justify-between">
                  <span>Producto Top:</span>
                  <span className="font-bold text-amber-400 truncate max-w-[80px]">Bebidas</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alertas y Recomendaciones */}
        <div className="space-y-4">
          <div className="bg-stone-900/90 border border-stone-800/90 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">Alertas y Recomendaciones</h3>
            </div>

            <div className="p-3 bg-stone-950/70 border border-stone-800/80 rounded-2xl space-y-2">
              <div className="text-xs font-bold text-white">Stock Bajo</div>
              <p className="text-[11px] text-stone-400">
                642 productos con stock crítico
              </p>
              <Link
                href="/admin/menu?tab=products"
                className="w-full py-2 bg-stone-900 hover:bg-stone-800 border border-stone-700/80 text-stone-200 text-xs font-bold rounded-xl flex items-center justify-center transition-colors"
              >
                Revisar inventario
              </Link>
            </div>
          </div>

          <div className="bg-stone-900/90 border border-stone-800/90 rounded-3xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Stock Crítico</span>
              <AlertCircle size={14} className="text-amber-400" />
            </div>
            <p className="text-[11px] text-stone-400">Productos por agotarse</p>

            <div className="py-4 text-center">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-2 border border-emerald-500/20">
                <Check size={20} strokeWidth={2.5} />
              </div>
              <div className="text-xs font-bold text-emerald-400">¡Todo en orden!</div>
              <p className="text-[10px] text-stone-500 mt-0.5">Niveles de stock saludables</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
