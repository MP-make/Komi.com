"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  X,
  MapPin,
  Phone,
  MessageCircle,
  Store,
  Check,
  ExternalLink,
  ArrowRight,
  Clock,
  Sparkles,
  AlertCircle,
  BadgeCheck,
  Share2,
  Copy,
  Receipt,
  Bike,
  Banknote,
  Smartphone,
  ChevronRight,
} from "lucide-react";
import { Product } from "@/types";
import { useCartStore } from "@/lib/stores/cart";
import { useProductStore } from "@/lib/stores/products";
import { getTenantBySlug, DEFAULT_TENANT } from "@/lib/tenant";

interface KomiStorefrontProps {
  slug?: string;
}

export default function KomiStorefront({ slug = "quebravazo" }: KomiStorefrontProps) {
  // Tenant & Store Config
  const tenant = useMemo(() => getTenantBySlug(slug), [slug]);
  
  // Custom store settings from localStorage or tenant defaults
  const [storeConfig, setStoreConfig] = useState({
    name: tenant.name || "¡Qué Bravazo! Market & Restobar",
    slug: tenant.slug || "quebravazo",
    whatsapp: tenant.phone || "51987654321",
    address: tenant.address || "Av. Las Brisas 450, Lima",
    description: "Catálogo interactivo con pedidos directos a WhatsApp y entrega rápida.",
    deliveryCost: 5.0,
    allowDelivery: true,
    allowTakeaway: true,
    yapeNumber: tenant.phone || "987654321",
    yapeHolder: "¡Qué Bravazo!",
    isOpen: true,
  });

  // Load custom settings if saved in localStorage (e.g., from Admin Panel)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`komi_store_settings_${slug}`);
      if (saved) {
        setStoreConfig((prev) => ({ ...prev, ...JSON.parse(saved) }));
      }
    } catch (e) {
      console.warn("Could not read local store settings:", e);
    }
  }, [slug]);

  // Product Store
  const { products, init: initProducts, loading: loadingProducts } = useProductStore();

  useEffect(() => {
    initProducts();
  }, [initProducts]);

  // Cart Store
  const { items: cartItems, addItem, removeItem, updateQuantity, clearCart, getTotal, getItemCount } = useCartStore();

  // Search and Category filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("TODOS");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Checkout Form State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryType, setDeliveryType] = useState<"delivery" | "retiro">("delivery");
  const [address, setAddress] = useState("");
  const [reference, setReference] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"yape" | "plin" | "efectivo" | "transferencia">("yape");
  const [cashAmount, setCashAmount] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<{ id: string; total: number } | null>(null);

  // Categories extraction
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["TODOS", ...Array.from(set)];
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category check
      if (selectedCategory !== "TODOS" && p.category !== selectedCategory) {
        return false;
      }
      // Search check
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = (p.title || "").toLowerCase().includes(query);
        const matchDesc = (p.description || "").toLowerCase().includes(query);
        const matchCategory = (p.category || "").toLowerCase().includes(query);
        return matchTitle || matchDesc || matchCategory;
      }
      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  // Total calculation
  const subtotal = getTotal();
  const deliveryFee = deliveryType === "delivery" ? storeConfig.deliveryCost : 0;
  const finalTotal = subtotal + deliveryFee;

  // Copy store link to clipboard
  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      const url = window.location.href;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Find quantity in cart for a specific product
  const getProductCartQty = (productId: string) => {
    const item = cartItems.find((i) => i.id === productId);
    return item ? item.quantity : 0;
  };

  // Process WhatsApp Order
  const handleSendWhatsAppOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    if (!customerName.trim()) {
      alert("Por favor ingresa tu nombre para el pedido.");
      return;
    }

    if (deliveryType === "delivery" && !address.trim()) {
      alert("Por favor ingresa tu dirección para el delivery.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Registrar pedido en el sistema Komi / Base de datos
      const orderPayload = {
        customer: {
          name: customerName.trim(),
          phone: customerPhone.trim(),
          address: deliveryType === "delivery" ? `${address.trim()} ${reference ? `(Ref: ${reference.trim()})` : ""}` : "Retiro en local",
        },
        type: deliveryType === "delivery" ? "DELIVERY" : "LLEVAR",
        tableNumber: deliveryType === "delivery" ? "Delivery Web" : "Retiro Web",
        items: cartItems.map((i) => ({
          id: i.id,
          title: i.title,
          price: i.price,
          quantity: i.quantity,
          notes: i.notes || "",
        })),
        subtotal,
        deliveryCost: deliveryFee,
        total: finalTotal,
        paymentMethod: paymentMethod.toUpperCase(),
        notes: [
          paymentMethod === "efectivo" && cashAmount ? `Paga con: S/ ${cashAmount}` : "",
          orderNotes ? `Observaciones: ${orderNotes}` : "",
        ]
          .filter(Boolean)
          .join(" | "),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json().catch(() => ({}));
      const orderId = data.orderId || `KOMI-${Date.now().toString().slice(-4)}`;

      // 2. Construir mensaje estructurado para WhatsApp
      const lines: string[] = [];
      lines.push(`¡Hola! 👋 Quiero realizar este pedido en *${storeConfig.name}*:`);
      lines.push(``);
      lines.push(`🏷️ *ORDEN:* #${orderId}`);
      lines.push(`───────────────────`);
      lines.push(`🛒 *DETALLE DEL PEDIDO:*`);

      cartItems.forEach((item) => {
        const itemSub = (item.price * item.quantity).toFixed(2);
        lines.push(`• ${item.quantity}x ${item.title} (S/ ${item.price.toFixed(2)}) = S/ ${itemSub}`);
      });

      lines.push(`───────────────────`);
      lines.push(`📦 *Subtotal:* S/ ${subtotal.toFixed(2)}`);
      if (deliveryType === "delivery") {
        lines.push(`🛵 *Delivery:* S/ ${deliveryFee.toFixed(2)}`);
      } else {
        lines.push(`🏪 *Tipo:* Retiro en Tienda (Gratis)`);
      }
      lines.push(`💰 *TOTAL A PAGAR: S/ ${finalTotal.toFixed(2)}*`);
      lines.push(``);

      lines.push(`📍 *DATOS DE ENTREGA:*`);
      lines.push(`👤 *Cliente:* ${customerName.trim()}`);
      if (customerPhone.trim()) lines.push(`📱 *Teléfono:* ${customerPhone.trim()}`);
      if (deliveryType === "delivery") {
        lines.push(`🏠 *Dirección:* ${address.trim()}`);
        if (reference.trim()) lines.push(`📌 *Referencia:* ${reference.trim()}`);
      } else {
        lines.push(`🏬 *Retiro:* En tienda física (${storeConfig.address})`);
      }

      lines.push(``);
      lines.push(`💳 *MÉTODO DE PAGO:* ${paymentMethod.toUpperCase()}`);
      if (paymentMethod === "efectivo" && cashAmount.trim()) {
        lines.push(`💵 *Paga con billete de:* S/ ${cashAmount.trim()}`);
      }

      if (orderNotes.trim()) {
        lines.push(`📝 *Notas:* ${orderNotes.trim()}`);
      }

      lines.push(``);
      lines.push(`_⚡ Pedido generado desde Komi Catálogo Digital_`);

      const messageText = lines.join("\n");
      const cleanPhone = storeConfig.whatsapp.replace(/\D/g, "");
      const waUrl = `https://wa.me/${cleanPhone.startsWith("51") ? cleanPhone : `51${cleanPhone}`}?text=${encodeURIComponent(
        messageText
      )}`;

      // 3. Abrir WhatsApp en pestaña o app
      window.open(waUrl, "_blank");

      // 4. Limpiar carrito y mostrar confirmación
      clearCart();
      setCompletedOrder({ id: orderId, total: finalTotal });
      setIsCheckoutOpen(false);
    } catch (err) {
      console.error("Error creating WhatsApp order:", err);
      alert("Hubo un error al procesar el pedido. Por favor intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col selection:bg-amber-500 selection:text-black">
      {/* Top Banner de Komi SaaS */}
      <header className="bg-stone-900/90 backdrop-blur-md border-b border-stone-800 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-stone-300">
              {storeConfig.isOpen ? "Tienda Abierta • Pedidos activos" : "Tienda en pausa"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors border border-stone-700/80 cursor-pointer"
              title="Copiar link de la tienda"
            >
              {copiedLink ? (
                <>
                  <Check size={13} className="text-emerald-400" />
                  <span className="text-emerald-400 font-bold">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 size={13} />
                  <span>Compartir</span>
                </>
              )}
            </button>

            <Link
              href="/admin"
              className="text-xs font-medium text-stone-400 hover:text-amber-400 px-2 py-1 rounded-lg transition-colors hidden sm:inline"
            >
              Panel Admin
            </Link>
          </div>
        </div>
      </header>

      {/* Hero / Presentación de la Tienda */}
      <section className="bg-gradient-to-b from-stone-900 via-stone-900/80 to-stone-950 border-b border-stone-800/80 px-4 pt-6 pb-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            {/* Logo de la Tienda */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-amber-500/30 bg-stone-950 shadow-xl flex-shrink-0 flex items-center justify-center">
              <Image
                src="/logo_que_bravazo.png"
                alt={storeConfig.name}
                width={96}
                height={96}
                className="w-full h-full object-cover"
                priority
              />
            </div>

            {/* Datos Comerciales */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {storeConfig.name}
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <BadgeCheck size={13} />
                  Komi Oficial
                </span>
              </div>

              <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-xl">
                {storeConfig.description}
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-4 mt-2.5 text-xs text-stone-400 flex-wrap">
                <span className="inline-flex items-center gap-1">
                  <MapPin size={13} className="text-amber-400" />
                  {storeConfig.address}
                </span>

                <span className="inline-flex items-center gap-1">
                  <Phone size={13} className="text-emerald-400" />
                  {storeConfig.whatsapp}
                </span>

                <span className="inline-flex items-center gap-1">
                  <Bike size={13} className="text-amber-400" />
                  Delivery S/ {storeConfig.deliveryCost.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Buscador Rápido Mobile-First */}
          <div className="mt-5 relative">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={17} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos, bebidas, platos..."
                className="w-full pl-10 pr-10 py-3 bg-stone-900 border border-stone-800 rounded-2xl text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white p-1"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Barra de Categorías Horizontal (Scrollable Chips) */}
      <nav className="bg-stone-950/95 sticky top-12 z-20 border-b border-stone-800/80 backdrop-blur-md py-2.5">
        <div className="max-w-5xl mx-auto px-4 overflow-x-auto no-scrollbar flex items-center gap-2">
          {categories.map((cat) => {
            const count =
              cat === "TODOS"
                ? products.length
                : products.filter((p) => p.category === cat).length;
            const isActive = selectedCategory === cat;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "bg-amber-500 text-black shadow-md shadow-amber-500/20 font-bold"
                    : "bg-stone-900 text-stone-400 border border-stone-800 hover:border-stone-700 hover:text-white"
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? "bg-black/20 text-black font-extrabold" : "bg-stone-800 text-stone-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Catálogo de Productos (Mobile-First Grid) */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-3 sm:px-4 py-5 pb-28">
        {loadingProducts ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-stone-400 text-xs font-medium">Cargando catálogo en tiempo real...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-stone-900/40 rounded-2xl border border-stone-800/80 p-8">
            <AlertCircle size={36} className="text-stone-500 mx-auto mb-2" />
            <h3 className="text-base font-bold text-white">No se encontraron productos</h3>
            <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
              Prueba buscando con otra palabra o selecciona otra categoría en el menú superior.
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-white transition-colors"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4">
            {filteredProducts.map((product) => {
              const qtyInCart = getProductCartQty(product.id);
              const isOutOfStock = product.stock <= 0;
              const isLowStock = product.stock > 0 && product.stock <= 3;

              return (
                <div
                  key={product.id}
                  className={`group bg-stone-900/90 rounded-2xl border transition-all flex flex-col overflow-hidden relative ${
                    isOutOfStock
                      ? "border-stone-800/60 opacity-60"
                      : "border-stone-800 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5"
                  }`}
                >
                  {/* Imagen del Producto */}
                  <div className="relative aspect-square w-full bg-stone-950 overflow-hidden">
                    <Image
                      src={product.image || "/logo_que_bravazo.png"}
                      alt={product.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Badge de Oferta / Destacado */}
                    {product.featured && (
                      <span className="absolute top-2 left-2 bg-amber-500 text-black text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                        Top
                      </span>
                    )}

                    {/* Stock Alert Badge */}
                    {isOutOfStock ? (
                      <span className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center text-white text-xs font-black uppercase tracking-wider">
                        Agotado
                      </span>
                    ) : isLowStock ? (
                      <span className="absolute bottom-2 left-2 bg-rose-500/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow">
                        ¡Últimas {product.stock}!
                      </span>
                    ) : null}
                  </div>

                  {/* Info del Producto */}
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-amber-400/90 font-bold uppercase tracking-wider line-clamp-1">
                        {product.category || "General"}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 mt-0.5 leading-snug">
                        {product.title}
                      </h4>
                      {product.description && (
                        <p className="text-[11px] text-stone-400 line-clamp-1 mt-1 leading-tight hidden sm:block">
                          {product.description}
                        </p>
                      )}
                    </div>

                    {/* Precio y Botón de Añadir */}
                    <div className="mt-3 pt-2 border-t border-stone-800/80 flex items-center justify-between gap-1.5">
                      <div>
                        <span className="text-xs font-bold text-white">
                          S/ {product.price.toFixed(2)}
                        </span>
                      </div>

                      {/* Botón de Acción / Selector de Cantidad */}
                      {isOutOfStock ? (
                        <span className="text-[10px] text-stone-500 font-bold py-1 px-2 rounded-lg bg-stone-800/50">
                          Agotado
                        </span>
                      ) : qtyInCart > 0 ? (
                        <div className="flex items-center bg-amber-500 text-black rounded-xl p-0.5 font-bold shadow-sm">
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, qtyInCart - 1)}
                            className="w-6 h-6 flex items-center justify-center hover:bg-black/10 rounded-lg transition-colors cursor-pointer"
                            title="Disminuir"
                          >
                            <Minus size={13} strokeWidth={2.5} />
                          </button>
                          <span className="px-2 text-xs font-black min-w-[16px] text-center">
                            {qtyInCart}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, qtyInCart + 1)}
                            className="w-6 h-6 flex items-center justify-center hover:bg-black/10 rounded-lg transition-colors cursor-pointer"
                            title="Aumentar"
                          >
                            <Plus size={13} strokeWidth={2.5} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => addItem(product)}
                          className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
                        >
                          <Plus size={14} />
                          <span className="hidden xs:inline">Añadir</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Sticky Bottom Cart Bar (Solo cuando hay ítems) */}
      {getItemCount() > 0 && (
        <div className="fixed bottom-4 inset-x-3 sm:inset-x-auto sm:right-6 sm:w-96 z-40 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <button
            type="button"
            onClick={() => setIsCheckoutOpen(true)}
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold p-3.5 rounded-2xl shadow-2xl shadow-emerald-500/30 flex items-center justify-between border border-emerald-400/30 cursor-pointer active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-black/20 flex items-center justify-center">
                <ShoppingCart size={17} />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold leading-tight">
                  {getItemCount()} {getItemCount() === 1 ? "producto" : "productos"}
                </p>
                <p className="text-sm font-black">
                  Total: S/ {finalTotal.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider bg-black/20 px-3 py-1.5 rounded-xl">
              <span>Ver Pedido</span>
              <ArrowRight size={15} />
            </div>
          </button>
        </div>
      )}

      {/* Drawer / Modal de Checkout Venta a WhatsApp */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full sm:max-w-lg bg-stone-900 border border-stone-800 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Carrito */}
            <div className="p-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/60 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <MessageCircle size={17} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Completar Pedido por WhatsApp</h3>
                  <p className="text-[11px] text-stone-400">Sin pasarelas obligatorias ni comisiones</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Contenido scrolleable del formulario */}
            <form onSubmit={handleSendWhatsAppOrder} className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Resumen de Productos */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-stone-400 font-semibold px-1">
                  <span>Productos en carrito ({getItemCount()})</span>
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={12} />
                    Vaciar
                  </button>
                </div>

                <div className="bg-stone-950/70 rounded-2xl border border-stone-800/80 divide-y divide-stone-800/60 overflow-hidden">
                  {cartItems.map((item) => (
                    <div key={item.id} className="p-3 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{item.title}</p>
                        <p className="text-[11px] text-stone-400">
                          S/ {item.price.toFixed(2)} x {item.quantity} ={" "}
                          <span className="font-semibold text-amber-400">
                            S/ {(item.price * item.quantity).toFixed(2)}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-1 bg-stone-800 rounded-xl p-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-lg bg-stone-700/80 hover:bg-stone-600 text-white flex items-center justify-center cursor-pointer"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-bold text-white px-2">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-lg bg-stone-700/80 hover:bg-stone-600 text-white flex items-center justify-center cursor-pointer"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tipo de Entrega */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-300">Tipo de Entrega</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryType("delivery")}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      deliveryType === "delivery"
                        ? "bg-amber-500/15 border-amber-500 text-amber-400 font-bold"
                        : "bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700"
                    }`}
                  >
                    <Bike size={18} />
                    <div>
                      <p className="text-xs leading-none">Delivery a domicilio</p>
                      <p className="text-[10px] opacity-75 mt-0.5">+ S/ {storeConfig.deliveryCost.toFixed(2)}</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType("retiro")}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      deliveryType === "retiro"
                        ? "bg-amber-500/15 border-amber-500 text-amber-400 font-bold"
                        : "bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700"
                    }`}
                  >
                    <Store size={18} />
                    <div>
                      <p className="text-xs leading-none">Retiro en local</p>
                      <p className="text-[10px] opacity-75 mt-0.5">Gratis</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Datos del Cliente */}
              <div className="space-y-3 bg-stone-950/70 p-3.5 rounded-2xl border border-stone-800/80">
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Receipt size={14} className="text-amber-400" />
                  Datos para la orden
                </p>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                    Tu nombre completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-700/80 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                    Teléfono celular (WhatsApp)
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Ej. 987654321"
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-700/80 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {deliveryType === "delivery" && (
                  <>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                        Dirección exacta de entrega *
                      </label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Ej. Av. San Martín 340, Depto 201"
                        className="w-full px-3 py-2 bg-stone-900 border border-stone-700/80 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                        Referencia de entrega
                      </label>
                      <input
                        type="text"
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        placeholder="Ej. Casa verde, frente a la farmacia"
                        className="w-full px-3 py-2 bg-stone-900 border border-stone-700/80 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Método de Pago */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-300">¿Cómo prefieres pagar?</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("yape")}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                      paymentMethod === "yape"
                        ? "bg-purple-500/15 border-purple-500 text-purple-400 font-bold"
                        : "bg-stone-950/60 border-stone-800 text-stone-400"
                    }`}
                  >
                    <Smartphone size={16} />
                    <span className="text-xs">Yape ({storeConfig.yapeNumber})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("plin")}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                      paymentMethod === "plin"
                        ? "bg-sky-500/15 border-sky-500 text-sky-400 font-bold"
                        : "bg-stone-950/60 border-stone-800 text-stone-400"
                    }`}
                  >
                    <Smartphone size={16} />
                    <span className="text-xs">Plin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("efectivo")}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                      paymentMethod === "efectivo"
                        ? "bg-emerald-500/15 border-emerald-500 text-emerald-400 font-bold"
                        : "bg-stone-950/60 border-stone-800 text-stone-400"
                    }`}
                  >
                    <Banknote size={16} />
                    <span className="text-xs">Efectivo contraentrega</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("transferencia")}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                      paymentMethod === "transferencia"
                        ? "bg-blue-500/15 border-blue-500 text-blue-400 font-bold"
                        : "bg-stone-950/60 border-stone-800 text-stone-400"
                    }`}
                  >
                    <Receipt size={16} />
                    <span className="text-xs">Transferencia bancaria</span>
                  </button>
                </div>

                {paymentMethod === "efectivo" && (
                  <div className="mt-2">
                    <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                      ¿Con cuánto pagarás? (Para llevar vuelto)
                    </label>
                    <input
                      type="number"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      placeholder="Ej. 50 o 100"
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-700/80 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}
              </div>

              {/* Notas adicionales */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                  Notas adicionales para la cocina o tienda
                </label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Ej. Enviar cubiertos, sin ensalada, llamar al llegar..."
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-700/80 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Desglose Final de Precios */}
              <div className="p-3.5 rounded-2xl bg-stone-950/80 border border-stone-800/80 space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-400">
                  <span>Subtotal productos:</span>
                  <span>S/ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-400">
                  <span>Costo de envío:</span>
                  <span>{deliveryFee > 0 ? `S/ ${deliveryFee.toFixed(2)}` : "Gratis"}</span>
                </div>
                <div className="pt-2 border-t border-stone-800 flex justify-between text-sm font-extrabold text-white">
                  <span>TOTAL A PAGAR:</span>
                  <span className="text-emerald-400">S/ {finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Botón WhatsApp Gigante */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-50"
              >
                <MessageCircle size={20} className="fill-white" />
                <span>
                  {isSubmitting
                    ? "Conectando con WhatsApp..."
                    : `Pedir por WhatsApp • S/ ${finalTotal.toFixed(2)}`}
                </span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Pedido Exitoso */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <Check size={32} />
            </div>

            <div>
              <h3 className="text-xl font-black text-white">¡Pedido enviado a WhatsApp!</h3>
              <p className="text-xs text-stone-400 mt-1">
                Orden registrada exitosamente con el código{" "}
                <span className="font-bold text-amber-400">#{completedOrder.id}</span>
              </p>
            </div>

            <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800 text-xs text-stone-300 text-left space-y-1">
              <p>
                • Se ha abierto WhatsApp con la comanda lista para enviar.
              </p>
              <p>
                • El local revisará tu mensaje y coordinará la entrega de inmediato.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setCompletedOrder(null)}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Volver a la tienda
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
