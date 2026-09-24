"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/auth";
import {
  ShoppingBag,
  ClipboardList,
  User,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Utensils
} from "lucide-react";

export default function WaiterLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoggedIn, isHydrated, logout } = useAuthStore();

  // Estado de colapso de la barra lateral (Mini-rail vs Expandido)
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Móvil drawer

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
    if (isPosActive) return "Tomar Pedido (Mesas)";
    if (isOrdersActive) return "Mis Pedidos";
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
                  <span className="text-[10px] text-stone-400 font-medium">Panel Meseros</span>
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
          {/* 1. Tomar Pedido (Mesas) */}
          <Link
            href="/waiter"
            onClick={() => setSidebarOpen(false)}
            title="Tomar Pedido"
            className={`flex items-center gap-3 rounded-2xl text-sm font-semibold transition-all group ${
              isPosActive
                ? "bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30"
                : "text-stone-400 hover:text-white hover:bg-stone-800/50"
            } ${isCollapsed ? "w-11 h-11 justify-center p-0" : "px-3.5 py-2.5 w-full"}`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isPosActive ? "text-amber-400" : "text-stone-400 group-hover:text-amber-400"}`}>
              <Utensils size={19} />
            </div>
            {!isCollapsed && <span>Tomar Pedido</span>}
          </Link>

          {/* 2. Mis Pedidos */}
          <Link
            href="/waiter/mis-pedidos"
            onClick={() => setSidebarOpen(false)}
            title="Mis Pedidos"
            className={`flex items-center gap-3 rounded-2xl text-sm font-semibold transition-all group ${
              isOrdersActive
                ? "bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30"
                : "text-stone-400 hover:text-white hover:bg-stone-800/50"
            } ${isCollapsed ? "w-11 h-11 justify-center p-0" : "px-3.5 py-2.5 w-full"}`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isOrdersActive ? "text-amber-400" : "text-stone-400 group-hover:text-white"}`}>
              <ClipboardList size={19} />
            </div>
            {!isCollapsed && <span>Mis Pedidos</span>}
          </Link>

          {/* 3. Mi Perfil */}
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

      {/* Contenedor Principal */}
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
              {user?.name?.charAt(0) || user?.email?.charAt(0) || "M"}
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

        {/* ÚNICA ÁREA DE CONTENIDO */}
        <main className={`flex-1 relative ${isPosActive ? "overflow-hidden p-0" : "overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 md:pb-8"}`}>
          {children}
        </main>
      </div>
    </div>
  );
}