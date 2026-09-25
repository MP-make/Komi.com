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
  Star,
  ChevronRight,
  Info,
  CheckCircle2,
} from "lucide-react";
import { Product } from "@/types";
import { useCartStore } from "@/lib/stores/cart";
import { useProductStore } from "@/lib/stores/products";
import { getTenantBySlug } from "@/lib/tenant";

interface KomiStorefrontProps {
  slug?: string;
}

export default function KomiStorefront({ slug = "demo" }: KomiStorefrontProps) {
  const tenant = useMemo(() => getTenantBySlug(slug), [slug]);

  // Configuración de la tienda (leída desde localStorage, base de datos o defaults)
  const [storeConfig, setStoreConfig] = useState({
    name: tenant.name || "Que Bravazo! Restobar",
    slug: slug || "quebravazo",
    whatsapp: tenant.phone || "51946826535",
    address: tenant.address || "Urb. Los Jardines de San Andrés, Pisco, Ica",
    description: "Catálogo digital interactivo con pedidos directos a WhatsApp y entrega rápida.",
    deliveryCost: 5.0,
    allowDelivery: true,
    allowTakeaway: true,
    yapeNumber: "946826535",
    yapeHolder: "Que Bravazo! Restobar",
    isOpen: true,
    logo_url: "/logo_que_bravazo.png",
    banner_url: "/Fondo restaurante.png",
  });

  useEffect(() => {
    // 1. Carga inmediata desde localStorage
    try {
      const savedRest = localStorage.getItem("restaurant_settings");
      const savedStore =
        localStorage.getItem("komi_store_settings") ||
        localStorage.getItem(`komi_store_settings_${slug}`);
      if (savedRest) {
        const r = JSON.parse(savedRest);
        setStoreConfig((prev) => ({
          ...prev,
          name: r.name || prev.name,
          address: r.address || prev.address,
          whatsapp: r.phone || prev.whatsapp,
          logo_url: r.logo_url || prev.logo_url,
          banner_url: r.banner_url || prev.banner_url,
          description: r.description || prev.description,
        }));
      }
      if (savedStore) {
        setStoreConfig((prev) => ({ ...prev, ...JSON.parse(savedStore) }));
      }
    } catch (e) {
      console.warn("Could not read local store settings", e);
    }

    // 2. Sincronización en tiempo real desde Supabase (store settings + restaurant settings + media)
    Promise.all([
      fetch("/api/admin/settings?key=komi_store_settings").then((r) => r.json()).catch(() => ({})),
      fetch("/api/admin/settings?key=restaurant_settings").then((r) => r.json()).catch(() => ({})),
      fetch("/api/admin/media").then((r) => r.json()).catch(() => ({})),
    ])
      .then(([storeRes, restRes, mediaRes]) => {
        let merged: any = {};
        if (restRes?.value) {
          const r = restRes.value;
          merged = {
            ...merged,
            name: r.name,
            address: r.address,
            whatsapp: r.phone,
            logo_url: r.logo_url,
            banner_url: r.banner_url,
            description: r.description,
          };
        }
        if (storeRes?.value) {
          merged = { ...merged, ...storeRes.value };
        }

        // Si aún no hay logo o banner explícito, buscar en la galería multimedia
        if (mediaRes?.data && Array.isArray(mediaRes.data)) {
          const mediaLogo = mediaRes.data.find((m: any) => m.section === "logo" && m.is_active);
          const mediaHero = mediaRes.data.find(
            (m: any) => (m.section === "hero" || m.section === "background") && m.is_active
          );
          if (!merged.logo_url && mediaLogo?.url) {
            merged.logo_url = mediaLogo.url;
          }
          if (!merged.banner_url && mediaHero?.url) {
            merged.banner_url = mediaHero.url;
          }
        }

        setStoreConfig((prev) => {
          const next = { ...prev, ...merged };
          try {
            localStorage.setItem("komi_store_settings", JSON.stringify(next));
            localStorage.setItem(`komi_store_settings_${slug}`, JSON.stringify(next));
          } catch {}
          return next;
        });
      })
      .catch((e) => console.warn("Could not fetch remote store settings", e));
  }, [slug]);

  // Carga de categorías para configuración de cobro de táperes (+S/ 1.00) y KDS
  const [categoriesMap, setCategoriesMap] = useState<
    Record<string, { charges_taper: boolean; send_to_kitchen: boolean; name?: string; slug?: string }>
  >({});

  useEffect(() => {
    const parseCatData = (data: any[]) => {
      const map: Record<
        string,
        { charges_taper: boolean; send_to_kitchen: boolean; name?: string; slug?: string }
      > = {};
      data.forEach((c: any) => {
        const val = {
          charges_taper: c.charges_taper !== false,
          send_to_kitchen: c.send_to_kitchen !== false,
          name: c.name,
          slug: c.slug,
        };
        if (c.id) map[c.id] = val;
        if (c.slug) map[c.slug.toLowerCase().trim()] = val;
        if (c.name) map[c.name.toLowerCase().trim()] = val;
      });
      setCategoriesMap(map);
    };

    fetch("/api/admin/categories")
      .then((r) => {
        if (!r.ok) return fetch("/api/categories").then((res2) => res2.json());
        return r.json();
      })
      .then((res) => {
        if (res?.data && Array.isArray(res.data)) {
          parseCatData(res.data);
        }
      })
      .catch(() => {
        fetch("/api/categories")
          .then((r) => r.json())
          .then((res) => {
            if (res?.data && Array.isArray(res.data)) {
              parseCatData(res.data);
            }
          })
          .catch((e) => console.warn("Could not fetch categories in storefront:", e));
      });
  }, []);

  // Carga de productos
  const { products, init: initProducts, loading: loadingProducts } = useProductStore();

  useEffect(() => {
    initProducts();
  }, [initProducts]);

  // Carrito
  const {
    items: cartItems,
    addItem,
    updateQuantity,
    clearCart,
    getTotal,
    getItemCount,
  } = useCartStore();

  // Estados de vista
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("TODOS");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Formulario de Checkout
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

  // Determina si un producto / ítem de carrito debe cobrar táper (+S/ 1.00)
  const isProductChargingTaper = (item: {
    id?: string;
    category?: string;
    category_id?: string;
    category_slug?: string;
    charges_taper?: boolean;
    title?: string;
  }) => {
    // 1. Si el producto o ítem ya trae charges_taper explícito del backend
    if (item.charges_taper !== undefined && item.charges_taper !== null) {
      return Boolean(item.charges_taper);
    }

    // 2. Buscar producto en el catálogo para asegurar campos de categoría y flags
    const fullProd = products.find((p) => p.id === item.id);
    if (fullProd?.charges_taper !== undefined && fullProd?.charges_taper !== null) {
      return Boolean(fullProd.charges_taper);
    }

    const catId = item.category_id || fullProd?.category_id || "";
    const catSlug = (item.category_slug || fullProd?.category_slug || "").toLowerCase().trim();
    const catName = (item.category || fullProd?.category || "").toLowerCase().trim();

    // 3. Comprobar en el mapa de configuración de categorías por id, slug o nombre
    const config =
      (catId && categoriesMap[catId]) ||
      (catSlug && categoriesMap[catSlug]) ||
      (catName && categoriesMap[catName]);

    if (config !== undefined && config.charges_taper !== undefined) {
      return Boolean(config.charges_taper);
    }

    // 4. Heurística de respaldo: bebidas exentas, platos/comida cobran táper
    const titleText = (item.title || fullProd?.title || "").toLowerCase();
    const checkText = `${catSlug} ${catName} ${titleText}`;
    const isBeverage = /bebida|gaseosa|refresco|cerveza|trago|coctel|jugo|agua|vino/i.test(checkText);
    return !isBeverage;
  };

  // Cálculo de Táperes / Envases según categorías
  const { taperCost, taperItemCount } = useMemo(() => {
    let count = 0;
    for (const item of cartItems) {
      if (isProductChargingTaper(item)) {
        count += item.quantity;
      }
    }
    return {
      taperItemCount: count,
      taperCost: count * 1.0, // S/ 1.00 por táper/envase
    };
  }, [cartItems, categoriesMap, products]);

  // Extracción de categorías ordenadas
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["TODOS", ...Array.from(set)];
  }, [products]);

  // Filtrado de productos
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== "TODOS" && p.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (p.title || "").toLowerCase().includes(q);
        const matchDesc = (p.description || "").toLowerCase().includes(q);
        const matchCat = (p.category || "").toLowerCase().includes(q);
        return matchTitle || matchDesc || matchCat;
      }
      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  // Agrupación por categorías cuando se selecciona TODOS
  const groupedProducts = useMemo(() => {
    if (selectedCategory !== "TODOS" || searchQuery.trim()) {
      return null;
    }
    const groups: Record<string, Product[]> = {};
    products.forEach((p) => {
      const cat = p.category || "Otros";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    });
    return groups;
  }, [products, selectedCategory, searchQuery]);

  // Totales
  const subtotal = getTotal();
  const deliveryFee = deliveryType === "delivery" ? storeConfig.deliveryCost : 0;
  const finalTotal = subtotal + deliveryFee + taperCost;

  // Copiar link de tienda
  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const getProductCartQty = (productId: string) => {
    const item = cartItems.find((i) => i.id === productId);
    return item ? item.quantity : 0;
  };

  // Enviar pedido a WhatsApp
  const handleSendWhatsAppOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    if (!customerName.trim()) {
      alert("Por favor ingresa tu nombre completo.");
      return;
    }

    if (deliveryType === "delivery" && !address.trim()) {
      alert("Por favor ingresa tu dirección de entrega.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Guardar en Base de Datos de Komi (aparece en POS, KDS y Pedidos)
      const orderPayload = {
        customer: {
          name: customerName.trim(),
          phone: customerPhone.trim(),
          address:
            deliveryType === "delivery"
              ? `${address.trim()} ${reference ? `(Ref: ${reference.trim()})` : ""}`
              : "Retiro en local",
        },
        type: deliveryType === "delivery" ? "DELIVERY" : "LLEVAR",
        tableNumber: deliveryType === "delivery" ? "Delivery Web" : "Retiro Web",
        items: cartItems.map((i) => ({
          id: i.id,
          title: i.title,
          price: i.price,
          quantity: i.quantity,
          notes: i.notes || "",
          charges_taper: isProductChargingTaper(i),
        })),
        subtotal,
        takeaway_charge: taperCost,
        taperCost,
        deliveryCost: deliveryFee,
        total: finalTotal,
        paymentMethod: paymentMethod.toUpperCase(),
        notes: [
          taperCost > 0 ? `Empaque/Táper: S/ ${taperCost.toFixed(2)} (${taperItemCount} un.)` : "",
          deliveryType === "delivery" && deliveryFee > 0 ? `Delivery: S/ ${deliveryFee.toFixed(2)}` : "",
          paymentMethod === "efectivo" && cashAmount ? `Paga con: S/ ${cashAmount}` : "",
          orderNotes ? `Notas: ${orderNotes}` : "",
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
      const orderId = data.orderId || `KM-${Date.now().toString().slice(-4)}`;

      // 2. Formato de mensaje WhatsApp estructurado y profesional
      const lines: string[] = [];
      lines.push(`¡Hola! 👋 Quiero realizar este pedido en *${storeConfig.name}*:`);
      lines.push(``);
      lines.push(`🏷️ *PEDIDO #${orderId}*`);
      lines.push(`────────────────────────`);
      lines.push(`🛒 *DETALLE DEL PEDIDO:*`);

      cartItems.forEach((item) => {
        const itemSub = (item.price * item.quantity).toFixed(2);
        const hasTaper = isProductChargingTaper(item);
        lines.push(`• *${item.quantity}x* ${item.title} — S/ ${itemSub}${hasTaper ? ` _(+S/ 1.00 táper c/u)_` : ""}`);
        if (item.notes) {
          lines.push(`  ↳ _Nota: ${item.notes}_`);
        }
      });

      lines.push(`────────────────────────`);
      lines.push(`📦 *Subtotal productos:* S/ ${subtotal.toFixed(2)}`);
      if (taperCost > 0) {
        lines.push(`🥡 *Envases / Táperes (${taperItemCount}):* S/ ${taperCost.toFixed(2)}`);
      }
      if (deliveryType === "delivery") {
        lines.push(`🛵 *Envío Delivery:* ${deliveryFee > 0 ? `S/ ${deliveryFee.toFixed(2)}` : "Gratis"}`);
      } else {
        lines.push(`🏪 *Modalidad:* Retiro en Tienda (Gratis)`);
      }
      lines.push(`💰 *TOTAL A PAGAR: S/ ${finalTotal.toFixed(2)}*`);
      lines.push(``);

      lines.push(`📍 *INFORMACIÓN DE ENTREGA:*`);
      lines.push(`👤 *Cliente:* ${customerName.trim()}`);
      if (customerPhone.trim()) lines.push(`📱 *WhatsApp:* ${customerPhone.trim()}`);

      if (deliveryType === "delivery") {
        lines.push(`🏠 *Dirección:* ${address.trim()}`);
        if (reference.trim()) lines.push(`📌 *Referencia:* ${reference.trim()}`);
      } else {
        lines.push(`🏬 *Punto de Retiro:* En tienda (${storeConfig.address})`);
      }

      lines.push(``);
      lines.push(`💳 *MÉTODO DE PAGO:* ${paymentMethod.toUpperCase()}`);
      if (paymentMethod === "efectivo" && cashAmount.trim()) {
        lines.push(`💵 *Paga con billete de:* S/ ${cashAmount.trim()} (llevar vuelto)`);
      }

      if (orderNotes.trim()) {
        lines.push(``);
        lines.push(`📝 *INDICACIONES ADICIONALES:*`);
        lines.push(`_${orderNotes.trim()}_`);
      }

      lines.push(``);
      lines.push(`_⚡ Enviado desde Komi Tienda Digital_`);

      const messageText = lines.join("\n");
      const cleanPhone = storeConfig.whatsapp.replace(/\D/g, "");
      const finalPhone = cleanPhone.startsWith("51") ? cleanPhone : `51${cleanPhone}`;
      const waUrl = `https://wa.me/${finalPhone}?text=${encodeURIComponent(messageText)}`;

      // 3. Abrir WhatsApp
      window.open(waUrl, "_blank");

      // 4. Limpiar carrito y mostrar modal de éxito
      clearCart();
      setCompletedOrder({ id: orderId, total: finalTotal });
      setIsCheckoutOpen(false);
    } catch (err) {
      console.error("Error creating order:", err);
      alert("Hubo un problema al procesar el pedido. Por favor intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black antialiased">
      {/* 1. TOP BAR ULTRA LIMPIA (Branding Tienda + Compartir + Carrito Rápido) */}
      <header className="sticky top-0 z-40 bg-stone-950/85 backdrop-blur-xl border-b border-stone-800/80 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {/* Logo y Nombre Tienda */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-stone-900 border border-stone-800 flex items-center justify-center shrink-0 relative shadow-sm">
              {storeConfig.logo_url ? (
                <Image
                  src={storeConfig.logo_url}
                  alt={storeConfig.name}
                  fill
                  sizes="36px"
                  className="object-contain p-0.5"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-black font-black text-sm">
                  {storeConfig.name?.charAt(0) || "K"}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-white tracking-tight truncate leading-tight">
                {storeConfig.name}
              </h2>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium leading-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {storeConfig.isOpen ? "Abierto • Pedidos por WhatsApp" : "Pausado"}
              </span>
            </div>
          </div>

          {/* Acciones de Cabecera */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Botón Compartir */}
            <button
              type="button"
              onClick={handleCopyLink}
              title="Copiar link de la tienda"
              className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              {copiedLink ? (
                <>
                  <Check size={14} className="text-emerald-400" />
                  <span className="text-emerald-400 text-[11px] font-bold hidden sm:inline">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 size={14} />
                  <span className="hidden sm:inline text-[11px]">Compartir</span>
                </>
              )}
            </button>

            {/* Carrito Icono */}
            <button
              type="button"
              onClick={() => setIsCheckoutOpen(true)}
              className="relative p-2 rounded-xl bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/30 transition-all cursor-pointer shadow-sm"
              title="Ver Carrito"
            >
              <ShoppingCart size={17} />
              {getItemCount() > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-in zoom-in">
                  {getItemCount()}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 2. COVER / BRAND HERO HEADER (Estilo Uber Eats / PedidosYa) */}
      <section className="relative bg-gradient-to-b from-stone-900 to-stone-950 border-b border-stone-800/80">
        {/* Banner de Fondo con Imagen de Portada */}
        <div className="relative h-36 sm:h-52 w-full overflow-hidden bg-stone-900">
          <Image
            src={storeConfig.banner_url || "/Fondo restaurante.png"}
            alt="Cover"
            fill
            sizes="100vw"
            className="object-cover opacity-60"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-black/30" />
        </div>

        {/* Tarjeta de Información Comercial */}
        <div className="max-w-4xl mx-auto px-4 -mt-14 relative z-10 pb-5">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
            {/* Avatar / Logo Grande */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-stone-900 overflow-hidden flex items-center justify-center shadow-2xl border-4 border-stone-950 shrink-0 relative">
              {storeConfig.logo_url ? (
                <Image
                  src={storeConfig.logo_url}
                  alt={storeConfig.name}
                  fill
                  sizes="(max-width: 640px) 80px, 96px"
                  className="object-contain p-1.5 bg-black/40"
                  priority
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-black font-black text-3xl sm:text-4xl">
                  {storeConfig.name?.charAt(0) || "K"}
                </div>
              )}
            </div>

            {/* Textos y Badges */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {storeConfig.name}
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <BadgeCheck size={13} />
                  Verificado
                </span>
              </div>

              <p className="text-xs text-stone-400 mt-1 max-w-xl line-clamp-2">
                {storeConfig.description}
              </p>

              {/* Métricas / Badges Rápidos */}
              <div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-4 mt-2.5 text-xs text-stone-300 flex-wrap">
                <span className="inline-flex items-center gap-1 bg-stone-900/80 px-2.5 py-1 rounded-lg border border-stone-800 text-[11px]">
                  <Star size={12} className="text-amber-400 fill-amber-400" />
                  <span className="font-bold text-white">4.9</span> (120+ pedidos)
                </span>

                <span className="inline-flex items-center gap-1 bg-stone-900/80 px-2.5 py-1 rounded-lg border border-stone-800 text-[11px]">
                  <Bike size={13} className="text-amber-400" />
                  Delivery S/ {storeConfig.deliveryCost.toFixed(2)}
                </span>

                <span className="inline-flex items-center gap-1 bg-stone-900/80 px-2.5 py-1 rounded-lg border border-stone-800 text-[11px]">
                  <Clock size={12} className="text-stone-400" />
                  25 - 40 min
                </span>

                <span className="inline-flex items-center gap-1 bg-stone-900/80 px-2.5 py-1 rounded-lg border border-stone-800 text-[11px] text-stone-400">
                  <MapPin size={12} className="text-amber-400" />
                  {storeConfig.address}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BUSCADOR & FILTROS DE CATEGORÍAS (Sticky) */}
      <section className="sticky top-[57px] z-30 bg-stone-950/95 backdrop-blur-md border-b border-stone-800/80 py-3 shadow-md">
        <div className="max-w-4xl mx-auto px-4 space-y-2.5">
          {/* Input Buscador */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar platos, bebidas, postres..."
              className="w-full pl-10 pr-9 py-2.5 bg-stone-900/90 border border-stone-800 rounded-xl text-xs sm:text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-500/80 transition-colors shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white p-0.5 cursor-pointer"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Chips Horizontales de Categorías */}
          <div className="overflow-x-auto no-scrollbar flex items-center gap-2 pt-0.5">
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
                      ? "bg-amber-500 text-black shadow-md shadow-amber-500/25 font-bold"
                      : "bg-stone-900/80 text-stone-400 border border-stone-800 hover:border-stone-700 hover:text-white"
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isActive ? "bg-black/20 text-black" : "bg-stone-800 text-stone-400"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. CATÁLOGO DE PRODUCTOS (Grid Ultra Visual & Clean) */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-3 sm:px-4 py-6 pb-32">
        {loadingProducts ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-stone-400 text-xs font-medium">Cargando menú en vivo...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-stone-900/40 rounded-3xl border border-stone-800/80 p-8 max-w-md mx-auto">
            <AlertCircle size={36} className="text-stone-500 mx-auto mb-2" />
            <h3 className="text-base font-bold text-white">No hay productos en esta selección</h3>
            <p className="text-xs text-stone-400 mt-1">
              Prueba cambiando de categoría o borrando tu término de búsqueda.
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Si no hay búsqueda y está en "TODOS", agrupamos por categoría con encabezados elegantes */}
            {groupedProducts ? (
              Object.entries(groupedProducts).map(([categoryName, catProducts]) => (
                <div key={categoryName} className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-stone-800/80 pb-2">
                    <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                      {categoryName}
                    </h3>
                    <span className="text-xs font-semibold text-stone-400">
                      ({catProducts.length})
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4">
                    {catProducts.map((product) => renderProductCard(product))}
                  </div>
                </div>
              ))
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4">
                {filteredProducts.map((product) => renderProductCard(product))}
              </div>
            )}
          </div>
        )}

        {/* Footer Powered by Komi */}
        <footer className="mt-16 pt-8 pb-16 border-t border-stone-800 text-center flex flex-col items-center justify-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900/90 border border-stone-800 hover:border-stone-700 transition-all shadow-sm group"
          >
            <span className="text-[11px] text-stone-400 font-medium">Tecnología provista por</span>
            <div className="relative w-5 h-5 rounded-full overflow-hidden bg-white shrink-0 border border-amber-500/30">
              <Image
                src="/logokomi.png"
                alt="Komi"
                fill
                className="object-cover scale-[1.2] object-center"
                unoptimized
              />
            </div>
            <span className="text-xs font-black text-white group-hover:text-amber-400 transition-colors">
              Komi
            </span>
          </Link>
          <p className="text-[10px] text-stone-300">
            Crea tu propia tienda online y digitaliza tu restaurante
          </p>
        </footer>
      </main>

      {/* 5. FLOATING BOTTOM CART BAR (Aparece cuando hay productos) */}
      {getItemCount() > 0 && (
        <div className="fixed bottom-4 inset-x-3 sm:inset-x-auto sm:right-6 sm:w-[420px] z-40 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <button
            type="button"
            onClick={() => setIsCheckoutOpen(true)}
            className="w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold p-3.5 rounded-2xl shadow-2xl shadow-emerald-500/30 flex items-center justify-between border border-emerald-400/40 cursor-pointer active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-black/25 flex items-center justify-center shrink-0">
                <ShoppingCart size={18} />
              </div>
              <div className="text-left leading-tight">
                <p className="text-[11px] font-semibold text-emerald-100">
                  {getItemCount()} {getItemCount() === 1 ? "ítem añadido" : "ítems añadidos"}
                </p>
                <p className="text-sm font-black tracking-tight">
                  Total: S/ {finalTotal.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider bg-black/25 px-3.5 py-2 rounded-xl">
              <span>Ver Pedido</span>
              <ChevronRight size={16} />
            </div>
          </button>
        </div>
      )}

      {/* 6. MODAL DE DETALLE DE PRODUCTO (Al hacer clic en la foto o título) */}
      {selectedProductDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-sm bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedProductDetail(null)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="relative aspect-video w-full bg-stone-950">
              <Image
                src={selectedProductDetail.image || "/menú.webp"}
                alt={selectedProductDetail.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            <div className="p-5 space-y-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                    {selectedProductDetail.category || "General"}
                  </span>
                  {isProductChargingTaper(selectedProductDetail) ? (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30">
                      🥡 Envase +S/ 1.00
                    </span>
                  ) : (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 font-medium">
                      Exento de táper
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-black text-white mt-1">
                  {selectedProductDetail.title}
                </h3>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                  {selectedProductDetail.description || "Delicioso plato preparado con ingredientes frescos y seleccionados."}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-400 block uppercase">Precio</span>
                  <span className="text-lg font-black text-amber-400">
                    S/ {selectedProductDetail.price.toFixed(2)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    addItem(selectedProductDetail);
                    setSelectedProductDetail(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <Plus size={15} />
                  <span>Añadir al Carrito</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL / DRAWER DE CHECKOUT VENTA A WHATSAPP */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full sm:max-w-lg bg-stone-900 border border-stone-800 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Carrito */}
            <div className="p-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/80 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <MessageCircle size={17} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Completar Pedido por WhatsApp</h3>
                  <p className="text-[11px] text-stone-400">Envío directo sin pasarelas ni tarjetas obligatorias</p>
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

            {/* Formulario de Checkout */}
            <form onSubmit={handleSendWhatsAppOrder} className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* 1. Lista de Productos */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-stone-400 font-semibold px-1">
                  <span>Productos ({getItemCount()})</span>
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={12} />
                    Vaciar
                  </button>
                </div>

                <div className="bg-stone-950/80 rounded-2xl border border-stone-800/80 divide-y divide-stone-800/60 overflow-hidden">
                  {cartItems.map((item) => {
                    const chargesTaper = isProductChargingTaper(item);
                    return (
                      <div key={item.id} className="p-3 flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-xs font-bold text-white truncate">{item.title}</p>
                            {chargesTaper ? (
                              <span
                                className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30 shrink-0"
                                title="Este plato incluye envase/táper (+S/ 1.00 c/u)"
                              >
                                +Táper S/ 1.00
                              </span>
                            ) : (
                              <span
                                className="text-[9px] px-1.5 py-0.5 rounded bg-stone-800 text-stone-400 font-medium shrink-0"
                                title="Exento de táper"
                              >
                                Sin táper
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-400 mt-0.5">
                            S/ {item.price.toFixed(2)} x {item.quantity} ={" "}
                            <span className="font-bold text-amber-400">
                              S/ {(item.price * item.quantity).toFixed(2)}
                            </span>
                          </p>
                        </div>

                      <div className="flex items-center gap-1 bg-stone-900 rounded-xl p-1 border border-stone-800 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-lg bg-stone-800 hover:bg-stone-700 text-white flex items-center justify-center cursor-pointer"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-bold text-white px-2">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-lg bg-stone-800 hover:bg-stone-700 text-white flex items-center justify-center cursor-pointer"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>

              {/* 2. Modalidad de Entrega */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-300">Modalidad de Entrega</label>
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
                      <p className="text-xs leading-none">Delivery</p>
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
                      <p className="text-xs leading-none">Retiro en Local</p>
                      <p className="text-[10px] opacity-75 mt-0.5">Gratis</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* 3. Datos del Cliente */}
              <div className="space-y-3 bg-stone-950/80 p-3.5 rounded-2xl border border-stone-800/80">
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Receipt size={14} className="text-amber-400" />
                  Datos de Entrega
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ej. Juan Pérez"
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                      WhatsApp / Celular
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Ej. 987654321"
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {deliveryType === "delivery" && (
                  <div className="space-y-2">
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
                        className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                        Referencia
                      </label>
                      <input
                        type="text"
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        placeholder="Ej. Frente a la plaza, reja blanca"
                        className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Método de Pago */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-300">Forma de Pago</label>
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
                    <span className="text-xs">Transferencia</span>
                  </button>
                </div>

                {paymentMethod === "efectivo" && (
                  <div className="mt-2">
                    <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                      ¿Con cuánto pagarás? (Para llevarte vuelto exacto)
                    </label>
                    <input
                      type="number"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      placeholder="Ej. 50 o 100"
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}
              </div>

              {/* 5. Notas Adicionales */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                  Observaciones / Notas adicionales
                </label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Ej. Enviar servilletas, sin picante, llamar al llegar..."
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* 6. Desglose de Pago */}
              <div className="p-3.5 rounded-2xl bg-stone-950/90 border border-stone-800/80 space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-400">
                  <span>Subtotal productos:</span>
                  <span>S/ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-300">
                  <span className="flex items-center gap-1">
                    <span>Envases / Táperes ({taperItemCount}):</span>
                  </span>
                  <span className={taperCost > 0 ? "text-amber-400 font-bold" : "text-stone-500"}>
                    {taperCost > 0 ? `S/ ${taperCost.toFixed(2)}` : "S/ 0.00 (Exento)"}
                  </span>
                </div>
                <div className="flex justify-between text-stone-400">
                  <span>Costo de envío:</span>
                  <span>
                    {deliveryType === "delivery"
                      ? (deliveryFee > 0 ? `S/ ${deliveryFee.toFixed(2)}` : "Gratis")
                      : "Retiro en local (Gratis)"}
                  </span>
                </div>
                <div className="pt-2 border-t border-stone-800 flex justify-between text-sm font-black text-white">
                  <span>TOTAL A PAGAR:</span>
                  <span className="text-emerald-400">S/ {finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* 7. Botón Principal Verde WhatsApp */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 active:scale-[0.99] text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                <MessageCircle size={20} className="fill-white" />
                <span>
                  {isSubmitting
                    ? "Abriendo WhatsApp..."
                    : `Pedir por WhatsApp • S/ ${finalTotal.toFixed(2)}`}
                </span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 8. CONFIRMACIÓN DE PEDIDO ENVIADO */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-stone-900 border border-stone-800 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h3 className="text-xl font-black text-white">¡Pedido enviado a WhatsApp!</h3>
              <p className="text-xs text-stone-400 mt-1">
                Orden registrada exitosamente con el código{" "}
                <span className="font-bold text-amber-400">#{completedOrder.id}</span>
              </p>
            </div>

            <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800 text-xs text-stone-300 text-left space-y-1">
              <p>• Hemos abierto WhatsApp con tu pedido ya armado.</p>
              <p>• Presiona "Enviar" en WhatsApp para que el local prepare tu orden.</p>
            </div>

            <button
              type="button"
              onClick={() => setCompletedOrder(null)}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Volver a la tienda
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Helper para renderizar cada tarjeta de producto
  function renderProductCard(product: Product) {
    const qtyInCart = getProductCartQty(product.id);
    const isOutOfStock = product.stock <= 0;
    const isLowStock = product.stock > 0 && product.stock <= 3;

    return (
      <div
        key={product.id}
        className={`group bg-stone-900/80 rounded-2xl border transition-all flex flex-col overflow-hidden relative ${
          isOutOfStock
            ? "border-stone-800/60 opacity-60"
            : "border-stone-800 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5"
        }`}
      >
        {/* Imagen del Producto */}
        <div
          onClick={() => setSelectedProductDetail(product)}
          className="relative aspect-square w-full bg-stone-950 overflow-hidden cursor-pointer"
        >
          <Image
            src={product.image || "/menú.webp"}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />

          {/* Badge Top / Destacado */}
          {product.featured && (
            <span className="absolute top-2 left-2 bg-amber-500 text-black text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
              Top
            </span>
          )}

          {/* Badge de Stock */}
          {isOutOfStock ? (
            <span className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center text-white text-xs font-black uppercase tracking-wider">
              Agotado
            </span>
          ) : isLowStock ? (
            <span className="absolute bottom-2 left-2 bg-rose-500/95 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow">
              ¡Últimas {product.stock}!
            </span>
          ) : null}
        </div>

        {/* Info y Botones */}
        <div className="p-3 flex-1 flex flex-col justify-between">
          <div onClick={() => setSelectedProductDetail(product)} className="cursor-pointer">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider line-clamp-1">
                {product.category || "General"}
              </span>
              {isProductChargingTaper(product) && (
                <span
                  className="text-[8px] font-bold text-amber-400/90 bg-amber-500/15 px-1 py-0.2 rounded border border-amber-500/25 shrink-0"
                  title="Requiere táper (+S/ 1.00)"
                >
                  +Táper
                </span>
              )}
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 mt-0.5 leading-snug">
              {product.title}
            </h4>
            {product.description && (
              <p className="text-[11px] text-stone-400 line-clamp-1 mt-1 leading-tight hidden sm:block">
                {product.description}
              </p>
            )}
          </div>

          <div className="mt-3 pt-2 border-t border-stone-800/80 flex items-center justify-between gap-1.5">
            <span className="text-xs sm:text-sm font-black text-white">
              S/ {product.price.toFixed(2)}
            </span>

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
  }
}
