"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/lib/stores/auth";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  Users,
  ImageIcon,
  FolderTree,
  CalendarCheck,
  ExternalLink,
  LogOut,
  ChevronDown,
  Menu,
  X,
  AlertTriangle,
  ShoppingBag,
  CookingPot,
  Utensils,
  Settings,
  Grid2X2,
  Receipt,
  Store,
} from "lucide-react";

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isLoggedIn, logout, isHydrated } = useAuthStore();
  
  const [verifying, setVerifying] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [verifyError, setVerifyError] = useState(false);
  
  // Estado de colapso de la barra lateral (Mini-rail vs Expandido)
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Móvil drawer

  // Acordeón de Ventas (Tomar Pedido, POS, Pedidos, Cocina)
  const isVentasSection =
    pathname.startsWith("/admin/mesas") ||
    pathname.startsWith("/admin/pos") ||
    pathname.startsWith("/admin/orders") ||
    pathname.startsWith("/admin/kds") ||
    pathname.startsWith("/chef");
  const [ventasOpen, setVentasOpen] = useState(true);

  // Acordeón del Menú
  const isMenuSection = pathname.startsWith("/admin/menu");
  const [menuOpen, setMenuOpen] = useState(false);

  // Acordeón de Configuración
  const isSettingsSection = pathname.startsWith("/admin/settings") || pathname.startsWith("/admin/tables") || pathname.startsWith("/admin/staff");
  const isTablesConfigActive = pathname.startsWith("/admin/settings/tables") || pathname.startsWith("/admin/tables");
  const [settingsOpen, setSettingsOpen] = useState(isSettingsSection);

  // Recordar preferencia de colapso en localStorage
  useEffect(() => {
    const saved = localStorage.getItem("admin_sidebar_collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("admin_sidebar_collapsed", String(next));
      return next;
    });
  };

  useEffect(() => {
    if (!isHydrated) return;
    if (!isLoggedIn || !user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "admin") {
      router.replace("/");
      return;
    }
    fetch("/api/admin/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email }),
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.admin) {
          setAuthorized(true);
        } else if (res.error) {
          setVerifyError(true);
        } else {
          setAuthorized(false);
        }
      })
      .catch(() => {
        setVerifyError(true);
      })
      .finally(() => setVerifying(false));
  }, [isHydrated, isLoggedIn, user, router]);

  if (!isHydrated || verifying) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-stone-400 text-sm">Cargando panel...</p>
        </div>
      </div>
    );
  }

  if (!authorized && !verifyError) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center p-8">
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogOut className="w-7 h-7 text-rose-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Acceso denegado</h2>
          <p className="text-stone-400 text-sm leading-relaxed mb-6">
            Tu email <span className="text-amber-400 font-semibold">{user?.email}</span> no está registrado como administrador.
          </p>
          <button
            onClick={() => { logout(); router.push("/login"); }}
            className="px-6 py-3 bg-stone-800 hover:bg-stone-700 text-white rounded-xl transition-colors text-sm font-medium"
          >
            Intentar con otro usuario
          </button>
        </div>
      </div>
    );
  }

  const isDashboardActive = pathname === "/admin";
  const isOrdersActive = pathname.startsWith("/admin/orders");
  const isMesasActive = pathname.startsWith("/admin/mesas");
  const isStaffActive = pathname.startsWith("/admin/staff");
  const isMediaActive = pathname.startsWith("/admin/media");
  const isPosActive = pathname.startsWith("/admin/pos");
  const isKdsActive = pathname.startsWith("/admin/kds") || pathname.startsWith("/chef");
  const isStoreSettingsActive = pathname.startsWith("/admin/settings/store");

  const currentTab = searchParams?.get("tab") || "products";
  const isProductosActive = isMenuSection && (currentTab === "products" || !searchParams?.get("tab"));
  const isCategoriasActive = isMenuSection && currentTab === "categories";
  const isMenuTabActive = isMenuSection && (currentTab === "menu" || currentTab === "daily" || currentTab === "schedules");

  const getPageTitle = () => {
    if (isDashboardActive) return "Dashboard";
    if (isMenuSection) {
      if (isCategoriasActive) return "Carta & Menú / Categorías";
      if (isMenuTabActive) return "Carta & Menú / Menú del Día & Horarios";
      return "Carta & Menú / Productos";
    }
    if (isMesasActive) return "Ventas / Tomar Pedido (Mesas)";
    if (isPosActive) return "Ventas / Punto de Venta (Caja)";
    if (isOrdersActive) return "Ventas / Historial de Pedidos";
    if (isKdsActive) return "Ventas / Cocina (KDS)";
    if (isStaffActive) return "Configuración / Personal";
    if (isStoreSettingsActive) return "Configuración / Tienda Online & WhatsApp";
    if (isMediaActive) return "Multimedia";
    if (isTablesConfigActive) return "Configuración / Distribución de Mesas";
    if (isSettingsSection) return "Configuración";
    return "Panel Admin";
  };

  return (
    <div className="fixed inset-0 h-screen h-[100dvh] w-screen bg-stone-950 flex overflow-hidden select-none z-30">
      {/* Overlay Móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR FIJO (Expandible w-64 / Mini-Rail w-20) */}
      <aside
        className={`
          flex flex-col bg-stone-900 border-r border-stone-800 flex-shrink-0 h-screen z-40 transition-all duration-300 ease-in-out
          max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:w-64 max-md:shadow-2xl
          ${sidebarOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full'}
          md:relative md:translate-x-0
          ${isCollapsed ? 'md:w-20' : 'md:w-64'}
        `}
      >
        {/* Cabecera Sidebar (Logo + Nombre + Botón Colapsar / Expandir) */}
        <div className="p-4 border-b border-stone-800/80 flex-shrink-0">
          {!isCollapsed ? (
            <div className="space-y-3">
              {/* Fila 1: Logo + Nombre */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl overflow-hidden border border-stone-700 flex-shrink-0 bg-stone-950 flex items-center justify-center shadow-md">
                  <Image
                    src="/logo_que_bravazo.png"
                    alt="Logo"
                    width={36}
                    height={36}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-black tracking-tight text-white uppercase truncate">
                    ¡QUÉ BRAVAZO!
                  </span>
                  <span className="text-[10px] text-stone-400 font-medium">Panel Admin SaaS</span>
                </div>
              </div>

              {/* Fila 2: Indicador En línea + Botón Colapsar */}
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[11px] text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  En línea
                </span>

                <button
                  type="button"
                  onClick={toggleCollapsed}
                  title="Colapsar menú lateral"
                  className="p-1.5 rounded-xl border border-stone-700/80 hover:bg-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="3" />
                    <path d="M9 3v18" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            /* Modo Colapsado (Mini-Rail) */
            <div className="flex flex-col items-center gap-3 py-1">
              <div className="w-9 h-9 rounded-xl overflow-hidden border border-stone-700 flex-shrink-0 bg-stone-950 flex items-center justify-center shadow-md">
                <Image
                  src="/logo_que_bravazo.png"
                  alt="Logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                />
              </div>

              <button
                type="button"
                onClick={toggleCollapsed}
                title="Expandir menú lateral"
                className="p-2 rounded-xl border-2 border-blue-500/70 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all cursor-pointer shadow-sm shadow-blue-500/20"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="3" />
                  <path d="M9 3v18" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Navegación Principal Organizada Semánticamente */}
        <nav className={`flex-1 py-3 space-y-1.5 overflow-y-auto overflow-x-hidden no-scrollbar ${isCollapsed ? "px-2 flex flex-col items-center" : "px-3"}`}>
          {/* 1. Dashboard */}
          <Link
            href="/admin"
            title="Dashboard"
            className={`flex items-center gap-3 rounded-2xl text-sm font-semibold transition-all group ${
              isDashboardActive
                ? "bg-blue-600/20 text-blue-400 shadow-sm border border-blue-500/30 font-bold"
                : "text-stone-400 hover:text-white hover:bg-stone-800/50"
            } ${isCollapsed ? "w-11 h-11 justify-center p-0" : "px-3.5 py-2.5 w-full"}`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isDashboardActive ? "bg-blue-500/20 text-blue-400" : "text-stone-400 group-hover:text-white"}`}>
              <LayoutDashboard size={19} />
            </div>
            {!isCollapsed && <span>Dashboard</span>}
          </Link>

          {/* 2. VENTAS (Acordeón: Tomar Pedido, Punto de Venta, Pedidos, Cocina) */}
          <div className={isCollapsed ? "w-full flex justify-center" : "w-full"}>
            <button
              type="button"
              onClick={() => {
                if (isCollapsed) {
                  setIsCollapsed(false);
                  setVentasOpen(true);
                } else {
                  setVentasOpen(!ventasOpen);
                }
              }}
              title="Ventas (Mesas, POS, Pedidos, Cocina)"
              className={`flex items-center gap-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer ${
                isVentasSection
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold"
                  : "text-stone-400 hover:text-white hover:bg-stone-800/50"
              } ${isCollapsed ? "w-11 h-11 justify-center p-0" : "px-3.5 py-2.5 w-full"}`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isVentasSection ? "bg-amber-500/20 text-amber-400" : "text-stone-400"
              }`}>
                <ShoppingBag size={19} />
              </div>
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left">Ventas</span>
                  <ChevronDown
                    size={15}
                    className={`transition-transform duration-200 text-stone-400 ${
                      ventasOpen ? "rotate-0" : "-rotate-90"
                    }`}
                  />
                </>
              )}
            </button>

            {/* Submenú de Ventas */}
            {!isCollapsed && ventasOpen && (
              <div className="pl-6 pr-1 pt-1.5 pb-1 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                <Link
                  href="/admin/mesas"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isMesasActive
                      ? "bg-amber-500/15 text-amber-400 font-bold border border-amber-500/20"
                      : "text-stone-400 hover:text-white hover:bg-stone-800/60"
                  }`}
                >
                  <Utensils size={14} className={isMesasActive ? "text-amber-400" : "text-stone-500"} />
                  <span>Tomar Pedido (Mesas)</span>
                </Link>

                <Link
                  href="/admin/pos"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isPosActive
                      ? "bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/20"
                      : "text-stone-400 hover:text-white hover:bg-stone-800/60"
                  }`}
                >
                  <Receipt size={14} className={isPosActive ? "text-emerald-400" : "text-stone-500"} />
                  <span>Punto de Venta (Caja)</span>
                </Link>

                <Link
                  href="/admin/orders"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isOrdersActive
                      ? "bg-amber-500/15 text-amber-400 font-bold border border-amber-500/20"
                      : "text-stone-400 hover:text-white hover:bg-stone-800/60"
                  }`}
                >
                  <ClipboardList size={14} className={isOrdersActive ? "text-amber-400" : "text-stone-500"} />
                  <span>Historial de Pedidos</span>
                </Link>

                <Link
                  href="/admin/kds"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isKdsActive
                      ? "bg-orange-500/15 text-orange-400 font-bold border border-orange-500/20"
                      : "text-stone-400 hover:text-white hover:bg-stone-800/60"
                  }`}
                >
                  <CookingPot size={14} className={isKdsActive ? "text-orange-400" : "text-stone-500"} />
                  <span>Cocina (KDS)</span>
                </Link>
              </div>
            )}
          </div>

          {/* 3. CARTA / MENÚ (Acordeón Desplegable con Productos, Categorías y Menú) */}
          <div className={isCollapsed ? "w-full flex justify-center" : "w-full"}>
            <button
              type="button"
              onClick={() => {
                if (isCollapsed) {
                  setIsCollapsed(false);
                  setMenuOpen(true);
                } else {
                  setMenuOpen(!menuOpen);
                }
              }}
              title="Carta (Productos, Categorías, Menú)"
              className={`flex items-center gap-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer ${
                isMenuSection
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold"
                  : "text-stone-400 hover:text-white hover:bg-stone-800/50"
              } ${isCollapsed ? "w-11 h-11 justify-center p-0" : "px-3.5 py-2.5 w-full"}`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isMenuSection ? "bg-amber-500/20 text-amber-400" : "text-stone-400"
              }`}>
                <UtensilsCrossed size={19} />
              </div>
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left">Carta & Menú</span>
                  <ChevronDown
                    size={15}
                    className={`transition-transform duration-200 text-stone-400 ${
                      menuOpen ? "rotate-0" : "-rotate-90"
                    }`}
                  />
                </>
              )}
            </button>

            {/* Submenú de Carta */}
            {!isCollapsed && menuOpen && (
              <div className="pl-6 pr-1 pt-1.5 pb-1 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                <Link
                  href="/admin/menu?tab=products"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isProductosActive
                      ? "bg-amber-500/15 text-amber-400 font-bold border border-amber-500/20"
                      : "text-stone-400 hover:text-white hover:bg-stone-800/60"
                  }`}
                >
                  <UtensilsCrossed size={14} className={isProductosActive ? "text-amber-400" : "text-stone-500"} />
                  <span>Productos</span>
                </Link>

                <Link
                  href="/admin/menu?tab=categories"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isCategoriasActive
                      ? "bg-amber-500/15 text-amber-400 font-bold border border-amber-500/20"
                      : "text-stone-400 hover:text-white hover:bg-stone-800/60"
                  }`}
                >
                  <FolderTree size={14} className={isCategoriasActive ? "text-amber-400" : "text-stone-500"} />
                  <span>Categorías</span>
                </Link>

                <Link
                  href="/admin/menu?tab=menu"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isMenuTabActive
                      ? "bg-amber-500/15 text-amber-400 font-bold border border-amber-500/20"
                      : "text-stone-400 hover:text-white hover:bg-stone-800/60"
                  }`}
                >
                  <CalendarCheck size={14} className={isMenuTabActive ? "text-amber-400" : "text-stone-500"} />
                  <span>Menú del Día & Horarios</span>
                </Link>
              </div>
            )}
          </div>

          {/* 4. MULTIMEDIA */}
          <Link
            href="/admin/media"
            title="Multimedia"
            className={`flex items-center gap-3 rounded-2xl text-sm font-semibold transition-all group ${
              isMediaActive
                ? "bg-stone-800/90 text-white shadow-sm border border-stone-700/60"
                : "text-stone-400 hover:text-white hover:bg-stone-800/50"
            } ${isCollapsed ? "w-11 h-11 justify-center p-0" : "px-3.5 py-2.5 w-full"}`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isMediaActive ? "text-amber-400" : "text-stone-400 group-hover:text-white"}`}>
              <ImageIcon size={19} />
            </div>
            {!isCollapsed && <span>Multimedia</span>}
          </Link>

          {/* 5. CONFIGURACIÓN (Acordeón con Personal y Mesas) */}
          <div className={isCollapsed ? "w-full flex justify-center" : "w-full"}>
            <button
              type="button"
              onClick={() => {
                if (isCollapsed) {
                  setIsCollapsed(false);
                  setSettingsOpen(true);
                } else {
                  setSettingsOpen(!settingsOpen);
                }
              }}
              title="Configuración (Personal, Mesas)"
              className={`flex items-center gap-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer ${
                isSettingsSection
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold"
                  : "text-stone-400 hover:text-white hover:bg-stone-800/50"
              } ${isCollapsed ? "w-11 h-11 justify-center p-0" : "px-3.5 py-2.5 w-full"}`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isSettingsSection ? "bg-amber-500/20 text-amber-400" : "text-stone-400"
              }`}>
                <Settings size={19} />
              </div>
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left">Configuración</span>
                  <ChevronDown
                    size={15}
                    className={`transition-transform duration-200 text-stone-400 ${
                      settingsOpen ? "rotate-0" : "-rotate-90"
                    }`}
                  />
                </>
              )}
            </button>

            {/* Submenú de Configuración */}
            {!isCollapsed && settingsOpen && (
              <div className="pl-6 pr-1 pt-1.5 pb-1 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                <Link
                  href="/admin/staff"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isStaffActive
                      ? "bg-amber-500/15 text-amber-400 font-bold border border-amber-500/20"
                      : "text-stone-400 hover:text-white hover:bg-stone-800/60"
                  }`}
                >
                  <Users size={14} className={isStaffActive ? "text-amber-400" : "text-stone-500"} />
                  <span>Personal / Usuarios</span>
                </Link>

                <Link
                  href="/admin/settings/store"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isStoreSettingsActive
                      ? "bg-amber-500/15 text-amber-400 font-bold border border-amber-500/20"
                      : "text-stone-400 hover:text-white hover:bg-stone-800/60"
                  }`}
                >
                  <Store size={14} className={isStoreSettingsActive ? "text-amber-400" : "text-stone-500"} />
                  <span>Tienda Online & WhatsApp</span>
                </Link>

                <Link
                  href="/admin/settings/tables"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isTablesConfigActive
                      ? "bg-amber-500/15 text-amber-400 font-bold border border-amber-500/20"
                      : "text-stone-400 hover:text-white hover:bg-stone-800/60"
                  }`}
                >
                  <Grid2X2 size={14} className={isTablesConfigActive ? "text-amber-400" : "text-stone-500"} />
                  <span>Distribución de Mesas</span>
                </Link>
              </div>
            )}
          </div>

          {/* Enlace rápido: Ver Tienda Online Komi */}
          <div className="pt-2">
            <Link
              href="/t/quebravazo"
              target="_blank"
              title="Ver Tienda Online / Catálogo WhatsApp (Pestaña nueva)"
              className={`flex items-center gap-3 rounded-2xl text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all ${
                isCollapsed ? "w-11 h-11 justify-center p-0" : "px-3.5 py-2 w-full"
              }`}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-emerald-400">
                <Store size={17} />
              </div>
              {!isCollapsed && (
                <div className="flex items-center justify-between w-full">
                  <span>Tienda Online</span>
                  <ExternalLink size={12} className="opacity-70" />
                </div>
              )}
            </Link>
          </div>
        </nav>

        {/* Sección Inferior del Sidebar (Perfil de Usuario y Logout) */}
        <div className={`border-t border-stone-800/80 flex-shrink-0 bg-stone-950/70 ${isCollapsed ? "p-2 flex flex-col items-center gap-2" : "p-3.5 space-y-2.5"}`}>
          {/* Tarjeta de Usuario */}
          <div
            className={`rounded-2xl bg-stone-900/90 border border-stone-800 flex items-center gap-2.5 ${
              isCollapsed ? "w-11 h-11 justify-center p-0" : "p-2.5 w-full"
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 font-bold text-xs">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || "A"}
            </div>

            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white font-semibold truncate leading-tight">
                  {user?.name || user?.email}
                </p>
                <p className="text-[10px] text-stone-400 font-medium truncate mt-0.5">
                  Administrador
                </p>
              </div>
            )}

            {!isCollapsed && (
              <button
                type="button"
                onClick={() => { logout(); router.push("/login"); }}
                className="p-1.5 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Cerrar sesión"
              >
                <LogOut size={15} />
              </button>
            )}
          </div>

          {/* Botón de logout en modo colapsado */}
          {isCollapsed && (
            <button
              type="button"
              onClick={() => { logout(); router.push("/login"); }}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-stone-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </aside>

      {/* Contenedor Principal (Con Scroll Independiente en el main) */}
      <div className="flex-1 flex flex-col h-screen h-[100dvh] max-w-full overflow-hidden">
        {/* Barra Superior Fija */}
        <header className="h-14 lg:h-16 flex items-center gap-3 px-4 lg:px-6 border-b border-stone-800/80 bg-stone-950/80 backdrop-blur-md flex-shrink-0 shadow-sm z-30">
          {/* Botón Hamburger solo en móvil */}
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 -ml-1 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors md:hidden cursor-pointer"
            aria-label={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Título de la sección actual */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white tracking-tight">
              {getPageTitle()}
            </span>
          </div>

          <div className="flex-1" />

          {/* Perfil & Logout Header */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-stone-400 font-medium">
              {user?.name || user?.email}
            </span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-black text-xs font-bold shadow-md shadow-amber-500/20">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || "A"}
            </div>
            <button
              onClick={() => { logout(); router.push("/login"); }}
              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* ÚNICA ÁREA SCROLLEABLE */}
        <main className={`flex-1 relative ${isPosActive || isMesasActive ? "overflow-hidden p-0" : "overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 md:pb-8"}`}>
          {verifyError && !authorized && (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-300">
                <span className="font-semibold">Verificación de servidor no disponible.</span>{" "}
                Accediendo con credenciales locales.{" "}
                <button
                  onClick={() => { logout(); router.push("/login"); }}
                  className="underline hover:text-amber-200"
                >
                  Iniciar sesión con otro usuario
                </button>
              </div>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-950 flex items-center justify-center text-stone-400">Cargando...</div>}>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </Suspense>
  );
}
