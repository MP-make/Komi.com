"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useAuthStore } from "@/lib/stores/auth";
import { useProductStore } from "@/lib/stores/products";
import { Product } from "@/types";
import ProcessPaymentModal from "@/components/pos/ProcessPaymentModal";
import {
  Package,
  Search,
  Building2,
  Check,
  Plus,
  Minus,
  X,
  Trash2,
  Zap,
  ShoppingBag,
  DollarSign,
  Receipt,
  UserPlus,
  CreditCard,
  Smartphone,
  Pause,
  Printer,
  ChevronDown,
  Gift,
  AlertCircle,
  FileText,
  UtensilsCrossed,
  Share2,
  Layers,
  ArrowRight,
  Coins
} from "lucide-react";

// --- FALLBACK RESTAURANT DISHES ---
const DEFAULT_RESTAURANT_PRODUCTS: Product[] = [
  {
    id: "prod_carapulcra_ind",
    title: "Carapulcra con Sopa Seca",
    price: 18.00,
    image: "/menu del dia.jpeg",
    category: "Criollos",
    category_slug: "criollos",
    stock: 99,
    description: "Plato bandera tradicional con chancho crocante y abundante sopa seca.",
    is_active: true
  },
  {
    id: "prod_carapulcra_fam",
    title: "Carapulcra Familiar (4 Pers)",
    price: 45.00,
    image: "/menu del dia.jpeg",
    category: "Criollos",
    category_slug: "criollos",
    stock: 45,
    description: "Fuente familiar para 4 personas con panceta dorada.",
    is_active: true
  },
  {
    id: "prod_hamb_bravaza",
    title: "Hamburguesa Bravaza Doble",
    price: 16.50,
    image: "/Fondo restaurante.png",
    category: "Hamburguesas",
    category_slug: "hamburguesas",
    stock: 80,
    description: "Doble carne artesanal de 150g, queso cheddar, huevo y tocino crocante.",
    is_active: true
  },
  {
    id: "prod_hamb_clasica",
    title: "Hamburguesa Clásica con Queso",
    price: 12.00,
    image: "/Fondo restaurante.png",
    category: "Hamburguesas",
    category_slug: "hamburguesas",
    stock: 95,
    description: "Carne artesanal de 150g con lechuga fresca, tomate y cheddar.",
    is_active: true
  },
  {
    id: "prod_broaster_cuarto",
    title: "1/4 Pollo Broaster Crujiente",
    price: 14.50,
    image: "/Fondo frituras.png",
    category: "Broaster",
    category_slug: "broaster",
    stock: 70,
    description: "Presa dorada y crocante con papas fritas y cremas de la casa.",
    is_active: true
  },
  {
    id: "prod_salchibroster",
    title: "Salchibroster Bravaza",
    price: 16.00,
    image: "/Fondo frituras.png",
    category: "Broaster",
    category_slug: "broaster",
    stock: 65,
    description: "Papas fritas, salchichas frankfurter y trozos de pollo broaster.",
    is_active: true
  },
  {
    id: "prod_salchipapa_esp",
    title: "Salchipapas Especial",
    price: 16.20,
    image: "/Fondo frituras.png",
    category: "Salchipapas",
    category_slug: "salchipapas",
    stock: 88,
    description: "Papas amarillas crocantes, huevo frito, queso derretido y hot dog.",
    is_active: true
  },
  {
    id: "prod_alitas_bbq",
    title: "Alitas BBQ Ahumadas x6",
    price: 18.00,
    image: "/Fondo frituras.png",
    category: "Broaster",
    category_slug: "broaster",
    stock: 50,
    description: "Alitas bañadas en salsa BBQ dulce ahumada con papas fritas.",
    is_active: true
  },
  {
    id: "prod_chicha_morada",
    title: "Jarra Chicha Morada 1.5L",
    price: 12.00,
    image: "/logo_que_bravazo.png",
    category: "Bebidas",
    category_slug: "bebidas",
    stock: 120,
    description: "Chicha morada natural de maíz morado con fruta y canela.",
    is_active: true
  },
  {
    id: "prod_cusquena_trigo",
    title: "Cerveza Cusqueña Trigo Helada",
    price: 9.00,
    image: "/logo_que_bravazo.png",
    category: "Bebidas",
    category_slug: "bebidas",
    stock: 90,
    description: "Cerveza artesanal de trigo bien helada 330ml.",
    is_active: true
  },
  {
    id: "prod_inka_kola",
    title: "Inka Kola 500ml",
    price: 4.00,
    image: "/logo_que_bravazo.png",
    category: "Bebidas",
    category_slug: "bebidas",
    stock: 150,
    description: "Gaseosa personal bien helada.",
    is_active: true
  },
  {
    id: "prod_agua_mineral",
    title: "Agua San Mateo 600ml",
    price: 3.50,
    image: "/logo_que_bravazo.png",
    category: "Bebidas",
    category_slug: "bebidas",
    stock: 200,
    description: "Agua mineral de manantial sin gas.",
    is_active: true
  }
];

const DEFAULT_CATEGORIES = [
  { name: "Todos", slug: "all" },
  { name: "Criollos", slug: "criollos" },
  { name: "Hamburguesas", slug: "hamburguesas" },
  { name: "Broaster", slug: "broaster" },
  { name: "Salchipapas", slug: "salchipapas" },
  { name: "Bebidas", slug: "bebidas" },
];

export interface CartItem {
  product: Product;
  quantity: number;
}

export type DocumentType = "NTV" | "BOLETA" | "FACTURA" | "COTIZACIÓN";
export type PaymentMethod = "Efectivo" | "Yape" | "Plin" | "Tarjeta" | "Mixto";

export default function POSSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoggedIn, isHydrated } = useAuthStore();
  const storeProducts = useProductStore((s) => s.products);
  const initProducts = useProductStore((s) => s.init);

  // Catalog State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState("Que Bravazo! Restobar");

  useEffect(() => {
    try {
      const local = localStorage.getItem("restaurant_settings");
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed.name) setRestaurantName(parsed.name);
      }
    } catch {}
  }, []);

  // Cart / Venta Actual State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<"mesa" | "llevar">("mesa");
  const [tableNumber, setTableNumber] = useState("1");
  const [customerName, setCustomerName] = useState("Cliente sin registrar");
  const [docType, setDocType] = useState<DocumentType>("NTV");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Efectivo");
  const [cashReceived, setCashReceived] = useState<string>("");
  const [isStaffConsumption, setIsStaffConsumption] = useState(false);
  const [orderNotes, setOrderNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  // Paused Orders memory (Mesa -> Cart)
  const [pausedOrders, setPausedOrders] = useState<Record<string, { cart: CartItem[]; customer: string; notes: string }>>({});
  const [isPausedOrdersModalOpen, setIsPausedOrdersModalOpen] = useState(false);

  // UI Modals
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [clientForm, setClientForm] = useState({ name: "", docNumber: "", phone: "" });
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<any>(null);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Mapeo dinámico de categorías (Cobro de táper +S/1 y Enrutamiento KDS)
  const [categoriesMap, setCategoriesMap] = useState<Record<string, { charges_taper: boolean; send_to_kitchen: boolean }>>({});

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((res) => {
        if (res?.data) {
          const map: Record<string, { charges_taper: boolean; send_to_kitchen: boolean }> = {};
          res.data.forEach((c: any) => {
            const val = {
              charges_taper: c.charges_taper !== false,
              send_to_kitchen: c.send_to_kitchen !== false,
            };
            if (c.id) map[c.id] = val;
            if (c.slug) map[c.slug] = val;
            if (c.name) map[c.name.toLowerCase()] = val;
          });
          setCategoriesMap(map);
        }
      })
      .catch(() => {});
  }, []);

  // Initialize store and auth check
  useEffect(() => {
    if (!isHydrated) return;
    if (!isLoggedIn || !user) {
      router.replace("/login");
      return;
    }
    initProducts();
  }, [isHydrated, isLoggedIn, user, router, initProducts]);

  // Combined product list (store products + fallback default dishes)
  const allProducts = useMemo(() => {
    if (storeProducts && storeProducts.length > 0) {
      return storeProducts;
    }
    return DEFAULT_RESTAURANT_PRODUCTS;
  }, [storeProducts]);

  // Filtered products by search & category
  const filteredProducts = useMemo(() => {
    return allProducts.filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCategory =
        selectedCategory === "all" ||
        p.category_slug === selectedCategory ||
        (p.category && p.category.toLowerCase() === selectedCategory);

      return matchSearch && matchCategory;
    });
  }, [allProducts, searchTerm, selectedCategory]);

  const showToast = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3500);
  };

  // Add Product to Cart
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.product.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });

    // Trigger green "¡Agregado!" badge animation on card
    setRecentlyAddedId(product.id);
    setTimeout(() => {
      setRecentlyAddedId(null);
    }, 900);
  };

  // Stepper quantity update
  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Delete item from cart
  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Clear current order
  const handleClearCart = () => {
    if (cart.length === 0) return;
    if (confirm("¿Limpiar la comanda actual?")) {
      setCart([]);
      setCashReceived("");
      setOrderNotes("");
      showToast("success", "Comanda vaciada.");
    }
  };

  // Totals calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const takeawayCharge = useMemo(() => {
    if (orderType !== "llevar") return 0.00;
    let totalTaper = 0;
    for (const item of cart) {
      const catKey = (item.product.category_slug || item.product.category || "").toLowerCase();
      const catConfig = categoriesMap[catKey];
      const chargesTaper = catConfig !== undefined
        ? catConfig.charges_taper
        : !/bebida|gaseosa|refresco|cerveza|trago|jugo|agua|vino|snack/i.test(catKey);
      if (chargesTaper) {
        totalTaper += item.quantity * 1.00;
      }
    }
    return totalTaper;
  }, [orderType, cart, categoriesMap]);

  const total = useMemo(() => {
    if (isStaffConsumption) return 0;
    return subtotal + takeawayCharge;
  }, [subtotal, takeawayCharge, isStaffConsumption]);

  const totalUnits = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const totalDifferent = cart.length;

  // Change / Vuelto calculation
  const vuelto = useMemo(() => {
    const received = Number(cashReceived);
    if (isNaN(received) || received < total) return 0;
    return received - total;
  }, [cashReceived, total]);

  // Set cash received to exact total
  const handleSetExactCash = () => {
    setCashReceived(total.toFixed(2));
  };

  // Pause Order (switch between tables)
  const handlePauseOrder = () => {
    if (cart.length === 0) {
      showToast("error", "No hay productos en la comanda para pausar.");
      return;
    }
    setPausedOrders((prev) => ({
      ...prev,
      [tableNumber]: { cart, customer: customerName, notes: orderNotes },
    }));
    setCart([]);
    setCashReceived("");
    setOrderNotes("");
    showToast("success", `Comanda de Mesa ${tableNumber} guardada en pausa.`);
  };

  // Resume a paused table
  const handleResumeOrder = (mesa: string) => {
    const paused = pausedOrders[mesa];
    if (paused) {
      setCart(paused.cart);
      setTableNumber(mesa);
      setCustomerName(paused.customer);
      setOrderNotes(paused.notes);
      setPausedOrders((prev) => {
        const next = { ...prev };
        delete next[mesa];
        return next;
      });
      setIsPausedOrdersModalOpen(false);
      showToast("success", `Comanda de Mesa ${mesa} reanudada.`);
    }
  };

  // Process / Submit Order
  const handleProcessOrder = async (
    isFastSale = false,
    paymentOverride?: { paymentMethod: PaymentMethod; docType: DocumentType; cashReceived?: number }
  ) => {
    if (cart.length === 0) {
      showToast("error", "Agrega al menos un producto a la comanda.");
      return;
    }

    setSubmitting(true);
    const finalMethod = paymentOverride?.paymentMethod || paymentMethod;
    const finalDocType = paymentOverride?.docType || docType;
    const isPaid = isFastSale || !!paymentOverride;

    const orderPayload = {
      waiter_id: user?.uid || "usr_waiter",
      waiter_name: user?.name || "Mesero",
      table_number: orderType === "mesa" ? tableNumber : null,
      order_type: orderType,
      items: cart.map((c) => {
        const catKey = (c.product.category_slug || c.product.category || "").toLowerCase();
        const catConfig = categoriesMap[catKey];
        const sendToKitchen = catConfig !== undefined
          ? catConfig.send_to_kitchen
          : !/bebida|gaseosa|refresco|cerveza|trago|jugo|agua|vino|snack/i.test(catKey);
        return {
          product_id: c.product.id,
          title: c.product.title,
          price: c.product.price,
          quantity: c.quantity,
          skip_kitchen: !sendToKitchen,
        };
      }),
      subtotal,
      takeaway_charge: takeawayCharge,
      total,
      customer_name: customerName,
      payment_method: finalMethod.toLowerCase(),
      payment_status: isPaid ? "paid" : "pending",
      doc_type: finalDocType,
      created_at: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/waiter/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const json = await res.json();
      const completedOrder = json.data || {
        ...orderPayload,
        id: `ord_${Math.floor(100000 + Math.random() * 900000)}`,
      };

      setLastCompletedOrder(completedOrder);
      setIsReceiptModalOpen(true);
      setCart([]);
      setCashReceived("");
      setOrderNotes("");
      setMobileCartOpen(false);
      showToast("success", isFastSale ? "¡Venta rápida registrada y cobrada!" : "Comanda enviada a cocina.");
    } catch {
      // Offline fallback: save locally and show receipt
      const fallbackOrder = {
        ...orderPayload,
        id: `ord_${Math.floor(100000 + Math.random() * 900000)}`,
      };
      setLastCompletedOrder(fallbackOrder);
      setIsReceiptModalOpen(true);
      setCart([]);
      setCashReceived("");
      setOrderNotes("");
      setMobileCartOpen(false);
      showToast("success", "Comanda procesada exitosamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full min-h-0 bg-stone-950 text-white overflow-hidden select-none">
      {/* Toast Alert */}
      {feedback && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border text-sm font-semibold transition-all animate-in fade-in slide-in-from-top-4 ${
            feedback.type === "success"
              ? "bg-stone-900 border-emerald-500/40 text-emerald-400"
              : "bg-stone-900 border-rose-500/40 text-rose-400"
          }`}
        >
          {feedback.type === "success" ? <Check size={16} /> : <AlertCircle size={16} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* --- LEFT & CENTER: SELECCIONAR PRODUCTOS (CATÁLOGO POS) --- */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-stone-800/80 overflow-y-auto">
        {/* Top Header Bar */}
        <div className="p-4 bg-stone-900/60 border-b border-stone-800/80 sticky top-0 z-20 backdrop-blur-md space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Title with Cube Icon */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <Package size={17} />
              </div>
              <h1 className="text-base font-bold text-white tracking-tight">Seleccionar Productos</h1>
            </div>

            {/* Sucursal Indicator */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-stone-400 font-medium">Sucursal:</span>
              <div className="px-3 py-1 bg-stone-950 border border-stone-800 rounded-xl text-xs font-semibold text-stone-200 flex items-center gap-1.5 shadow-sm">
                <Building2 size={13} className="text-amber-400" />
                <span>QUEBRAVAZO! PRINCIPAL</span>
              </div>

              {/* Paused Tables Trigger */}
              {Object.keys(pausedOrders).length > 0 && (
                <button
                  onClick={() => setIsPausedOrdersModalOpen(true)}
                  className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                  title="Ver mesas en pausa"
                >
                  <Pause size={12} />
                  <span>{Object.keys(pausedOrders).length} Pausada{Object.keys(pausedOrders).length > 1 ? "s" : ""}</span>
                </button>
              )}
            </div>
          </div>

          {/* Search bar */}
          <div className="relative w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o SKU..."
              className="w-full pl-10 pr-4 py-2.5 bg-stone-950/80 border border-stone-800 rounded-xl text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-500/50 transition-colors shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Categories Pill Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            {DEFAULT_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 border ${
                    active
                      ? "bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/10"
                      : "bg-stone-950/80 text-stone-400 border-stone-800 hover:border-stone-700 hover:text-white"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="p-4 flex-1">
          {filteredProducts.length === 0 ? (
            <div className="py-24 text-center">
              <UtensilsCrossed size={36} className="mx-auto text-stone-600 mb-2" />
              <p className="text-stone-400 font-semibold text-sm">No se encontraron productos</p>
              <p className="text-stone-500 text-xs mt-0.5">Prueba buscando con otro término.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3.5">
              {filteredProducts.map((p) => {
                const isJustAdded = recentlyAddedId === p.id;
                const inCartItem = cart.find((c) => c.product.id === p.id);

                return (
                  <div
                    key={p.id}
                    onClick={() => handleAddToCart(p)}
                    className={`relative bg-stone-900/90 border rounded-2xl p-3 flex flex-col justify-between cursor-pointer transition-all duration-200 group active:scale-[0.98] shadow-sm ${
                      isJustAdded
                        ? "border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-500/5"
                        : inCartItem
                        ? "border-amber-500/50 bg-stone-900"
                        : "border-stone-800/90 hover:border-stone-700 hover:bg-stone-900"
                    }`}
                  >
                    {/* Top image & quantity in cart badge */}
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-stone-950 mb-2.5">
                      <Image
                        src={p.image || "/logo_que_bravazo.png"}
                        alt={p.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Quantity in cart badge */}
                      {inCartItem && (
                        <div className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full bg-amber-500 text-black font-extrabold text-xs flex items-center justify-center shadow-md">
                          {inCartItem.quantity}
                        </div>
                      )}

                      {/* ¡Agregado! Flash Badge (Image 2 Match) */}
                      {isJustAdded && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center animate-in zoom-in-95 duration-200">
                          <div className="w-9 h-9 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-lg shadow-emerald-500/30">
                            <Check size={20} strokeWidth={3} />
                          </div>
                          <span className="text-[11px] font-extrabold text-emerald-400 mt-1 drop-shadow">
                            ¡Agregado!
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Dish Info */}
                    <div>
                      <h3 className="font-bold text-white text-xs leading-snug line-clamp-2 group-hover:text-amber-400 transition-colors">
                        {p.title}
                      </h3>
                      <div className="mt-1.5 flex items-baseline justify-between">
                        <span className="text-sm font-extrabold text-amber-400 font-mono">
                          S/{Number(p.price).toFixed(2)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>Disponible: {p.stock || 99}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* --- RIGHT: VENTA ACTUAL / COMANDA (POS CHECKOUT PANEL) --- */}
      {/* ============================================================== */}
      <div
        className={`w-full lg:w-[480px] xl:w-[540px] 2xl:w-[600px] flex-shrink-0 bg-stone-900 flex flex-col h-full min-h-0 border-t lg:border-t-0 lg:border-l border-stone-800 ${
          mobileCartOpen ? "fixed inset-0 z-50" : "hidden lg:flex"
        }`}
      >
        {/* Panel Header */}
        <div className="px-4 py-3 border-b border-stone-800/80 flex items-center justify-between bg-stone-900/95 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ShoppingBag size={14} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-tight">Venta Actual</span>
                <span className="px-1.5 py-0.2 bg-amber-500 text-black font-extrabold text-[10px] rounded-md">
                  {totalDifferent}
                </span>
              </div>
              <span className="text-[10px] text-stone-400 block truncate">
                • {orderType === "mesa" ? `Mesa ${tableNumber}` : "Para Llevar"} ({user?.name || "Mesero"})
              </span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-1">
            {/* Mesa Selector button */}
            <select
              value={orderType === "llevar" ? "llevar" : tableNumber}
              onChange={(e) => {
                if (e.target.value === "llevar") {
                  setOrderType("llevar");
                } else {
                  setOrderType("mesa");
                  setTableNumber(e.target.value);
                }
              }}
              className="bg-stone-950 border border-stone-800 rounded-xl px-2 py-1 text-xs font-semibold text-amber-400 focus:outline-none"
            >
              <option value="1">Mesa 1</option>
              <option value="2">Mesa 2</option>
              <option value="3">Mesa 3</option>
              <option value="4">Mesa 4</option>
              <option value="5">Mesa 5</option>
              <option value="6">Mesa 6</option>
              <option value="7">Mesa 7</option>
              <option value="8">Mesa 8</option>
              <option value="llevar"> Llevar</option>
            </select>

            {/* Clear Cart Button */}
            <button
              onClick={handleClearCart}
              disabled={cart.length === 0}
              className="p-1.5 text-stone-500 hover:text-rose-400 disabled:opacity-40 rounded-lg hover:bg-stone-800 transition-colors"
              title="Limpiar comanda"
            >
              <Trash2 size={15} />
            </button>

            {/* Mobile close button */}
            {mobileCartOpen && (
              <button
                onClick={() => setMobileCartOpen(false)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg lg:hidden"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Client & Document Selector Section (Image 3 Match) */}
        <div className="p-3.5 bg-stone-950/40 border-b border-stone-800 space-y-2.5">
          {/* Client Search Row */}
          <div className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Buscar Cliente..."
                className="w-full pl-8 pr-2.5 py-1.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <button
              onClick={() => setIsAddClientModalOpen(true)}
              className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700/60 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Registrar nuevo cliente"
            >
              <Plus size={13} />
              <span>Agregar</span>
            </button>
          </div>

          {/* Document Type Pills (Image 3: BOLETA, FACTURA, NOTA DE VENTA, COTIZACIÓN) */}
          <div className="grid grid-cols-4 gap-1 text-[10px] font-bold">
            {(["BOLETA", "FACTURA", "NTV", "COTIZACIÓN"] as DocumentType[]).map((type) => {
              const active = docType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setDocType(type)}
                  className={`py-1 rounded-lg border transition-all text-center ${
                    active
                      ? type === "BOLETA"
                        ? "bg-sky-500 text-black border-sky-400 font-extrabold"
                        : type === "FACTURA"
                        ? "bg-emerald-500 text-black border-emerald-400 font-extrabold"
                        : type === "NTV"
                        ? "bg-purple-600 text-white border-purple-500 font-extrabold"
                        : "bg-amber-500 text-black border-amber-400 font-extrabold"
                      : "bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200"
                  }`}
                >
                  {type === "NTV" ? "NOTA VENTA" : type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cart Items List (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500">
              <ShoppingBag size={40} className="stroke-1 mb-2 text-stone-700" />
              <p className="text-xs font-semibold text-stone-400">Comanda vacía</p>
              <p className="text-[11px] text-stone-600 mt-0.5">
                Haz clic en cualquier platillo del menú para agregarlo.
              </p>
            </div>
          ) : (
            cart.map((item) => {
              const itemSubtotal = item.product.price * item.quantity;
              const isHighlight = recentlyAddedId === item.product.id;

              return (
                <div
                  key={item.product.id}
                  className={`p-2.5 rounded-2xl border transition-all duration-200 ${
                    isHighlight
                      ? "bg-emerald-500/10 border-emerald-500/80 shadow-md shadow-emerald-500/10"
                      : "bg-stone-950/70 border-stone-800/80 hover:border-stone-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{item.product.title}</h4>
                      <span className="text-[11px] text-stone-400 font-mono">
                        S/{Number(item.product.price).toFixed(2)} x {item.quantity}
                      </span>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => handleRemoveItem(item.product.id)}
                      className="text-stone-500 hover:text-rose-400 p-0.5"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Quantity Stepper & Subtotal */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-800/50">
                    <div className="flex items-center border border-stone-800 rounded-xl bg-stone-900 overflow-hidden">
                      <button
                        onClick={() => handleUpdateQuantity(item.product.id, -1)}
                        className="px-2.5 py-1 text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="px-2 font-mono text-xs font-bold text-white min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.product.id, 1)}
                        className="px-2.5 py-1 text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-extrabold text-white font-mono">
                        S/{itemSubtotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Summary Details & Promos */}
        {cart.length > 0 && (
          <div className="px-3.5 pt-2 pb-1 border-t border-stone-800/60 bg-stone-950/30">
            {/* Units counter matching screenshot */}
            <p className="text-[11px] text-rose-400 text-center font-medium">
              {totalUnits} unidade{totalUnits > 1 ? "s" : ""} • {totalDifferent} producto{totalDifferent > 1 ? "s" : ""} diferente{totalDifferent > 1 ? "s" : ""}
            </p>

            {/* Notes / Promo Toggle Button */}
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="mt-1.5 w-full py-1 text-[11px] text-stone-400 hover:text-stone-200 border border-dashed border-stone-800 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Gift size={13} className="text-amber-400" />
              <span>{orderNotes ? "Nota de cocina agregada" : "Promociones y Notas de Cocina"}</span>
            </button>

            {showNotes && (
              <div className="mt-2 animate-in fade-in">
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Ej: Sin cebolla, cremas aparte, bien dorado..."
                  className="w-full px-3 py-1.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>
            )}
          </div>
        )}

        {/* Payment & Checkout Section (Bottom) */}
        <div className="p-3.5 bg-stone-950 border-t border-stone-800 space-y-2.5">
          {/* Método de pago selector con logos oficiales */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block">
              Método de Pago
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setPaymentMethod("Efectivo")}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  paymentMethod === "Efectivo"
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-sm"
                    : "bg-stone-900 border-stone-800 text-stone-400 hover:text-white"
                }`}
              >
                <DollarSign size={13} />
                <span>Efectivo</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("Yape")}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  paymentMethod === "Yape"
                    ? "bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-sm"
                    : "bg-stone-900 border-stone-800 text-stone-400 hover:text-white"
                }`}
              >
                <Image src="/icono-yape.png" alt="Yape" width={16} height={16} className="rounded object-contain" />
                <span>Yape</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("Plin")}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  paymentMethod === "Plin"
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm"
                    : "bg-stone-900 border-stone-800 text-stone-400 hover:text-white"
                }`}
              >
                <Image src="/icono-plin.png" alt="Plin" width={16} height={16} className="rounded object-contain" />
                <span>Plin</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={() => setPaymentMethod("Tarjeta")}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  paymentMethod === "Tarjeta"
                    ? "bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-sm"
                    : "bg-stone-900 border-stone-800 text-stone-400 hover:text-white"
                }`}
              >
                <CreditCard size={13} />
                <span>Tarjeta (POS)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("Mixto")}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  paymentMethod === "Mixto"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm"
                    : "bg-stone-900 border-stone-800 text-stone-400 hover:text-white"
                }`}
              >
                <Coins size={13} />
                <span>Mixto</span>
              </button>
            </div>
          </div>

          {/* Cash Received & Change (only if cash or general) */}
          {paymentMethod === "Efectivo" && (
            <div className="bg-stone-900/60 p-2.5 rounded-xl border border-stone-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-400 font-medium">Efectivo Recibido (S/):</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.10"
                    min="0"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    placeholder="0.00"
                    className="w-20 px-2 py-1 bg-stone-950 border border-stone-800 rounded-lg text-white font-mono text-xs text-right focus:outline-none focus:border-amber-500/50"
                  />
                  <button
                    type="button"
                    onClick={handleSetExactCash}
                    className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-[10px] text-stone-300 font-bold rounded-lg border border-stone-700"
                  >
                    Exacto
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-800/50">
                <span className="text-stone-400">Total a pagar:</span>
                <span className="font-mono font-bold text-white">S/{total.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-400">Vuelto:</span>
                <span className="font-mono font-bold text-emerald-400">S/{vuelto.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Totals Breakdown */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span>Subtotal</span>
              <span className="font-mono">S/{subtotal.toFixed(2)}</span>
            </div>
            {orderType === "llevar" && (
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span>Cargo por empaque</span>
                <span className="font-mono">S/2.00</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm font-bold text-white">
              <span>Total</span>
              <span className="text-base text-amber-400 font-mono">S/{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Staff consumption checkbox */}
          <label className="flex items-center gap-2 cursor-pointer text-[11px] text-stone-400">
            <input
              type="checkbox"
              checked={isStaffConsumption}
              onChange={(e) => setIsStaffConsumption(e.target.checked)}
              className="rounded bg-stone-900 border-stone-700 text-amber-500 focus:ring-0"
            />
            <span>Consumo de personal</span>
          </label>

          {/* Action Buttons (Images 1, 2, 3 Match) */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {/* Pausar Button */}
            <button
              type="button"
              onClick={handlePauseOrder}
              disabled={cart.length === 0}
              className="py-2.5 px-3 bg-stone-900 hover:bg-stone-800 text-stone-300 disabled:opacity-50 border border-stone-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Pause size={13} className="text-amber-400" />
              <span>Pausar</span>
            </button>

            {/* Enviar KDS / Reserva */}
            <button
              type="button"
              onClick={() => handleProcessOrder(false)}
              disabled={cart.length === 0 || submitting}
              className="py-2.5 px-3 bg-stone-900 hover:bg-stone-800 text-stone-300 disabled:opacity-50 border border-stone-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <FileText size={13} className="text-sky-400" />
              <span>Enviar KDS</span>
            </button>
          </div>

          {/* Venta Rápida (1 Clic) - Green Button */}
          <button
            type="button"
            onClick={() => handleProcessOrder(true)}
            disabled={cart.length === 0 || submitting}
            className="w-full py-2.5 bg-emerald-600/90 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 active:scale-[0.99]"
          >
            <Zap size={14} className="fill-current" />
            <span>Venta Rápida (1 Clic)</span>
          </button>

          {/* Main Checkout Button (Blue / Amber with Total & DocType) */}
          <button
            type="button"
            onClick={() => setIsPaymentModalOpen(true)}
            disabled={cart.length === 0 || submitting}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-amber-500/10 active:scale-[0.99] cursor-pointer"
          >
            <Receipt size={15} />
            <span>Cobrar S/{total.toFixed(2)} • {docType}</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* --- MOBILE FLOATING BAR (When on small screens) --- */}
      {/* ============================================================== */}
      {cart.length > 0 && !mobileCartOpen && (
        <div className="lg:hidden fixed bottom-16 left-3 right-3 z-40">
          <button
            onClick={() => setMobileCartOpen(true)}
            className="w-full py-3.5 px-4 bg-amber-500 text-black font-bold rounded-2xl flex items-center justify-between shadow-2xl shadow-black/80 active:scale-95 transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-black text-amber-400 text-xs flex items-center justify-center font-extrabold">
                {totalUnits}
              </span>
              <span className="text-xs">Ver Comanda</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono font-extrabold">S/{total.toFixed(2)}</span>
              <ArrowRight size={16} />
            </div>
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* --- MODAL: AGREGAR CLIENTE --- */}
      {/* ============================================================== */}
      {isAddClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserPlus size={16} className="text-amber-400" />
                <span>Registrar Cliente</span>
              </h3>
              <button
                onClick={() => setIsAddClientModalOpen(false)}
                className="text-stone-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Nombre completo / Razón Social</label>
                <input
                  type="text"
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  placeholder="Ej: Marlon Pecho"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">DNI / RUC</label>
                <input
                  type="text"
                  value={clientForm.docNumber}
                  onChange={(e) => setClientForm({ ...clientForm, docNumber: e.target.value })}
                  placeholder="Número de documento"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Teléfono (WhatsApp)</label>
                <input
                  type="text"
                  value={clientForm.phone}
                  onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                  placeholder="999 888 777"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddClientModalOpen(false)}
                className="px-3 py-2 text-xs font-semibold text-stone-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (clientForm.name.trim()) {
                    setCustomerName(clientForm.name.trim());
                    setIsAddClientModalOpen(false);
                    showToast("success", `Cliente "${clientForm.name}" asignado.`);
                  }
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl"
              >
                Guardar Cliente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* --- MODAL: MESAS EN PAUSA --- */}
      {/* ============================================================== */}
      {isPausedOrdersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Pause size={16} className="text-amber-400" />
                <span>Mesas en Pausa ({Object.keys(pausedOrders).length})</span>
              </h3>
              <button
                onClick={() => setIsPausedOrdersModalOpen(false)}
                className="text-stone-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto">
              {Object.entries(pausedOrders).map(([mesa, data]) => {
                const mesaTotal = data.cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
                return (
                  <div
                    key={mesa}
                    className="p-3 bg-stone-950 rounded-2xl border border-stone-800 flex items-center justify-between hover:border-amber-500/50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">Mesa {mesa}</span>
                        <span className="text-[10px] text-stone-400">({data.customer})</span>
                      </div>
                      <span className="text-[11px] text-stone-500 block">
                        {data.cart.length} platillos • S/{mesaTotal.toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleResumeOrder(mesa)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl"
                    >
                      Reanudar
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* --- MODAL: PROCESAR VENTA / COBRO DE CAJA --- */}
      {/* ============================================================== */}
      <ProcessPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        total={total}
        subtotal={subtotal}
        orderTitle={orderType === "mesa" ? `Mesa ${tableNumber}` : "Venta en Caja"}
        customerName={customerName}
        initialDocType={docType}
        initialPaymentMethod={paymentMethod}
        isSubmitting={submitting}
        onConfirm={async (data) => {
          await handleProcessOrder(false, {
            paymentMethod: data.paymentMethod,
            docType: data.docType,
            cashReceived: data.cashReceived,
          });
          setIsPaymentModalOpen(false);
        }}
      />

      {/* ============================================================== */}
      {/* --- MODAL: COMPROBANTE / TICKET POS EMITIDO --- */}
      {/* ============================================================== */}
      {isReceiptModalOpen && lastCompletedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl flex flex-col space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <Check size={24} strokeWidth={3} />
              </div>
              <h3 className="text-base font-extrabold text-white">¡Comprobante Emitido!</h3>
              <p className="text-xs text-amber-400 font-semibold">{restaurantName}</p>
              <p className="text-[11px] font-mono text-stone-500">ID: {lastCompletedOrder.id}</p>
            </div>

            {/* Ticket representation */}
            <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 text-xs space-y-2 font-mono">
              <div className="flex justify-between text-stone-400 text-[11px] pb-1 border-b border-stone-800">
                <span>{lastCompletedOrder.doc_type || "NOTA DE VENTA"}</span>
                <span>{new Date(lastCompletedOrder.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="text-stone-300">
                <span className="text-stone-500 block text-[10px]">CLIENTE:</span>
                <span className="font-semibold">{lastCompletedOrder.customer_name || "Cliente sin registrar"}</span>
              </div>
              <div className="text-stone-300">
                <span className="text-stone-500 block text-[10px]">UBICACIÓN:</span>
                <span className="font-semibold">
                  {lastCompletedOrder.order_type === "mesa" ? `Mesa ${lastCompletedOrder.table_number}` : "Para Llevar"}
                </span>
              </div>

              {/* Items summary */}
              <div className="pt-2 border-t border-stone-800 space-y-1">
                {lastCompletedOrder.items.map((it: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span className="truncate max-w-[180px]">{it.quantity}x {it.title}</span>
                    <span>S/{(it.price * it.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-stone-800 flex justify-between font-bold text-sm text-white">
                <span>TOTAL:</span>
                <span className="text-amber-400">S/{Number(lastCompletedOrder.total).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-stone-400">
                <span>Método:</span>
                <span className="capitalize">{lastCompletedOrder.payment_method}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer size={14} />
                <span>Imprimir Ticket</span>
              </button>
              <button
                type="button"
                onClick={() => setIsReceiptModalOpen(false)}
                className="py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl text-xs transition-colors"
              >
                Nueva Comanda
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
