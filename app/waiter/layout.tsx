"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/lib/stores/auth";
import {
  ShoppingBag,
  ClipboardList,
  User,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Utensils,
  ChevronDown,
} from "lucide-react";

export default function WaiterLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoggedIn, isHydrated, logout } = useAuthStore();

  // Estado de colapso de la barra lateral (Mini-rail vs Expandido)
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Móvil drawer

  // Acordeón de Ventas (Tomar Pedido, Historial de Pedidos)
  const isVentasSection = pathname === "/waiter" || pathname.startsWith("/waiter/mis-pedidos");
  const [ventasOpen, setVentasOpen] = useState(true);

  // Recordar preferencia de colapso en localStorage
  useEffect(() => {
    const saved = localStorage.getItem("waiter_sidebar_collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("waiter_sidebar_collapsed", String(next));
      return next;
    });
  };

  useEffect(() => {
    if (!isHydrated) return;
    if (!isLoggedIn || !user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "staff" && user.role !== "admin" && user.role !== "owner") {
      router.replace("/");
      return;
    }
  }, [isHydrated, isLoggedIn, user, router]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-stone-400 text-sm">Cargando panel mesero...</p>
        </div>
      </div>
    );
  }

  if (user?.role !== "staff" && user?.role !== "admin" && user?.role !== "owner") return null;

  const isPosActive = pathname === "/waiter";
  const isOrdersActive = pathname.startsWith("/waiter/mis-pedidos");
  const isPerfilActive = pathname.startsWith("/waiter/perfil");

  const getPageTitle = () => {
    if (isPosActive) return "Ventas / Tomar Pedido (Mesas)";
    if (isOrdersActive) return "Ventas / Historial de Pedidos";
    if (isPerfilActive) return "Mi Perfil";
    return "Panel Mesero";
  };

  const getRoleLabel = () => {
    if (user?.role === "owner") return "Dueño";
    if (user?.role === "cashier") return "Cajero";
    if (user?.role === "admin") return "Administrador";
    return "Mesero";
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
          ${sidebarOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full"}
          md:relative md:translate-x-0
          ${isCollapsed ? "md:w-20" : "md:w-64"}
        `}
      >
        {/* Cabecera Sidebar (Logo Komi + Nombre + Botón Colapsar / Expandir) */}
        <div className="p-4 border-b border-stone-800/80 flex-shrink-0">
          {!isCollapsed ? (
            <div className="space-y-3">
              {/* Fila 1: Logo + Nombre Komi */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-9 h-9 rounded-full overflow-hidden bg-white shadow-md border border-amber-500/30 shrink-0">
                  <Image
                    src="/logokomi.png"
                    alt="Komi"
                    fill
                    className="object-cover scale-[1.2] object-center"
                    unoptimized
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      Meseros
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-400 font-medium truncate">
                    Panel de Atención
                  </span>
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
              <div className="relative w-9 h-9 rounded-full overflow-hidden bg-white shadow-md border border-amber-500/30 shrink-0">
                <Image
                  src="/logokomi.png"
                  alt="Komi"
                  fill
                  className="object-cover scale-[1.2] object-center"
                  unoptimized
                />
              </div>

              <button
                type="button"
                onClick={toggleCollapsed}
                title="Expandir menú lateral"
                className="p-2 rounded-xl border-2 border-amber-500/70 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer shadow-sm shadow-amber-500/20"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="3" />
                  <path d="M9 3v18" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Navegación Principal del Mesero */}
        <nav className={`flex-1 py-3 space-y-1.5 overflow-y-auto overflow-x-hidden no-scrollbar ${isCollapsed ? "px-2 flex flex-col items-center" : "px-3"}`}>
          {/* 1. SECCIÓN VENTAS (Acordeón: Tomar Pedido (Mesas) / Historial de Pedidos) */}
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
              title="Ventas (Tomar Pedido / Historial de Pedidos)"
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

            {/* Submenú de Ventas para Meseros */}
            {!isCollapsed && ventasOpen && (
              <div className="pl-6 pr-1 pt-1.5 pb-1 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                {/* Opción 1: Tomar Pedido (Mesas) */}
                <Link
                  href="/waiter"
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isPosActive
                      ? "bg-amber-500/15 text-amber-400 font-bold border border-amber-500/20"
                      : "text-stone-400 hover:text-white hover:bg-stone-800/60"
                  }`}
                >
                  <Utensils size={14} className={isPosActive ? "text-amber-400" : "text-stone-500"} />
                  <span>Tomar Pedido (Mesas)</span>
                </Link>

                {/* Opción 2: Historial de Pedidos */}
                <Link
                  href="/waiter/mis-pedidos"
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isOrdersActive
                      ? "bg-amber-500/15 text-amber-400 font-bold border border-amber-500/20"
                      : "text-stone-400 hover:text-white hover:bg-stone-800/60"
                  }`}
                >
                  <ClipboardList size={14} className={isOrdersActive ? "text-amber-400" : "text-stone-500"} />
                  <span>Historial de Pedidos</span>
                </Link>
              </div>
            )}
          </div>

          {/* 2. Mi Perfil */}
          <Link
            href="/waiter/perfil"
            onClick={() => setSidebarOpen(false)}
            title="Mi Perfil"
            className={`flex items-center gap-3 rounded-2xl text-sm font-semibold transition-all group ${
              isPerfilActive
                ? "bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30"
                : "text-stone-400 hover:text-white hover:bg-stone-800/50"
            } ${isCollapsed ? "w-11 h-11 justify-center p-0" : "px-3.5 py-2.5 w-full"}`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isPerfilActive ? "text-amber-400" : "text-stone-400 group-hover:text-white"}`}>
              <User size={19} />
            </div>
            {!isCollapsed && <span>Mi Perfil</span>}
          </Link>

          {/* Enlace rápido: Ver Carta Online */}
          <div className="pt-2">
            <Link
              href="/delivery"
              target="_blank"
              title="Ver Carta Online (Pestaña nueva)"
              className={`flex items-center gap-3 rounded-2xl text-xs font-semibold text-stone-400 hover:text-amber-400 hover:bg-stone-800/50 transition-all ${
                isCollapsed ? "w-11 h-11 justify-center p-0" : "px-3.5 py-2 w-full"
              }`}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-stone-400 hover:text-amber-400">
                <ExternalLink size={17} />
              </div>
              {!isCollapsed && <span>Ver Carta Online</span>}
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
              {user?.name?.charAt(0) || user?.email?.charAt(0) || "M"}
            </div>

            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white font-semibold truncate leading-tight">
                  {user?.name || user?.email}
                </p>
                <p className="text-[10px] text-stone-400 font-medium truncate mt-0.5">
                  {getRoleLabel()}
                </p>
              </div>
            )}

            {!isCollapsed && (
              <button
                type="button"
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                title="Cerrar Sesión"
                className="p-1.5 text-stone-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>

          {/* Botón Logout cuando está Colapsado */}
          {isCollapsed && (
            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/login");
              }}
              title="Cerrar Sesión"
              className="w-11 h-11 flex items-center justify-center text-stone-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-2xl border border-stone-800 hover:border-rose-500/30 transition-all cursor-pointer"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header Superior Móvil / Tablet */}
        <header className="h-14 border-b border-stone-800 bg-stone-900/90 backdrop-blur-md px-4 flex items-center justify-between flex-shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-1 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 md:hidden"
              title="Abrir menú"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
                {getPageTitle()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-800/80 border border-stone-700/60 text-xs text-stone-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {user?.name || "Mesero"}
            </span>

            <Link
              href="/delivery"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-semibold transition-colors"
            >
              <ExternalLink size={13} />
              <span>Ver Carta</span>
            </Link>
          </div>
        </header>

        {/* Contenido de la Página */}
        <main className="flex-1 min-w-0 h-[calc(100vh-3.5rem)] overflow-y-auto bg-stone-950 relative">
          {children}
        </main>
      </div>
    </div>
  );
}