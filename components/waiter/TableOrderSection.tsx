"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuthStore } from "@/lib/stores/auth";
import { useProductStore } from "@/lib/stores/products";
import { Product, RestaurantTable } from "@/types";
import {
  Utensils,
  ShoppingBag,
  Users,
  Check,
  Plus,
  Minus,
  Trash2,
  Search,
  ArrowLeft,
  Clock,
  Receipt,
  DollarSign,
  QrCode,
  Printer,
  X,
  ChevronRight,
  AlertCircle,
  CookingPot,
  FileText,
  Layers,
  Store,
  RotateCcw,
  CheckCircle2,
  CheckCircle,
  CreditCard,
  Building2,
  Gift
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

const DEFAULT_TABLES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

export interface CartItem {
  product: Product;
  quantity: number;
  itemNotes?: string;
}

export interface ActiveOrder {
  id: string;
  waiter_id: string;
  waiter_name: string;
  table_number: string | null;
  order_type: "mesa" | "llevar";
  items: Array<{
    product_id: string;
    title: string;
    price: number;
    quantity: number;
    notes?: string;
  }>;
  subtotal: number;
  takeaway_charge?: number;
  total: number;
  status: string;
  payment_status: string;
  payment_method?: string | null;
  created_at: string;
  customer_name?: string;
}

export type DocumentType = "NTV" | "BOLETA" | "FACTURA";
export type PaymentMethod = "Efectivo" | "Yape" | "Plin" | "Tarjeta" | "Mixto";

function timeSince(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Ahora";
  if (min < 60) return `${min} min`;
  const hr = Math.floor(min / 60);
  return `${hr}h ${min % 60}m`;
}

export default function TableOrderSection() {
  const router = useRouter();
  const { user, isLoggedIn, isHydrated } = useAuthStore();
  const storeProducts = useProductStore((s) => s.products);
  const initProducts = useProductStore((s) => s.init);

  // Mode: "tables" (Selección de Mesa o Para Llevar) | "order" (Toma de comanda y productos)
  const [viewMode, setViewMode] = useState<"tables" | "order">("tables");

  // Selected Target
  const [orderType, setOrderType] = useState<"mesa" | "llevar">("mesa");
  const [selectedTable, setSelectedTable] = useState<string>("1");
  const [customerName, setCustomerName] = useState<string>("");

  // Orders State from Server
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Existing order in the selected table (if occupied)
  const [existingOrder, setExistingOrder] = useState<ActiveOrder | null>(null);

  // Cart for new items in current order
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderNotes, setOrderNotes] = useState("");
  const [showNotesInput, setShowNotesInput] = useState(false);

  // Catalog Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  // Modals
  const [isTakeawayModalOpen, setIsTakeawayModalOpen] = useState(false);
  const [takeawayClientInput, setTakeawayClientInput] = useState("");

  // Modal de opciones para mesa ocupada (Editar comanda o Cobrar cuenta)
  const [isOccupiedModalOpen, setIsOccupiedModalOpen] = useState(false);
  const [occupiedModalTable, setOccupiedModalTable] = useState<string | null>(null);
  const [occupiedModalOrder, setOccupiedModalOrder] = useState<ActiveOrder | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentDocType, setPaymentDocType] = useState<DocumentType>("NTV");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Efectivo");
  const [cashReceived, setCashReceived] = useState<string>("");
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<any>(null);

  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3500);
  };

  // Auth & Store init
  useEffect(() => {
    if (!isHydrated) return;
    if (!isLoggedIn || !user) {
      router.replace("/login");
      return;
    }
    initProducts();
  }, [isHydrated, isLoggedIn, user, router, initProducts]);

  // Dynamic Restaurant Tables configured by Admin
  const [restaurantTables, setRestaurantTables] = useState<RestaurantTable[]>([]);
  const [selectedTableZone, setSelectedTableZone] = useState<string>("all");

  const loadTablesConfig = useCallback(async () => {
    // 1. Instant local storage hydration
    if (typeof window !== "undefined") {
      try {
        const local = localStorage.getItem("restaurant_tables_config");
        if (local) {
          const parsed = JSON.parse(local);
          if (parsed && Array.isArray(parsed.tables) && parsed.tables.length > 0) {
            setRestaurantTables(parsed.tables.filter((t: RestaurantTable) => t.is_active !== false));
          }
        }
      } catch {}
    }

    // 2. Fetch from server API with cache buster
    try {
      const res = await fetch(`/api/admin/tables?_t=${Date.now()}`, { cache: "no-store" });
      const json = await res.json();
      if (json.data && Array.isArray(json.data.tables) && json.data.tables.length > 0) {
        const active = json.data.tables.filter((t: RestaurantTable) => t.is_active !== false);
        setRestaurantTables(active);
        if (typeof window !== "undefined") {
          localStorage.setItem("restaurant_tables_config", JSON.stringify(json.data));
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    loadTablesConfig();

    const handleUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail.tables)) {
        setRestaurantTables(e.detail.tables.filter((t: RestaurantTable) => t.is_active !== false));
      } else {
        loadTablesConfig();
      }
    };

    window.addEventListener("restaurant_tables_updated", handleUpdate);
    window.addEventListener("storage", (e) => {
      if (e.key === "restaurant_tables_config") loadTablesConfig();
    });
    window.addEventListener("focus", loadTablesConfig);

    return () => {
      window.removeEventListener("restaurant_tables_updated", handleUpdate);
      window.removeEventListener("focus", loadTablesConfig);
    };
  }, [loadTablesConfig]);

  // Detect Tablet Horizontal (Landscape), Laptop, or Desktop (width >= 1000 AND width > height)
  // Tablet Vertical / Portrait / Mobile remains in the original vertical layout
  const [isLandscapeWide, setIsLandscapeWide] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      if (typeof window === "undefined") return;
      const isLandscape = window.innerWidth > window.innerHeight;
      const isWideEnough = window.innerWidth >= 1000;
      setIsLandscapeWide(isLandscape && isWideEnough);
    };

    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, []);

  const effectiveTables = useMemo(() => {
    if (restaurantTables.length > 0) {
      return restaurantTables;
    }
    return DEFAULT_TABLES.map((num) => ({
      id: `table_${num}`,
      number: num,
      label: `Mesa ${num}`,
      capacity: 4,
      zone: "Salón Principal",
      is_active: true,
    }));
  }, [restaurantTables]);

  const availableTableZones = useMemo(() => {
    const set = new Set<string>();
    effectiveTables.forEach((t) => {
      if (t.zone && t.zone.trim()) set.add(t.zone.trim());
    });
    return Array.from(set);
  }, [effectiveTables]);

  const displayedTables = useMemo(() => {
    if (selectedTableZone === "all") return effectiveTables;
    return effectiveTables.filter((t) => t.zone === selectedTableZone);
  }, [effectiveTables, selectedTableZone]);

  // Fetch active orders to display table occupancy
  const fetchActiveOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/waiter/orders");
      const json = await res.json();
      const all = (json.data || []) as ActiveOrder[];
      // Filter out paid or cancelled orders
      const current = all.filter(
        (o) => o.payment_status !== "paid" && o.status !== "cancelled"
      );
      setActiveOrders(current);
    } catch {
      // silently fallback
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveOrders();
    const interval = setInterval(fetchActiveOrders, 8000);
    return () => clearInterval(interval);
  }, [fetchActiveOrders]);

  // Map tables to active orders
  const tableOrderMap = useMemo(() => {
    const map = new Map<string, ActiveOrder>();
    for (const ord of activeOrders) {
      if (ord.order_type === "mesa" && ord.table_number) {
        map.set(String(ord.table_number), ord);
      }
    }
    return map;
  }, [activeOrders]);

  // Active Takeaway orders
  const activeTakeaways = useMemo(() => {
    return activeOrders.filter((o) => o.order_type === "llevar");
  }, [activeOrders]);

  // Products
  const allProducts = useMemo(() => {
    if (storeProducts && storeProducts.length > 0) return storeProducts;
    return DEFAULT_RESTAURANT_PRODUCTS;
  }, [storeProducts]);

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

  // Cart Calculations
  const newCartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const existingOrderSubtotal = useMemo(() => {
    if (!existingOrder) return 0;
    return existingOrder.total;
  }, [existingOrder]);

  const takeawayCharge = useMemo(() => {
    return orderType === "llevar" ? 2.0 : 0.0;
  }, [orderType]);

  const totalCalculated = useMemo(() => {
    return existingOrderSubtotal + newCartSubtotal + (cart.length > 0 && !existingOrder ? takeawayCharge : 0);
  }, [existingOrderSubtotal, newCartSubtotal, takeawayCharge, cart.length, existingOrder]);

  const totalUnits = useMemo(() => {
    const fromExisting = existingOrder ? existingOrder.items.reduce((s, i) => s + i.quantity, 0) : 0;
    const fromNew = cart.reduce((s, i) => s + i.quantity, 0);
    return fromExisting + fromNew;
  }, [existingOrder, cart]);

  // Change / Vuelto
  const vuelto = useMemo(() => {
    const received = Number(cashReceived);
    if (isNaN(received) || received < totalCalculated) return 0;
    return received - totalCalculated;
  }, [cashReceived, totalCalculated]);

  // Close order modal safely
  const handleCloseOrderModal = useCallback(() => {
    if (cart.length > 0) {
      if (confirm("Tienes platos agregados sin guardar en la comanda. ¿Deseas descartarlos y volver a las mesas?")) {
        setCart([]);
        setOrderNotes("");
        setViewMode("tables");
      }
    } else {
      setCart([]);
      setOrderNotes("");
      setViewMode("tables");
    }
  }, [cart.length]);

  // Teclado: Escape cierra cualquier modal activo o el modal de pedido
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isReceiptModalOpen) {
          setIsReceiptModalOpen(false);
        } else if (isPaymentModalOpen) {
          setIsPaymentModalOpen(false);
        } else if (isOccupiedModalOpen) {
          setIsOccupiedModalOpen(false);
        } else if (isTakeawayModalOpen) {
          setIsTakeawayModalOpen(false);
        } else if (viewMode === "order") {
          handleCloseOrderModal();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isReceiptModalOpen, isPaymentModalOpen, isOccupiedModalOpen, isTakeawayModalOpen, viewMode, handleCloseOrderModal]);

  // --- ACTIONS ---

  // Select a table (Mesa Libre -> Abre modal de pedido; Mesa Ocupada -> Abre modal con opciones de Editar o Cobrar)
  const handleSelectTable = (tableNum: string) => {
    const existing = tableOrderMap.get(tableNum) || null;
    if (existing) {
      // Mesa Ocupada: abre modal emergente de opciones (Editar comanda o Cobrar cuenta)
      setOccupiedModalTable(tableNum);
      setOccupiedModalOrder(existing);
      setIsOccupiedModalOpen(true);
    } else {
      // Mesa Libre: abre modal de pedido para tomar comanda
      setSelectedTable(tableNum);
      setOrderType("mesa");
      setExistingOrder(null);
      setCustomerName("");
      setCart([]);
      setOrderNotes("");
      setViewMode("order");
    }
  };

  // Start a new takeaway order
  const handleStartTakeaway = (name: string) => {
    setSelectedTable("");
    setOrderType("llevar");
    setExistingOrder(null);
    setCustomerName(name.trim() || "Cliente para llevar");
    setCart([]);
    setOrderNotes("");
    setIsTakeawayModalOpen(false);
    setViewMode("order");
  };

  // Select an existing takeaway order (abre modal con opciones de Editar o Cobrar)
  const handleSelectExistingTakeaway = (order: ActiveOrder) => {
    setOccupiedModalTable(null);
    setOccupiedModalOrder(order);
    setIsOccupiedModalOpen(true);
  };

  // Add product to cart
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

    setRecentlyAddedId(product.id);
    setTimeout(() => setRecentlyAddedId(null), 800);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // --- BOTÓN 1: "Aceptar / Guardar y Enviar a Cocina" ---
  const handleSaveAndSendKitchen = async () => {
    if (cart.length === 0 && !existingOrder) {
      showToast("error", "Agrega al menos un producto al pedido.");
      return;
    }

    setSubmittingOrder(true);

    try {
      if (existingOrder) {
        // Appending new items to existing order in this table
        if (cart.length === 0) {
          showToast("success", "No había nuevos productos por agregar.");
          setViewMode("tables");
          return;
        }

        const combinedItems = [
          ...existingOrder.items,
          ...cart.map((c) => ({
            product_id: c.product.id,
            title: c.product.title,
            price: c.product.price,
            quantity: c.quantity,
            notes: c.itemNotes || orderNotes || undefined,
            skip_kitchen: false,
          })),
        ];

        const updatedSubtotal = existingOrder.subtotal + newCartSubtotal;
        const updatedTotal = existingOrder.total + newCartSubtotal;

        const res = await fetch(`/api/waiter/orders/${existingOrder.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: combinedItems,
            subtotal: updatedSubtotal,
            total: updatedTotal,
            status: "confirmed", // sends new items to kitchen
          }),
        });

        if (!res.ok) throw new Error("Error al actualizar la mesa");

        showToast("success", `¡Nuevos productos añadidos a Mesa ${selectedTable}!`);
      } else {
        // Create brand new order for table or takeaway
        const orderPayload = {
          waiter_id: user?.uid || "usr_waiter",
          waiter_name: user?.name || "Mesero",
          table_number: orderType === "mesa" ? selectedTable : null,
          order_type: orderType,
          items: cart.map((c) => ({
            product_id: c.product.id,
            title: c.product.title,
            price: c.product.price,
            quantity: c.quantity,
            notes: c.itemNotes || orderNotes || undefined,
            skip_kitchen: false,
          })),
          subtotal: newCartSubtotal,
          takeaway_charge: takeawayCharge,
          total: totalCalculated,
          customer_name: customerName,
          status: "confirmed",
        };

        const res = await fetch("/api/waiter/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderPayload),
        });

        if (!res.ok) throw new Error("Error al crear la comanda");

        showToast(
          "success",
          orderType === "mesa"
            ? `¡Comanda enviada a cocina para Mesa ${selectedTable}!`
            : "¡Comanda para llevar enviada a cocina!"
        );
      }

      await fetchActiveOrders();
      setCart([]);
      setOrderNotes("");
      setMobileCartOpen(false);
      setViewMode("tables");
    } catch {
      showToast("error", "Hubo un error al procesar el pedido. Intenta nuevamente.");
    } finally {
      setSubmittingOrder(false);
    }
  };

  // --- BOTÓN 2: "Pagar / Cobrar" ---
  const handleOpenPayment = () => {
    if (cart.length === 0 && !existingOrder) {
      showToast("error", "No hay comanda para cobrar.");
      return;
    }
    setCashReceived(totalCalculated.toFixed(2));
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = async () => {
    setSubmittingPayment(true);

    try {
      let orderIdToPay = existingOrder?.id;

      // If order wasn't saved yet, save it first and mark as paid
      if (!orderIdToPay) {
        const orderPayload = {
          waiter_id: user?.uid || "usr_waiter",
          waiter_name: user?.name || "Mesero",
          table_number: orderType === "mesa" ? selectedTable : null,
          order_type: orderType,
          items: cart.map((c) => ({
            product_id: c.product.id,
            title: c.product.title,
            price: c.product.price,
            quantity: c.quantity,
            skip_kitchen: false,
          })),
          subtotal: newCartSubtotal,
          takeaway_charge: takeawayCharge,
          total: totalCalculated,
          customer_name: customerName,
          status: "confirmed",
          payment_status: "paid",
          payment_method: paymentMethod.toLowerCase(),
        };

        const res = await fetch("/api/waiter/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderPayload),
        });

        const json = await res.json();
        orderIdToPay = json.data?.id;
      } else {
        // If there were pending items in cart, combine them first
        let finalItems = existingOrder?.items || [];
        if (cart.length > 0) {
          finalItems = [
            ...(existingOrder?.items || []),
            ...cart.map((c) => ({
              product_id: c.product.id,
              title: c.product.title,
              price: c.product.price,
              quantity: c.quantity,
            })),
          ];
        }

        const res = await fetch(`/api/waiter/orders/${orderIdToPay}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: finalItems,
            total: totalCalculated,
            payment_status: "paid",
            payment_method: paymentMethod.toLowerCase(),
            status: "served", // completed
          }),
        });
        if (!res.ok) throw new Error();
      }

      const receiptPayload = {
        id: orderIdToPay || `ord_${Date.now()}`,
        table_number: orderType === "mesa" ? selectedTable : null,
        order_type: orderType,
        customer_name: customerName,
        total: totalCalculated,
        payment_method: paymentMethod,
        doc_type: paymentDocType,
        created_at: new Date().toISOString(),
        items: [
          ...(existingOrder?.items || []),
          ...cart.map((c) => ({
            title: c.product.title,
            price: c.product.price,
            quantity: c.quantity,
          })),
        ],
      };

      setLastCompletedOrder(receiptPayload);
      setIsPaymentModalOpen(false);
      setIsReceiptModalOpen(true);

      await fetchActiveOrders();
      setCart([]);
      setOrderNotes("");
      setMobileCartOpen(false);
      setViewMode("tables");
      showToast(
        "success",
        orderType === "mesa"
          ? `¡Mesa ${selectedTable} pagada y liberada con éxito!`
          : "¡Pedido para llevar cobrado con éxito!"
      );
    } catch {
      showToast("error", "Error al procesar el pago");
    } finally {
      setSubmittingPayment(false);
    }
  };

  return (
    <div className="relative flex-1 flex flex-col h-full min-h-0 bg-stone-950 text-white overflow-hidden select-none">
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

      {/* ========================================================================= */}
      {/* --- VISTA BASE: MAPA DE MESAS (SELECCIÓN DE MESA O PARA LLEVAR) --- */}
      {/* ========================================================================= */}
      {!isLandscapeWide ? (
          /* ========================================================================= */
          /* --- MODO VERTICAL (TABLET VERTICAL, MÓVIL Y PANTALLAS EN PORTRAIT) --- */
          /* --- (EXACTAMENTE COMO ESTABA ORIGINALMENTE) --- */
          /* ========================================================================= */
          <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Header Bar Superior */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-900/60 border border-stone-800/80 p-5 rounded-3xl backdrop-blur-md">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                    <Utensils size={20} />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-white tracking-tight">Tomar Pedido</h1>
                    <p className="text-xs text-stone-400">
                      Selecciona una mesa o genera un pedido para llevar
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Stats & Takeaway Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center justify-center gap-2 px-3.5 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-stone-300">
                    {tableOrderMap.size} {tableOrderMap.size === 1 ? "Mesa ocupada" : "Mesas ocupadas"}
                  </span>
                </div>

                {/* Botón Para Llevar: En móvil más grande y letras grandes */}
                <button
                  type="button"
                  onClick={() => {
                    setTakeawayClientInput("");
                    setIsTakeawayModalOpen(true);
                  }}
                  className="w-full sm:w-auto py-3.5 sm:py-2.5 px-6 sm:px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-black text-base sm:text-xs rounded-2xl sm:rounded-xl flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/25 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <ShoppingBag size={20} className="stroke-[2.5] sm:w-4 sm:h-4" />
                  <span className="tracking-wide"> Para Llevar</span>
                </button>
              </div>
            </div>

            {/* Active Takeaways (if any pending) */}
            {activeTakeaways.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2">
                  <span> Pedidos Para Llevar Activos ({activeTakeaways.length})</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {activeTakeaways.map((ord) => (
                    <div
                      key={ord.id}
                      onClick={() => handleSelectExistingTakeaway(ord)}
                      className="p-4 bg-stone-900 border border-amber-500/30 rounded-2xl flex items-center justify-between hover:border-amber-500 transition-all cursor-pointer group"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                            {ord.customer_name || "Cliente Llevar"}
                          </span>
                          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] font-bold rounded-lg border border-amber-500/20">
                            {ord.items.length} platos
                          </span>
                        </div>
                        <span className="text-xs text-stone-400 mt-1 block font-mono">
                          Total: S/{ord.total.toFixed(2)} • {timeSince(ord.created_at)}
                        </span>
                      </div>

                      <div className="w-8 h-8 rounded-xl bg-stone-800 text-stone-300 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition-all">
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grilla de Mesas del Salón */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2">
                    <span>Mesas del Restaurante</span>
                    <span className="px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 font-mono text-[11px]">
                      {effectiveTables.length}
                    </span>
                  </h2>

                  {/* Filtro de Zonas si hay más de 1 zona */}
                  {availableTableZones.length > 1 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                      <button
                        type="button"
                        onClick={() => setSelectedTableZone("all")}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                          selectedTableZone === "all"
                            ? "bg-amber-500 text-stone-950 shadow-sm"
                            : "bg-stone-900 border border-stone-800 text-stone-400 hover:text-white"
                        }`}
                      >
                        Todas ({effectiveTables.length})
                      </button>
                      {availableTableZones.map((z) => (
                        <button
                          key={z}
                          type="button"
                          onClick={() => setSelectedTableZone(z)}
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                            selectedTableZone === z
                              ? "bg-amber-500 text-stone-950 shadow-sm"
                              : "bg-stone-900 border border-stone-800 text-stone-400 hover:text-white"
                          }`}
                        >
                          {z}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5 text-stone-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Disponible</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-stone-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>Con Comanda</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3.5 sm:gap-4 pb-12">
                {displayedTables.map((table) => {
                  const tableNum = table.number;
                  const active = tableOrderMap.get(tableNum);
                  const isOccupied = !!active;

                  return (
                    <div
                      key={table.id || tableNum}
                      onClick={() => handleSelectTable(tableNum)}
                      className={`relative p-4 rounded-3xl border transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[140px] group shadow-sm active:scale-[0.98] ${
                        isOccupied
                          ? "bg-amber-500/10 border-amber-500/40 hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/10"
                          : "bg-stone-900/80 border-stone-800/80 hover:border-stone-700 hover:bg-stone-900"
                      }`}
                    >
                      {/* Top Row: Table Name + Status Dot */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                              Mesa
                            </span>
                            {table.capacity && (
                              <span className="px-1.5 py-0.2 rounded bg-stone-800 text-stone-400 text-[10px] font-medium">
                                {table.capacity}p
                              </span>
                            )}
                          </div>
                          <h3 className="text-2xl font-black text-white group-hover:text-amber-400 transition-colors">
                            {tableNum}
                          </h3>
                          {table.label && table.label !== `Mesa ${tableNum}` && (
                            <span className="text-[11px] text-stone-400 truncate max-w-[90px] block">
                              {table.label}
                            </span>
                          )}
                        </div>

                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isOccupied
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isOccupied ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
                            }`}
                          />
                          {isOccupied ? "Ocupada" : "Libre"}
                        </span>
                      </div>

                      {/* Bottom Row: Info or Action */}
                      <div className="mt-3 pt-2.5 border-t border-stone-800/60">
                        {isOccupied ? (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-stone-400">Total:</span>
                              <span className="font-extrabold text-amber-400 font-mono">
                                S/{active.total.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-stone-400">
                              <span>{active.items.length} platos</span>
                              <span>{timeSince(active.created_at)}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-xs text-stone-500 group-hover:text-stone-300 transition-colors">
                            <span>Abrir Comanda</span>
                            <Plus size={14} className="group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* --- MODO HORIZONTAL (DESKTOP, LAPTOP O TABLET EN HORIZONTAL / LANDSCAPE) --- */
          /* --- (PANEL DE DESPACHO Y CONTROL DE PEDIDOS AL LADO DERECHO) --- */
          /* ========================================================================= */
          <div className="flex-1 flex flex-row h-full min-h-0 overflow-hidden">
            {/* LADO IZQUIERDO: SALÓN DE MESAS */}
            <div className="flex-1 h-full overflow-y-auto p-4 sm:p-6 lg:p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 bg-stone-900/60 border border-stone-800/80 p-4 rounded-3xl">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2">
                      <span>Mesas del Salón</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-stone-800 text-amber-400 font-mono text-xs font-bold border border-stone-700/60">
                        {effectiveTables.length} mesas
                      </span>
                    </h2>

                    {availableTableZones.length > 1 && (
                      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                        <button
                          type="button"
                          onClick={() => setSelectedTableZone("all")}
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                            selectedTableZone === "all"
                              ? "bg-amber-500 text-stone-950 shadow-sm"
                              : "bg-stone-900 border border-stone-800 text-stone-400 hover:text-white"
                          }`}
                        >
                          Todas ({effectiveTables.length})
                        </button>
                        {availableTableZones.map((z) => (
                          <button
                            key={z}
                            type="button"
                            onClick={() => setSelectedTableZone(z)}
                            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                              selectedTableZone === z
                                ? "bg-amber-500 text-stone-950 shadow-sm"
                                : "bg-stone-900 border border-stone-800 text-stone-400 hover:text-white"
                            }`}
                          >
                            {z}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1.5 text-stone-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>Disponible</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-stone-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span>Con Comanda</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5 sm:gap-4 pb-12">
                  {displayedTables.map((table) => {
                    const tableNum = table.number;
                    const active = tableOrderMap.get(tableNum);
                    const isOccupied = !!active;

                    return (
                      <div
                        key={table.id || tableNum}
                        onClick={() => handleSelectTable(tableNum)}
                        className={`relative p-4 rounded-3xl border transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[140px] group shadow-sm active:scale-[0.98] ${
                          isOccupied
                            ? "bg-amber-500/10 border-amber-500/40 hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/10"
                            : "bg-stone-900/80 border-stone-800/80 hover:border-stone-700 hover:bg-stone-900"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                                Mesa
                              </span>
                              {table.capacity && (
                                <span className="px-1.5 py-0.2 rounded bg-stone-800 text-stone-400 text-[10px] font-medium">
                                  {table.capacity}p
                                </span>
                              )}
                            </div>
                            <h3 className="text-2xl font-black text-white group-hover:text-amber-400 transition-colors">
                              {tableNum}
                            </h3>
                            {table.label && table.label !== `Mesa ${tableNum}` && (
                              <span className="text-[11px] text-stone-400 truncate max-w-[90px] block">
                                {table.label}
                              </span>
                            )}
                          </div>

                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isOccupied
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isOccupied ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
                              }`}
                            />
                            {isOccupied ? "Ocupada" : "Libre"}
                          </span>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-stone-800/60">
                          {isOccupied ? (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-stone-400">Total:</span>
                                <span className="font-extrabold text-amber-400 font-mono">
                                  S/{active.total.toFixed(2)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-stone-400">
                                <span>{active.items.length} platos</span>
                                <span>{timeSince(active.created_at)}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between text-xs text-stone-500 group-hover:text-stone-300 transition-colors">
                              <span>Abrir Comanda</span>
                              <Plus size={14} className="group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* LADO DERECHO: PANEL DE CONTROL DE PEDIDOS */}
            <div className="flex flex-col w-80 xl:w-96 border-l border-stone-800/80 bg-stone-900/60 p-5 space-y-5 h-full overflow-y-auto shrink-0 backdrop-blur-md select-none">
              <div className="flex items-center gap-3 pb-4 border-b border-stone-800/80">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
                  <Utensils size={22} />
                </div>
                <div>
                  <h2 className="text-base font-black text-white tracking-tight">Tomar Pedido</h2>
                  <p className="text-xs text-stone-400">
                    Selecciona una mesa o genera un pedido para llevar
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                  Atención Rápida
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setTakeawayClientInput("");
                    setIsTakeawayModalOpen(true);
                  }}
                  className="w-full py-4 px-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-black text-sm rounded-2xl flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/20 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <ShoppingBag size={18} className="stroke-[2.5]" />
                  <span> Para Llevar</span>
                </button>
              </div>

              <div className="space-y-2.5">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                  Estado del Restaurante
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3.5 bg-stone-950/80 border border-stone-800 rounded-2xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-stone-400 font-semibold uppercase">Ocupadas</span>
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    </div>
                    <span className="text-2xl font-black text-amber-400 font-mono block mt-1">
                      {tableOrderMap.size}
                    </span>
                    <span className="text-[10px] text-stone-500">Con comanda</span>
                  </div>

                  <div className="p-3.5 bg-stone-950/80 border border-stone-800 rounded-2xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-stone-400 font-semibold uppercase">Libres</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-2xl font-black text-emerald-400 font-mono block mt-1">
                      {Math.max(0, effectiveTables.length - tableOrderMap.size)}
                    </span>
                    <span className="text-[10px] text-stone-500">Disponibles</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-2.5 min-h-0 flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                    Para Llevar Activos
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 text-[10px] font-bold font-mono">
                    {activeTakeaways.length}
                  </span>
                </div>

                {activeTakeaways.length === 0 ? (
                  <div className="p-5 rounded-2xl bg-stone-950/40 border border-stone-800/60 text-center space-y-1">
                    <ShoppingBag size={20} className="mx-auto text-stone-600 mb-1" />
                    <p className="text-xs font-semibold text-stone-400">Sin pedidos para llevar</p>
                    <p className="text-[10px] text-stone-600">Presiona el botón arriba para crear uno</p>
                  </div>
                ) : (
                  <div className="space-y-2 overflow-y-auto no-scrollbar max-h-[320px] flex-1">
                    {activeTakeaways.map((ord) => (
                      <div
                        key={ord.id}
                        onClick={() => handleSelectExistingTakeaway(ord)}
                        className="p-3 bg-stone-950 border border-amber-500/30 hover:border-amber-500 rounded-2xl flex items-center justify-between transition-all cursor-pointer group shadow-sm"
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                              {ord.customer_name || "Cliente Llevar"}
                            </span>
                            <span className="px-1.5 py-0.2 bg-amber-500/10 text-amber-400 text-[10px] font-bold rounded border border-amber-500/20 shrink-0">
                              {ord.items.length}p
                            </span>
                          </div>
                          <span className="text-[11px] text-stone-400 mt-0.5 block font-mono">
                            Total: S/{ord.total.toFixed(2)} • {timeSince(ord.created_at)}
                          </span>
                        </div>
                        <div className="w-7 h-7 rounded-lg bg-stone-800 text-stone-300 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition-all shrink-0">
                          <ChevronRight size={14} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-stone-800/80 text-[11px] text-stone-500 space-y-1">
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Verde: Mesa vacía y disponible</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Ámbar: Comanda abierta en atención</span>
                </p>
              </div>
            </div>
          </div>
        )}

      {/* ========================================================================= */}
      {/* --- MODAL: VISTA DE COMANDA Y CATÁLOGO DE PLATILLOS (VENTANA EMERGENTE) --- */}
      {/* --- Se abre como ventana modal flotante emergente con X para volver al mapa --- */}
      {/* ========================================================================= */}
      {viewMode === "order" && (
        <div
          className="absolute inset-0 z-30 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-3 md:p-4 lg:p-5 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseOrderModal();
          }}
        >
          {/* Ventana Emergente Modal */}
          <div
            className="w-full h-full max-w-[1600px] bg-stone-950 border border-stone-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* --- HEADER GENERAL DE LA VENTANA EMERGENTE (ABARCA TODO EL ANCHO SUPERIOR) --- */}
            <div className="px-4 sm:px-6 py-3.5 bg-stone-900 border-b border-stone-800 flex items-center justify-between gap-3 shrink-0">
              {/* Lado Izquierdo: Volver a Mesas + Badge de Mesa */}
              <div className="flex items-center gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={handleCloseOrderModal}
                  className="px-3 py-1.5 sm:px-3.5 sm:py-2 bg-stone-950 hover:bg-stone-800 border border-stone-800 rounded-xl text-xs font-semibold text-stone-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <ArrowLeft size={15} />
                  <span className="hidden sm:inline">Volver a Mesas</span>
                  <span className="sm:hidden">Mesas</span>
                </button>

                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 bg-amber-500 text-black rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20">
                    {orderType === "mesa" ? (
                      <>
                        <Utensils size={14} className="stroke-[2.5]" />
                        <span>MESA {selectedTable}</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={14} className="stroke-[2.5]" />
                        <span>PARA LLEVAR</span>
                      </>
                    )}
                  </div>
                  {customerName && (
                    <span className="text-xs text-stone-400 font-medium truncate max-w-[120px] sm:max-w-[200px]">
                      ({customerName})
                    </span>
                  )}
                </div>
              </div>

              {/* Lado Derecho: Mesero + EQUIS (X) DESTACADA EN LA ESQUINA DERECHA SUPERIOR */}
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="text-xs text-stone-400 hidden sm:flex items-center gap-1.5">
                  <span>Atiende:</span>
                  <span className="text-white font-bold">{user?.name || "Mesero"}</span>
                </div>

                {/* BOTÓN X DESTACADO EN LA ESQUINA DERECHA SUPERIOR */}
                <button
                  type="button"
                  onClick={handleCloseOrderModal}
                  className="w-10 h-10 rounded-2xl bg-stone-950 hover:bg-rose-500/20 hover:border-rose-500/40 hover:text-rose-400 border border-stone-700/80 text-stone-300 flex items-center justify-center transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95 group"
                  title="Cerrar modal y volver a las mesas (Escape)"
                  aria-label="Cerrar ventana emergente"
                >
                  <X size={20} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-200" />
                </button>
              </div>
            </div>

            {/* --- CUERPO DEL MODAL (CATÁLOGO A LA IZQUIERDA + COMANDA A LA DERECHA) --- */}
            <div className="flex-1 flex flex-col lg:flex-row h-full min-h-0 overflow-hidden">
              {/* LEFT & CENTER: Catálogo de Platillos */}
              <div className="flex-1 flex flex-col min-w-0 border-r border-stone-800/80 overflow-y-auto">
                {/* Search Bar & Categories */}
                <div className="p-3.5 sm:p-4 bg-stone-900/60 border-b border-stone-800/80 sticky top-0 z-10 backdrop-blur-md space-y-3">
                  {/* Search bar */}
                  <div className="relative w-full">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar platillo o bebida..."
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

                  {/* Categories Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
                    {DEFAULT_CATEGORIES.map((cat) => {
                      const active = selectedCategory === cat.slug;
                      return (
                        <button
                          key={cat.slug}
                          onClick={() => setSelectedCategory(cat.slug)}
                          className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 border cursor-pointer ${
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
                  <Utensils size={36} className="mx-auto text-stone-600 mb-2" />
                  <p className="text-stone-400 font-semibold text-sm">No se encontraron productos</p>
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
                        <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-stone-950 mb-2.5">
                          <Image
                            src={p.image || "/logo_que_bravazo.png"}
                            alt={p.title}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />

                          {inCartItem && (
                            <div className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full bg-amber-500 text-black font-extrabold text-xs flex items-center justify-center shadow-md">
                              {inCartItem.quantity}
                            </div>
                          )}

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

                        <div>
                          <h3 className="font-bold text-white text-xs leading-snug line-clamp-2 group-hover:text-amber-400 transition-colors">
                            {p.title}
                          </h3>
                          <div className="mt-1.5 flex items-baseline justify-between">
                            <span className="text-sm font-extrabold text-amber-400 font-mono">
                              S/{Number(p.price).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Panel Comanda de la Mesa (Resumen + Aceptar o Pagar) */}
          <div
            className={`w-full lg:w-[460px] xl:w-[500px] 2xl:w-[540px] flex-shrink-0 bg-stone-900 flex flex-col h-full min-h-0 border-t lg:border-t-0 lg:border-l border-stone-800 ${
              mobileCartOpen ? "absolute inset-0 z-40 bg-stone-900 flex" : "hidden lg:flex"
            }`}
          >
            {/* Header del Resumen */}
            <div className="px-4 py-3 border-b border-stone-800/80 flex items-center justify-between bg-stone-900/95 sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <FileText size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    {orderType === "mesa" ? `Comanda Mesa ${selectedTable}` : "Comanda Para Llevar"}
                  </h3>
                  <span className="text-[10px] text-stone-400 block">
                    {totalUnits} plato{totalUnits !== 1 ? "s" : ""} en total
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {cart.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("¿Vaciar los platos nuevos agregados?")) setCart([]);
                    }}
                    className="p-1 text-stone-500 hover:text-rose-400 transition-colors"
                    title="Vaciar nuevos"
                  >
                    <Trash2 size={15} />
                  </button>
                )}

                {mobileCartOpen && (
                  <button
                    type="button"
                    onClick={() => setMobileCartOpen(false)}
                    className="p-1.5 text-stone-400 hover:text-white rounded-lg lg:hidden cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Listado de Platos */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
              {/* Sección 1: Platos ya pedidos previamente en esta mesa */}
              {existingOrder && existingOrder.items.length > 0 && (
                <div className="space-y-1.5 pb-2 border-b border-stone-800">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                    En Cocina (Ya pedidos)
                  </span>
                  {existingOrder.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-stone-950/40 border border-stone-800/60 flex items-center justify-between opacity-80"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-xs text-white font-medium block truncate">
                          {it.quantity}x {it.title}
                        </span>
                        {it.notes && (
                          <span className="text-[10px] text-stone-400 italic">Nota: {it.notes}</span>
                        )}
                      </div>
                      <span className="text-xs font-mono font-bold text-stone-300">
                        S/{(it.price * it.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Sección 2: Nuevos platos agregados en este momento */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                  {existingOrder ? "Nuevos para Enviar" : "Platos de la Comanda"}
                </span>

                {cart.length === 0 ? (
                  <div className="py-8 text-center text-stone-500">
                    <Utensils size={28} className="mx-auto mb-1 stroke-1 text-stone-700" />
                    <p className="text-xs font-semibold text-stone-400">
                      {existingOrder ? "Agrega más platos de la carta" : "Aún no has agregado platos"}
                    </p>
                    <p className="text-[10px] text-stone-600 mt-0.5">
                      Haz clic en los platillos de la carta para añadirlos
                    </p>
                  </div>
                ) : (
                  cart.map((item) => {
                    const itemSubtotal = item.product.price * item.quantity;
                    return (
                      <div
                        key={item.product.id}
                        className="p-2.5 rounded-2xl bg-stone-950/80 border border-stone-800/90 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-white truncate">
                              {item.product.title}
                            </h4>
                            <span className="text-[11px] text-stone-400 font-mono">
                              S/{Number(item.product.price).toFixed(2)} c/u
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.product.id)}
                            className="text-stone-500 hover:text-rose-400 p-0.5"
                          >
                            <X size={14} />
                          </button>
                        </div>

                        {/* Stepper + Subtotal */}
                        <div className="flex items-center justify-between pt-1 border-t border-stone-800/50">
                          <div className="flex items-center border border-stone-800 rounded-xl bg-stone-900 overflow-hidden">
                            <button
                              onClick={() => handleUpdateQuantity(item.product.id, -1)}
                              className="px-2 py-0.5 text-stone-400 hover:text-white"
                            >
                              <Minus size={11} />
                            </button>
                            <span className="px-2 font-mono text-xs font-bold text-white min-w-[20px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(item.product.id, 1)}
                              className="px-2 py-0.5 text-stone-400 hover:text-white"
                            >
                              <Plus size={11} />
                            </button>
                          </div>

                          <span className="text-xs font-bold font-mono text-white">
                            S/{itemSubtotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Observaciones de Cocina */}
            <div className="p-3 bg-stone-950/50 border-t border-stone-800/80 space-y-2">
              <button
                type="button"
                onClick={() => setShowNotesInput(!showNotesInput)}
                className="w-full text-left text-[11px] text-stone-400 hover:text-stone-200 flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <Gift size={12} className="text-amber-400" />
                  <span>{orderNotes ? "Nota de comanda lista" : "+ Nota general para cocina"}</span>
                </span>
                <span className="text-stone-500 text-[10px]">{showNotesInput ? "Ocultar" : "Editar"}</span>
              </button>

              {showNotesInput && (
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Ej: Sin sal, cremas aparte, servir todo junto..."
                  className="w-full px-3 py-1.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500/50"
                />
              )}
            </div>

            {/* Totales y Botones de Acción (Requerimiento exacto del usuario): */}
            {/* "Y QUE SE GUARDE Y QUE SALGA SI ACEPTAR (QUE SE GUARDE LO QUE PIDEN) O PAGAR Y QUE PAGE AHORA" */}
            <div className="p-4 bg-stone-950 border-t border-stone-800 space-y-3">
              {/* Desglose de Total */}
              <div className="space-y-1">
                {existingOrder && (
                  <div className="flex items-center justify-between text-xs text-stone-400">
                    <span>Acumulado anterior:</span>
                    <span className="font-mono">S/{existingOrderSubtotal.toFixed(2)}</span>
                  </div>
                )}
                {cart.length > 0 && (
                  <div className="flex items-center justify-between text-xs text-stone-400">
                    <span>Nuevos platos:</span>
                    <span className="font-mono">S/{newCartSubtotal.toFixed(2)}</span>
                  </div>
                )}
                {orderType === "llevar" && (
                  <div className="flex items-center justify-between text-xs text-stone-400">
                    <span>Empaque para llevar:</span>
                    <span className="font-mono">S/2.00</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-base font-extrabold text-white pt-1 border-t border-stone-800">
                  <span>Total Mesa:</span>
                  <span className="text-lg text-amber-400 font-mono">
                    S/{totalCalculated.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Botón 1: ACEPTAR (Guardar lo que piden y enviar a cocina) */}
              <button
                type="button"
                onClick={handleSaveAndSendKitchen}
                disabled={submittingOrder || (cart.length === 0 && !existingOrder)}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/10 active:scale-[0.99] cursor-pointer"
              >
                <CookingPot size={16} />
                <span>
                  {existingOrder
                    ? "Aceptar y Enviar Nuevos a Cocina"
                    : "Aceptar (Guardar Comanda y Enviar a Cocina)"}
                </span>
              </button>

              {/* Botón 2: PAGAR / COBRAR CUENTA */}
              <button
                type="button"
                onClick={handleOpenPayment}
                disabled={totalCalculated === 0}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.99] cursor-pointer"
              >
                <Receipt size={16} />
                <span>Cobrar Cuenta S/{totalCalculated.toFixed(2)}</span>
              </button>
            </div>
          </div>

          {/* Mobile floating bar to view comanda */}
          {!mobileCartOpen && (
            <div className="lg:hidden absolute bottom-4 left-3 right-3 z-30">
              <button
                type="button"
                onClick={() => setMobileCartOpen(true)}
                className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-2xl flex items-center justify-between shadow-2xl shadow-black/80 active:scale-95 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-black text-amber-400 text-xs flex items-center justify-center font-extrabold">
                    {totalUnits}
                  </span>
                  <span className="text-xs">
                    Ver Comanda {orderType === "mesa" ? `Mesa ${selectedTable}` : "Llevar"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-black">S/{totalCalculated.toFixed(2)}</span>
                  <ChevronRight size={18} />
                </div>
              </button>
            </div>
          )}
          </div>
        </div>
      </div>
    )}

      {/* ========================================================================= */}
      {/* --- MODAL: OPCIONES DE MESA OCUPADA (EDITAR O COBRAR) --- */}
      {/* ========================================================================= */}
      {isOccupiedModalOpen && occupiedModalOrder && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
                  {occupiedModalTable ? <Utensils size={22} /> : <ShoppingBag size={22} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white">
                      {occupiedModalTable
                        ? `Mesa ${occupiedModalTable}`
                        : (occupiedModalOrder.customer_name || "Pedido Para Llevar")}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-extrabold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      Ocupada
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Atiende: <span className="text-stone-300 font-semibold">{occupiedModalOrder.waiter_name || "Mesero"}</span> • Abierta hace {timeSince(occupiedModalOrder.created_at)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOccupiedModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-stone-800/80 hover:bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            {/* Resumen de Platos en Mesa */}
            <div className="bg-stone-950/70 border border-stone-800/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-stone-400 uppercase tracking-wider">
                <span>Platos en Comanda ({occupiedModalOrder.items.reduce((s, i) => s + i.quantity, 0)})</span>
                <span className="text-[11px] text-amber-400">En cocina / Servidos</span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 no-scrollbar">
                {occupiedModalOrder.items.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-stone-800/40 last:border-0">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="w-5 h-5 rounded-md bg-stone-800 text-amber-400 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                        {it.quantity}
                      </span>
                      <span className="text-white truncate font-medium">{it.title}</span>
                      {it.notes && <span className="text-[10px] text-stone-400 italic">({it.notes})</span>}
                    </div>
                    <span className="font-mono font-bold text-stone-300 ml-2">
                      S/{(it.price * it.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between">
                <div>
                  <span className="text-xs text-stone-400 font-semibold block uppercase">Total Acumulado</span>
                  <span className="text-[10px] text-stone-500">Monto actual de la cuenta</span>
                </div>
                <span className="text-2xl font-black text-amber-400 font-mono">
                  S/{occupiedModalOrder.total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="space-y-2.5 pt-1">
              {/* Opción 1: Editar comanda (agregar platos o notas) */}
              <button
                type="button"
                onClick={() => {
                  setIsOccupiedModalOpen(false);
                  if (occupiedModalTable) {
                    setSelectedTable(occupiedModalTable);
                    setOrderType("mesa");
                  } else {
                    setSelectedTable("");
                    setOrderType("llevar");
                  }
                  setExistingOrder(occupiedModalOrder);
                  setCustomerName(occupiedModalOrder.customer_name || "");
                  setCart([]);
                  setOrderNotes("");
                  setViewMode("order");
                }}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-black text-sm rounded-2xl flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                <CookingPot size={18} />
                <span> Editar Comanda / Agregar Platos</span>
              </button>

              {/* Opción 2: Cobrar cuenta */}
              <button
                type="button"
                onClick={() => {
                  setIsOccupiedModalOpen(false);
                  if (occupiedModalTable) {
                    setSelectedTable(occupiedModalTable);
                    setOrderType("mesa");
                  } else {
                    setSelectedTable("");
                    setOrderType("llevar");
                  }
                  setExistingOrder(occupiedModalOrder);
                  setCustomerName(occupiedModalOrder.customer_name || "");
                  setCart([]);
                  setCashReceived("");
                  setIsPaymentModalOpen(true);
                }}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-600/25 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Receipt size={18} />
                <span> Cobrar Cuenta (S/{occupiedModalOrder.total.toFixed(2)})</span>
              </button>

              {/* Opción 3: Descartar / Cerrar */}
              <button
                type="button"
                onClick={() => setIsOccupiedModalOpen(false)}
                className="w-full py-2.5 text-xs text-stone-400 hover:text-white font-semibold rounded-xl text-center hover:bg-stone-800/50 transition-colors cursor-pointer"
              >
                Descartar y volver a selección de mesas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* --- MODAL: NUEVO PEDIDO PARA LLEVAR --- */}
      {/* ========================================================================= */}
      {isTakeawayModalOpen && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShoppingBag size={16} className="text-amber-400" />
                <span>Pedido Para Llevar</span>
              </h3>
              <button
                onClick={() => setIsTakeawayModalOpen(false)}
                className="text-stone-400 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Nombre del Cliente (Opcional)
                </label>
                <input
                  type="text"
                  value={takeawayClientInput}
                  onChange={(e) => setTakeawayClientInput(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsTakeawayModalOpen(false)}
                className="px-3 py-2 text-xs font-semibold text-stone-400 hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleStartTakeaway(takeawayClientInput)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl cursor-pointer"
              >
                Continuar al Menú
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* --- MODAL: PAGAR / COBRAR CUENTA --- */}
      {/* ========================================================================= */}
      {isPaymentModalOpen && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Receipt size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Cobrar Cuenta</h3>
                  <p className="text-[11px] text-stone-400">
                    {orderType === "mesa" ? `Mesa ${selectedTable}` : "Pedido Para Llevar"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-stone-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Total a pagar destacado */}
            <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 text-center">
              <span className="text-xs text-stone-400 uppercase tracking-wider block">
                Total a Cobrar
              </span>
              <span className="text-3xl font-black text-amber-400 font-mono mt-1 block">
                S/{totalCalculated.toFixed(2)}
              </span>
            </div>

            {/* Tipo de Comprobante */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-stone-300 block">Tipo de Comprobante</span>
              <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
                {(["NTV", "BOLETA", "FACTURA"] as DocumentType[]).map((doc) => {
                  const active = paymentDocType === doc;
                  return (
                    <button
                      key={doc}
                      type="button"
                      onClick={() => setPaymentDocType(doc)}
                      className={`py-2 rounded-xl border text-center transition-all cursor-pointer ${
                        active
                          ? doc === "BOLETA"
                            ? "bg-sky-500 text-black border-sky-400 font-extrabold"
                            : doc === "FACTURA"
                            ? "bg-emerald-500 text-black border-emerald-400 font-extrabold"
                            : "bg-amber-500 text-black border-amber-400 font-extrabold"
                          : "bg-stone-950 text-stone-400 border-stone-800 hover:text-white"
                      }`}
                    >
                      {doc === "NTV" ? "Nota Venta" : doc}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Método de Pago */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-stone-300 block">Método de Pago</span>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-amber-500/50"
              >
                <option value="Efectivo"> Efectivo</option>
                <option value="Yape">Yape</option>
                <option value="Plin">Plin</option>
                <option value="Tarjeta"> Tarjeta (POS)</option>
                <option value="Mixto"> Mixto</option>
              </select>
            </div>

            {/* Efectivo Recibido y Vuelto */}
            {paymentMethod === "Efectivo" && (
              <div className="bg-stone-950/80 p-3 rounded-2xl border border-stone-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-400">Efectivo Recibido:</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="0.50"
                      min="0"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      className="w-20 px-2 py-1 bg-stone-900 border border-stone-800 rounded-lg text-white font-mono text-xs text-right focus:outline-none focus:border-amber-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => setCashReceived(totalCalculated.toFixed(2))}
                      className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-[10px] text-stone-300 font-bold rounded-lg border border-stone-700 cursor-pointer"
                    >
                      Exacto
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-800">
                  <span className="text-stone-400">Vuelto:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    S/{vuelto.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Confirm Payment Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={submittingPayment}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-[0.99] cursor-pointer"
              >
                <CheckCircle2 size={16} />
                <span>
                  {submittingPayment ? "Procesando pago..." : `Confirmar Pago S/${totalCalculated.toFixed(2)}`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* --- MODAL: COMPROBANTE / TICKET EMITIDO --- */}
      {/* ========================================================================= */}
      {isReceiptModalOpen && lastCompletedOrder && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl flex flex-col space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <Check size={24} strokeWidth={3} />
              </div>
              <h3 className="text-base font-extrabold text-white">¡Pago Confirmado!</h3>
              <p className="text-xs text-stone-400">¡Qué Bravazo! Restobar</p>
              <p className="text-[11px] font-mono text-stone-500">ID: {lastCompletedOrder.id}</p>
            </div>

            <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 text-xs space-y-2 font-mono">
              <div className="flex justify-between text-stone-400 text-[11px] pb-1 border-b border-stone-800">
                <span>{lastCompletedOrder.doc_type || "NOTA DE VENTA"}</span>
                <span>
                  {new Date(lastCompletedOrder.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="text-stone-300">
                <span className="text-stone-500 block text-[10px]">CLIENTE:</span>
                <span className="font-semibold">
                  {lastCompletedOrder.customer_name || "Cliente sin registrar"}
                </span>
              </div>
              <div className="text-stone-300">
                <span className="text-stone-500 block text-[10px]">UBICACIÓN:</span>
                <span className="font-semibold">
                  {lastCompletedOrder.order_type === "mesa"
                    ? `Mesa ${lastCompletedOrder.table_number}`
                    : "Para Llevar"}
                </span>
              </div>

              <div className="pt-2 border-t border-stone-800 space-y-1">
                {lastCompletedOrder.items.map((it: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span className="truncate max-w-[180px]">
                      {it.quantity}x {it.title}
                    </span>
                    <span>S/{(it.price * it.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-stone-800 flex justify-between font-bold text-sm text-white">
                <span>TOTAL:</span>
                <span className="text-amber-400">
                  S/{Number(lastCompletedOrder.total).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-stone-400">
                <span>Método:</span>
                <span className="capitalize">{lastCompletedOrder.payment_method}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => window.print()}
                className="py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer size={14} />
                <span>Imprimir Ticket</span>
              </button>
              <button
                type="button"
                onClick={() => setIsReceiptModalOpen(false)}
                className="py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Finalizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
