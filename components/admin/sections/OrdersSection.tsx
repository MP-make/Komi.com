"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  History,
  Search,
  Filter,
  RotateCcw,
  ShoppingBag,
  CookingPot,
  Calendar,
  Eye,
  Receipt,
  Copy,
  Check,
  Undo2,
  DollarSign,
  Package,
  QrCode,
  CreditCard,
  Banknote,
  Wallet,
  Smartphone,
  X,
  Printer,
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  ChevronDown
} from "lucide-react";

interface OrderItem {
  product_id?: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: string;
  waiter_id?: string;
  waiter_name?: string;
  table_number?: string | null;
  order_type?: "mesa" | "llevar" | "delivery";
  items: OrderItem[];
  subtotal: number;
  takeaway_charge?: number;
  total: number;
  status: string;
  payment_method?: string | null;
  payment_status: string;
  archived?: boolean;
  created_at: string;
  updated_at?: string;
  customer_name?: string;
  notes?: string;
  refund_reason?: string;
}

// Generador de número de 6 dígitos consistente
function getOrderNumber(order: Order): string {
  // Si el id tiene números, extraer 6 dígitos
  const digits = order.id.replace(/\D/g, "");
  if (digits.length >= 6) return digits.slice(-6);
  // Si no, hash simple del UUID
  let hash = 0;
  for (let i = 0; i < order.id.length; i++) {
    hash = (hash << 5) - hash + order.id.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 900000 + 100000).toString();
}

// Transacciones demo iniciales si no hay en la base de datos
const DEMO_ORDERS: Order[] = [
  {
    id: "ord_830965",
    customer_name: "Cliente sin registrar",
    table_number: "4",
    order_type: "mesa",
    waiter_name: "Marlon Pecho",
    items: [{ title: "Agua Cielo 2.5 lt", quantity: 1, price: 4.00 }],
    subtotal: 4.00,
    total: 4.00,
    status: "completed",
    payment_method: "Efectivo",
    payment_status: "paid",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "ord_910428",
    customer_name: "Cajero 1",
    table_number: null,
    order_type: "llevar",
    waiter_name: "Cajero Principal",
    items: [{ title: "Papitas Lays Clásicas", quantity: 1, price: 4.00 }],
    subtotal: 4.00,
    total: 4.00,
    status: "completed",
    payment_method: "Efectivo",
    payment_status: "paid",
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "ord_582673",
    customer_name: "Cliente sin registrar",
    table_number: "2",
    order_type: "mesa",
    waiter_name: "Cajero Principal",
    items: [{ title: "Cuates picante", quantity: 2, price: 2.00 }],
    subtotal: 4.00,
    total: 4.00,
    status: "completed",
    payment_method: "Efectivo",
    payment_status: "paid",
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: "ord_520351",
    customer_name: "Cliente sin registrar",
    table_number: "6",
    order_type: "mesa",
    waiter_name: "Marlon Pecho",
    items: [{ title: "Carapulcra con Sopa Seca", quantity: 1, price: 15.00 }],
    subtotal: 15.00,
    total: 15.00,
    status: "completed",
    payment_method: "Efectivo",
    payment_status: "paid",
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: "ord_517823",
    customer_name: "Cliente sin registrar",
    table_number: "1",
    order_type: "mesa",
    waiter_name: "Marlon Pecho",
    items: [{ title: "Salchipapas Especial", quantity: 1, price: 16.20 }],
    subtotal: 16.20,
    total: 16.20,
    status: "completed",
    payment_method: "Efectivo",
    payment_status: "paid",
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
  },
  {
    id: "ord_711554",
    customer_name: "Cliente sin registrar",
    table_number: "8",
    order_type: "mesa",
    waiter_name: "Marlon Pecho",
    items: [
      { title: "Carapulcra con Sopa Seca Familiar", quantity: 4, price: 45.00 },
      { title: "Jarra Chicha Morada", quantity: 2, price: 18.00 },
      { title: "Salchibroster", quantity: 1, price: 16.00 }
    ],
    subtotal: 232.00,
    total: 232.00,
    status: "completed",
    payment_method: "Mixto",
    payment_status: "paid",
    created_at: new Date(Date.now() - 3600000 * 120).toISOString(),
  }
];

export default function AdminOrdersSection({ onOpenYape }: { onOpenYape?: () => void }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedMethod, setSelectedMethod] = useState("all");
  const [sortBy, setSortBy] = useState<"recent" | "oldest" | "highest" | "lowest">("recent");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Modales
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [refundOrder, setRefundOrder] = useState<Order | null>(null);
  const [refundReason, setRefundReason] = useState("Cliente solicitó cancelación");
  const [processingRefund, setProcessingRefund] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Carga de órdenes
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      const json = await res.json();
      const list = json.data || [];
      if (list.length > 0) {
        setOrders(list);
      } else {
        setOrders(DEMO_ORDERS);
      }
    } catch {
      setOrders(DEMO_ORDERS);
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePrintTicket = () => {
    const el = document.getElementById("ticket-pos-print");
    if (!el) {
      window.print();
      return;
    }
    const win = window.open("", "_blank", "width=380,height=600");
    if (!win) {
      window.print();
      return;
    }
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ticket POS</title>
          <style>
            @page { margin: 0; size: 80mm auto; }
            body { font-family: monospace; font-size: 11px; margin: 0; padding: 12px; color: #000; background: #fff; }
            .text-center { text-align: center; }
            .uppercase { text-transform: uppercase; }
            .font-extrabold { font-weight: 800; }
            .font-bold { font-weight: 700; }
            .flex { display: flex; justify-content: space-between; }
            .border-t { border-top: 1px dashed #666; margin: 6px 0; }
          </style>
        </head>
        <body>
          ${el.innerHTML}
          <script>
            window.onload = function() {
              window.focus();
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Limpiar filtros
  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedBranch("all");
    setSelectedMethod("all");
    setSortBy("recent");
    setDateFrom("");
    setDateTo("");
  };

  // Filtrado y ordenamiento reactivo
  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        // Búsqueda por número, cliente, mesero o plato
        const q = searchTerm.toLowerCase().trim();
        const orderNum = getOrderNumber(order);
        const matchSearch = q === "" ||
          orderNum.includes(q) ||
          order.id.toLowerCase().includes(q) ||
          (order.customer_name && order.customer_name.toLowerCase().includes(q)) ||
          (order.waiter_name && order.waiter_name.toLowerCase().includes(q)) ||
          (order.table_number && order.table_number.toLowerCase().includes(q)) ||
          order.items?.some((i) => i.title.toLowerCase().includes(q));

        // Filtro por tipo/sucursal
        const matchBranch = selectedBranch === "all" ||
          (selectedBranch === "mesa" && order.order_type === "mesa") ||
          (selectedBranch === "llevar" && order.order_type === "llevar") ||
          (selectedBranch === "delivery" && order.order_type === "delivery");

        // Filtro por método de pago
        const pm = (order.payment_method || "efectivo").toLowerCase();
        const matchMethod = selectedMethod === "all" || pm === selectedMethod.toLowerCase();

        // Filtro por rango de fechas
        let matchDate = true;
        if (dateFrom) {
          const from = new Date(dateFrom);
          from.setHours(0, 0, 0, 0);
          matchDate = matchDate && new Date(order.created_at) >= from;
        }
        if (dateTo) {
          const to = new Date(dateTo);
          to.setHours(23, 59, 59, 999);
          matchDate = matchDate && new Date(order.created_at) <= to;
        }

        return matchSearch && matchBranch && matchMethod && matchDate;
      })
      .sort((a, b) => {
        if (sortBy === "recent") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        if (sortBy === "highest") return b.total - a.total;
        if (sortBy === "lowest") return a.total - b.total;
        return 0;
      });
  }, [orders, searchTerm, selectedBranch, selectedMethod, sortBy, dateFrom, dateTo]);

  // Cálculos para KPIs superiores
  const stats = useMemo(() => {
    const count = filteredOrders.length;
    const totalRevenue = filteredOrders
      .filter((o) => o.status !== "refunded" && o.status !== "cancelled")
      .reduce((acc, o) => acc + (o.total || 0), 0);
    const totalProductsSold = filteredOrders
      .filter((o) => o.status !== "refunded" && o.status !== "cancelled")
      .reduce((acc, o) => acc + (o.items?.reduce((s, i) => s + (i.quantity || 1), 0) || 0), 0);

    return { count, totalRevenue, totalProductsSold };
  }, [filteredOrders]);

  // Copiar resumen de la transacción
  const handleCopyTransaction = (order: Order) => {
    const num = getOrderNumber(order);
    const client = order.customer_name || (order.order_type === "mesa" ? `Mesa ${order.table_number || "?"}` : "Cliente");
    const date = new Date(order.created_at).toLocaleDateString("es-PE");
    const text = `Transacción #${num} | ${client} | S/ ${order.total.toFixed(2)} | ${order.payment_method || "Efectivo"} | ${date}`;
    navigator.clipboard.writeText(text);
    setCopiedId(order.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Procesar Devolución / Anulación
  const handleConfirmRefund = async () => {
    if (!refundOrder) return;
    setProcessingRefund(true);
    try {
      const res = await fetch(`/api/waiter/orders/${refundOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "refunded",
          payment_status: "refunded",
          notes: `${refundOrder.notes || ""} [Devolución: ${refundReason}]`.trim(),
        }),
      });

      if (!res.ok) throw new Error();

      // Actualizar estado local
      setOrders((prev) =>
        prev.map((o) =>
          o.id === refundOrder.id
            ? { ...o, status: "refunded", payment_status: "refunded" }
            : o
        )
      );
      setRefundOrder(null);
    } catch {
      alert("Error al procesar la devolución");
    } finally {
      setProcessingRefund(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <History className="w-7 h-7 text-amber-400" />
            Historial de Transacciones
          </h1>
          <p className="text-stone-400 text-sm mt-1">
            Gestiona todas las ventas realizadas: busca, filtra, ve detalles y procesa devoluciones.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <Link
            href="/waiter"
            className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shadow-emerald-600/20 active:scale-95"
            title="Abrir Comandero / Punto de Venta"
          >
            <ShoppingBag size={16} />
            <span>Punto de Venta (POS)</span>
          </Link>

          <Link
            href="/chef"
            className="flex items-center gap-2 px-3.5 py-2.5 bg-orange-600/90 hover:bg-orange-500 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shadow-orange-600/20 active:scale-95"
            title="Abrir Pantalla KDS de Cocina"
          >
            <CookingPot size={16} />
            <span>Cocina (KDS)</span>
          </Link>

          {onOpenYape && (
            <button
              type="button"
              onClick={onOpenYape}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800 rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-sm cursor-pointer"
            >
              <Smartphone size={16} className="text-sky-400" />
              <span>Configurar Yape</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Filtros y Búsqueda (Estilo idéntico a la referencia en Dark Mode) */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-md">
        {/* Fila 1: Buscador + Sucursales + Métodos + Orden */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Input Buscador */}
          <div className="lg:col-span-4 relative">
            <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar transacciones..."
              className="w-full pl-9 pr-3 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs sm:text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Selector de Sucursales / Tipo */}
          <div className="lg:col-span-3 relative">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs sm:text-sm text-stone-300 focus:outline-none focus:border-amber-500 transition-colors appearance-none cursor-pointer"
            >
              <option value="all">Todas las sucursales</option>
              <option value="mesa">Salón / Mesas</option>
              <option value="llevar">Para Llevar (Takeaway)</option>
              <option value="delivery">Delivery Online</option>
            </select>
            <ChevronDown className="w-4 h-4 text-stone-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Selector de Métodos de Pago */}
          <div className="lg:col-span-3 relative">
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs sm:text-sm text-stone-300 focus:outline-none focus:border-amber-500 transition-colors appearance-none cursor-pointer"
            >
              <option value="all">Todos los métodos</option>
              <option value="efectivo">Efectivo</option>
              <option value="yape">Yape</option>
              <option value="plin">Plin</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="mixto">Mixto</option>
            </select>
            <ChevronDown className="w-4 h-4 text-stone-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Selector de Ordenamiento */}
          <div className="lg:col-span-2 relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs sm:text-sm text-stone-300 focus:outline-none focus:border-amber-500 transition-colors appearance-none cursor-pointer"
            >
              <option value="recent">⇅ Más recientes</option>
              <option value="oldest">⇅ Más antiguos</option>
              <option value="highest">⇅ Mayor monto</option>
              <option value="lowest">⇅ Menor monto</option>
            </select>
            <ChevronDown className="w-4 h-4 text-stone-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Fila 2: Desde fecha + Hasta fecha + Botón Limpiar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Desde fecha */}
          <div className="flex-1 relative">
            <Calendar className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs sm:text-sm text-stone-300 focus:outline-none focus:border-amber-500 transition-colors [color-scheme:dark]"
            />
          </div>

          {/* Hasta fecha */}
          <div className="flex-1 relative">
            <Calendar className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs sm:text-sm text-stone-300 focus:outline-none focus:border-amber-500 transition-colors [color-scheme:dark]"
            />
          </div>

          {/* Botón Limpiar */}
          <button
            type="button"
            onClick={handleClearFilters}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-stone-950 hover:bg-stone-800 border border-stone-800 rounded-xl text-xs sm:text-sm font-semibold text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Limpiar</span>
          </button>
        </div>
      </div>

      {/* 3. Tarjetas KPI (TRANSACCIONES / VENTAS / PRODUCTOS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* TRANSACCIONES */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 flex items-center justify-between shadow-md">
          <div>
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">TRANSACCIONES</p>
            <p className="text-3xl font-extrabold text-blue-400 mt-1">
              {stats.count}
            </p>
            <p className="text-xs text-stone-500 mt-0.5">Encontradas</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <History size={20} />
          </div>
        </div>

        {/* VENTAS */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 flex items-center justify-between shadow-md">
          <div>
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">VENTAS</p>
            <p className="text-3xl font-extrabold text-emerald-400 mt-1">
              S/{stats.totalRevenue.toFixed(2)}
            </p>
            <p className="text-xs text-stone-500 mt-0.5">Total facturado</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
            $
          </div>
        </div>

        {/* PRODUCTOS */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 flex items-center justify-between shadow-md">
          <div>
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">PRODUCTOS</p>
            <p className="text-3xl font-extrabold text-amber-400 mt-1">
              {stats.totalProductsSold}
            </p>
            <p className="text-xs text-stone-500 mt-0.5">Vendidos</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Package size={20} />
          </div>
        </div>
      </div>

      {/* 4. Tabla de Transacciones */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-stone-800 bg-stone-950/70 text-stone-400 font-semibold">
                <th className="px-4 py-3.5">Número</th>
                <th className="px-4 py-3.5">Cliente</th>
                <th className="px-4 py-3.5">Total</th>
                <th className="px-4 py-3.5">Método</th>
                <th className="px-4 py-3.5">Fecha</th>
                <th className="px-4 py-3.5">Estado</th>
                <th className="px-4 py-3.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-stone-500">
                    <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Cargando transacciones...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-stone-500">
                    <p className="text-sm font-medium">No se encontraron transacciones con los filtros seleccionados.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const orderNum = getOrderNumber(order);
                  const isRefunded = order.status === "refunded" || order.payment_status === "refunded";
                  const isPaid = order.payment_status === "paid" || order.status === "completed" || order.status === "paid";
                  const method = (order.payment_method || "Efectivo").toLowerCase();

                  // Nombre del cliente
                  const customerDisplay =
                    order.customer_name ||
                    (order.order_type === "mesa"
                      ? `Mesa ${order.table_number || "?"}`
                      : order.waiter_name || "Cliente sin registrar");

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-stone-800/40 transition-colors group"
                    >
                      {/* Número */}
                      <td className="px-4 py-3.5 font-mono text-white font-bold">
                        #{orderNum}
                      </td>

                      {/* Cliente */}
                      <td className="px-4 py-3.5 text-stone-300 font-medium max-w-[180px] truncate">
                        {customerDisplay}
                      </td>

                      {/* Total */}
                      <td className="px-4 py-3.5 font-bold text-white whitespace-nowrap">
                        S/{order.total.toFixed(2)}
                      </td>

                      {/* Método */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                            method === "yape"
                              ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                              : method === "plin"
                              ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                              : method === "tarjeta"
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              : method === "mixto"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-stone-800 text-stone-300 border border-stone-700"
                          }`}
                        >
                          {method === "yape" && <QrCode size={11} />}
                          {method === "plin" && <Smartphone size={11} />}
                          {method === "tarjeta" && <CreditCard size={11} />}
                          {method === "efectivo" && <Banknote size={11} />}
                          {method === "mixto" && <Wallet size={11} />}
                          {order.payment_method || "Efectivo"}
                        </span>
                      </td>

                      {/* Fecha */}
                      <td className="px-4 py-3.5 text-stone-400 whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString("es-PE", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric"
                        })}
                      </td>

                      {/* Estado */}
                      <td className="px-4 py-3.5">
                        {isRefunded ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/25">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            Devolución
                          </span>
                        ) : isPaid ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Completada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/25">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            Pendiente
                          </span>
                        )}
                      </td>

                      {/* Botones de Acción */}
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Ver */}
                          <button
                            type="button"
                            onClick={() => setViewingOrder(order)}
                            title="Ver detalles de la orden"
                            className="px-2.5 py-1.5 rounded-xl border border-stone-800 hover:border-stone-700 bg-stone-950/80 hover:bg-stone-800 text-stone-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Eye size={13} />
                            <span>Ver</span>
                          </button>

                          {/* Recibo */}
                          <button
                            type="button"
                            onClick={() => setReceiptOrder(order)}
                            title="Ver e imprimir ticket POS"
                            className="px-2.5 py-1.5 rounded-xl border border-stone-800 hover:border-stone-700 bg-stone-950/80 hover:bg-stone-800 text-stone-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Receipt size={13} />
                            <span>Recibo</span>
                          </button>

                          {/* Copiar */}
                          <button
                            type="button"
                            onClick={() => handleCopyTransaction(order)}
                            title="Copiar información de la transacción"
                            className="px-2.5 py-1.5 rounded-xl border border-stone-800 hover:border-stone-700 bg-stone-950/80 hover:bg-stone-800 text-stone-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            {copiedId === order.id ? (
                              <>
                                <Check size={13} className="text-emerald-400" />
                                <span className="text-emerald-400">Listo</span>
                              </>
                            ) : (
                              <>
                                <Copy size={13} />
                                <span>Copiar</span>
                              </>
                            )}
                          </button>

                          {/* Devolución */}
                          {!isRefunded ? (
                            <button
                              type="button"
                              onClick={() => setRefundOrder(order)}
                              title="Procesar devolución"
                              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors shadow-sm shadow-rose-600/30 cursor-pointer"
                            >
                              <Undo2 size={13} />
                              <span>Devolución</span>
                            </button>
                          ) : (
                            <span className="px-2.5 py-1.5 rounded-xl bg-stone-800/40 text-stone-500 text-xs font-medium cursor-not-allowed">
                              Devuelto
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: VER DETALLE DE LA TRANSACCIÓN */}
      {/* ========================================================================= */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setViewingOrder(null)}
          />
          <div className="relative bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Cabecera Modal */}
            <div className="flex items-center justify-between p-5 border-b border-stone-800 bg-stone-950/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Receipt size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Detalle de Transacción #{getOrderNumber(viewingOrder)}
                  </h3>
                  <p className="text-xs text-stone-400">
                    {new Date(viewingOrder.created_at).toLocaleString("es-PE")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Datos de cliente / mesero */}
            <div className="p-5 border-b border-stone-800 bg-stone-950/30 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <p className="text-stone-500 font-medium">Cliente</p>
                <p className="text-white font-semibold mt-0.5 truncate">
                  {viewingOrder.customer_name || "Cliente General"}
                </p>
              </div>
              <div>
                <p className="text-stone-500 font-medium">Modalidad</p>
                <p className="text-white font-semibold mt-0.5 uppercase">
                  {viewingOrder.order_type === "mesa" ? `Mesa ${viewingOrder.table_number || "?"}` : viewingOrder.order_type || "Salón"}
                </p>
              </div>
              <div>
                <p className="text-stone-500 font-medium">Atendido por</p>
                <p className="text-white font-semibold mt-0.5 truncate">
                  {viewingOrder.waiter_name || "Cajero Principal"}
                </p>
              </div>
              <div>
                <p className="text-stone-500 font-medium">Método de pago</p>
                <p className="text-amber-400 font-semibold mt-0.5 capitalize">
                  {viewingOrder.payment_method || "Efectivo"}
                </p>
              </div>
            </div>

            {/* Lista de Productos */}
            <div className="flex-1 overflow-y-auto p-5 space-y-2.5">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                Productos Comprados ({viewingOrder.items?.length || 0})
              </p>
              {viewingOrder.items?.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-stone-950/50 border border-stone-800/80 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-stone-800 text-amber-400 font-bold flex items-center justify-center">
                      {item.quantity}×
                    </span>
                    <div>
                      <p className="text-white font-semibold text-sm">{item.title}</p>
                      <p className="text-stone-400">S/{item.price.toFixed(2)} c/u</p>
                    </div>
                  </div>
                  <p className="font-bold text-white text-sm">
                    S/{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Resumen Total */}
            <div className="p-5 border-t border-stone-800 bg-stone-950/70 space-y-2">
              <div className="flex justify-between text-xs text-stone-400">
                <span>Subtotal</span>
                <span>S/{viewingOrder.subtotal.toFixed(2)}</span>
              </div>
              {(viewingOrder.takeaway_charge || 0) > 0 && (
                <div className="flex justify-between text-xs text-stone-400">
                  <span>Empaque / Envases</span>
                  <span>S/{viewingOrder.takeaway_charge?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-stone-800">
                <span>TOTAL FACTURADO</span>
                <span className="text-amber-400">S/{viewingOrder.total.toFixed(2)}</span>
              </div>

              <div className="flex items-center gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    const o = viewingOrder;
                    setViewingOrder(null);
                    setReceiptOrder(o);
                  }}
                  className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Receipt size={14} />
                  Ver Recibo Térmico
                </button>
                <button
                  type="button"
                  onClick={() => setViewingOrder(null)}
                  className="py-2.5 px-5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: RECIBO TÉRMICO POS (Imprimible) */}
      {/* ========================================================================= */}
      {receiptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setReceiptOrder(null)}
          />
          <div className="relative bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-sm flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Header Modal */}
            <div className="flex items-center justify-between p-4 border-b border-stone-800 bg-stone-950/70">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Receipt size={14} className="text-amber-400" />
                Ticket de Venta POS
              </span>
              <button
                onClick={() => setReceiptOrder(null)}
                className="text-stone-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Simulación del Ticket Térmico en papel */}
            <div id="ticket-pos-print" className="p-6 bg-white text-black font-mono text-xs space-y-3 select-text shadow-inner">
              <div className="text-center space-y-1">
                <p className="font-extrabold text-sm uppercase">¡QUÉ BRAVAZO!</p>
                <p className="text-[11px] text-gray-700">RESTOBAR & DELIVERY</p>
                <p className="text-[10px] text-gray-500">RUC: 20608945123</p>
                <p className="text-[10px] text-gray-500">Lima, Perú</p>
              </div>

              <div className="border-t border-dashed border-gray-400 my-2" />

              <div className="text-[11px] space-y-0.5">
                <p>TICKET: #{getOrderNumber(receiptOrder)}</p>
                <p>FECHA: {new Date(receiptOrder.created_at).toLocaleDateString("es-PE")}</p>
                <p>HORA: {new Date(receiptOrder.created_at).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}</p>
                <p>CLIENTE: {receiptOrder.customer_name || (receiptOrder.order_type === "mesa" ? `Mesa ${receiptOrder.table_number || "?"}` : "General")}</p>
                <p>ATENDIÓ: {receiptOrder.waiter_name || "Caja"}</p>
              </div>

              <div className="border-t border-dashed border-gray-400 my-2" />

              {/* Items */}
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between font-bold border-b border-gray-200 pb-1">
                  <span>CANT / DESCRIPCIÓN</span>
                  <span>TOTAL</span>
                </div>
                {receiptOrder.items?.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-start">
                    <span className="flex-1 pr-2 truncate">
                      {it.quantity}x {it.title}
                    </span>
                    <span className="font-semibold whitespace-nowrap">
                      S/{(it.price * it.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-gray-400 my-2" />

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>SUBTOTAL</span>
                  <span>S/{receiptOrder.subtotal.toFixed(2)}</span>
                </div>
                {(receiptOrder.takeaway_charge || 0) > 0 && (
                  <div className="flex justify-between">
                    <span>EMPAQUE</span>
                    <span>S/{receiptOrder.takeaway_charge?.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-sm pt-1 border-t border-gray-800">
                  <span>TOTAL A PAGAR</span>
                  <span>S/{receiptOrder.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-gray-600 pt-1">
                  <span>FORMA DE PAGO:</span>
                  <span className="uppercase font-bold">{receiptOrder.payment_method || "Efectivo"}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-400 my-3" />

              <div className="text-center text-[10px] text-gray-500">
                <p>¡GRACIAS POR SU PREFERENCIA!</p>
                <p className="mt-0.5">Comprobante sin valor tributario</p>
              </div>
            </div>

            {/* Botones */}
            <div className="p-4 border-t border-stone-800 bg-stone-950 flex gap-2">
              <button
                type="button"
                onClick={handlePrintTicket}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer size={15} />
                Imprimir Ticket
              </button>
              <button
                type="button"
                onClick={() => setReceiptOrder(null)}
                className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: PROCESAR DEVOLUCIÓN */}
      {/* ========================================================================= */}
      {refundOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => !processingRefund && setRefundOrder(null)}
          />
          <div className="relative bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Confirmar Devolución
                </h3>
                <p className="text-xs text-stone-400">
                  Transacción #{getOrderNumber(refundOrder)}
                </p>
              </div>
            </div>

            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed mb-4">
              ¿Estás seguro de registrar la devolución de la transacción por un total de{" "}
              <span className="text-amber-400 font-bold">
                S/{refundOrder.total.toFixed(2)}
              </span>
              ? La orden cambiará su estado a <strong>Devolución</strong> y los reportes de ventas se actualizarán.
            </p>

            <div className="space-y-1.5 mb-5">
              <label className="text-xs text-stone-400 font-medium">Motivo de la devolución</label>
              <select
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 focus:outline-none focus:border-rose-500 cursor-pointer"
              >
                <option value="Cliente solicitó cancelación">Cliente solicitó cancelación</option>
                <option value="Error en digitación o cobro">Error en digitación o cobro</option>
                <option value="Inconformidad con el plato">Inconformidad con el plato</option>
                <option value="Demora excesiva en entrega">Demora excesiva en entrega</option>
                <option value="Otro motivo administrativo">Otro motivo administrativo</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={processingRefund}
                onClick={() => setRefundOrder(null)}
                className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={processingRefund}
                onClick={handleConfirmRefund}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {processingRefund ? (
                  <span>Procesando...</span>
                ) : (
                  <>
                    <Undo2 size={14} />
                    Confirmar Devolución
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
