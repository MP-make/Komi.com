"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  UtensilsCrossed, 
  Menu as MenuIcon, 
  X, 
  Smartphone, 
  ChefHat, 
  Store, 
  ArrowRight, 
  LogIn, 
  Sparkles,
  ChevronDown
} from "lucide-react";

export default function SaasHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demosDropdown, setDemosDropdown] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800 shadow-xl py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo & Marca */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 via-amber-500 to-orange-400 flex items-center justify-center shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-black text-xl tracking-tight text-white">
                  Resto<span className="text-orange-500">OS</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  SaaS
                </span>
              </div>
              <span className="text-[11px] text-neutral-400 font-medium hidden sm:inline-block">
                Software Integral para Restaurantes
              </span>
            </div>
          </Link>

          {/* Enlaces Desktop */}
          <nav className="hidden md:flex items-center gap-7">
            <a
              href="#modulos"
              className="text-sm font-medium text-neutral-300 hover:text-white transition-colors"
            >
              Módulos
            </a>

            {/* Dropdown Demos en vivo */}
            <div 
              className="relative"
              onMouseEnter={() => setDemosDropdown(true)}
              onMouseLeave={() => setDemosDropdown(false)}
            >
              <button 
                type="button"
                className="flex items-center gap-1.5 text-sm font-medium text-neutral-300 hover:text-white transition-colors py-1 cursor-pointer"
              >
                <span>Demos en Vivo</span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              {demosDropdown && (
                <div className="absolute top-full left-0 w-64 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-2.5 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <Link
                    href="/waiter"
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-800/80 transition-colors text-neutral-300 hover:text-white"
                  >
                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">Modo Mesero</p>
                      <p className="text-[11px] text-neutral-400">Toma de pedidos en mesa</p>
                    </div>
                  </Link>

                  <Link
                    href="/chef"
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-800/80 transition-colors text-neutral-300 hover:text-white"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <ChefHat className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">Modo Cocina (KDS)</p>
                      <p className="text-[11px] text-neutral-400">Despacho en tiempo real</p>
                    </div>
                  </Link>

                  <Link
                    href="/menu"
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-800/80 transition-colors text-neutral-300 hover:text-white"
                  >
                    <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">Carta Digital QR</p>
                      <p className="text-[11px] text-neutral-400">Menú y delivery propio</p>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            <a
              href="#calculadora"
              className="text-sm font-medium text-neutral-300 hover:text-white transition-colors"
            >
              Calculadora ROI
            </a>

            <a
              href="#precios"
              className="text-sm font-medium text-neutral-300 hover:text-white transition-colors"
            >
              Planes
            </a>

            <a
              href="#faq"
              className="text-sm font-medium text-neutral-300 hover:text-white transition-colors"
            >
              FAQ
            </a>
          </nav>

          {/* Acciones Header */}
          <div className="hidden lg:flex items-center gap-3.5">
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Acceso</span>
            </Link>

            <Link
              href="/register"
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 rounded-lg shadow-lg shadow-orange-600/30 hover:shadow-orange-600/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Crear Restaurante</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Botón Móvil */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/login"
              className="p-2 text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-800 rounded-lg"
              title="Iniciar sesión"
            >
              <LogIn className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-neutral-400 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Móvil Desplegable */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-neutral-950 border-b border-neutral-800 px-4 pt-3 pb-6 space-y-4">
          <div className="grid grid-cols-1 gap-2 pt-2">
            <a
              href="#modulos"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-neutral-300 hover:text-white hover:bg-neutral-900 rounded-lg"
            >
              Módulos del Sistema
            </a>
            <a
              href="#demos"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-neutral-300 hover:text-white hover:bg-neutral-900 rounded-lg"
            >
              Demos en Vivo
            </a>
            <a
              href="#calculadora"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-neutral-300 hover:text-white hover:bg-neutral-900 rounded-lg"
            >
              Calculadora de Ahorro
            </a>
            <a
              href="#precios"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-neutral-300 hover:text-white hover:bg-neutral-900 rounded-lg"
            >
              Planes & Precios
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-neutral-300 hover:text-white hover:bg-neutral-900 rounded-lg"
            >
              Preguntas Frecuentes
            </a>
          </div>

          <div className="border-t border-neutral-800 pt-4 space-y-2">
            <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider px-3 mb-1">
              Demos directas:
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Link
                href="/waiter"
                className="flex flex-col items-center justify-center p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-center"
              >
                <Smartphone className="w-4 h-4 text-orange-400 mb-1" />
                <span className="text-[11px] font-medium text-neutral-200">Mesero</span>
              </Link>
              <Link
                href="/chef"
                className="flex flex-col items-center justify-center p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-center"
              >
                <ChefHat className="w-4 h-4 text-emerald-400 mb-1" />
                <span className="text-[11px] font-medium text-neutral-200">Cocina</span>
              </Link>
              <Link
                href="/menu"
                className="flex flex-col items-center justify-center p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-center"
              >
                <Store className="w-4 h-4 text-sky-400 mb-1" />
                <span className="text-[11px] font-medium text-neutral-200">Carta QR</span>
              </Link>
            </div>

            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 mt-4 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-600 to-amber-600 rounded-lg shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              <span>Empezar Gratis 14 Días</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
