"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  UtensilsCrossed, 
  Menu as MenuIcon, 
  X, 
  Smartphone, 
  ChefHat, 
  Store, 
  LayoutDashboard,
  CreditCard,
  ArrowRight, 
  LogIn, 
  ChevronDown,
  Play,
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

  const demoRoles = [
    {
      href: "/demos?role=admin",
      icon: LayoutDashboard,
      label: "Dueño / Admin",
      desc: "Dashboard y métricas en vivo",
      color: "bg-orange-500/20 text-orange-400",
    },
    {
      href: "/demos?role=waiter",
      icon: Smartphone,
      label: "Mesero",
      desc: "Toma de pedidos en mesa",
      color: "bg-blue-500/20 text-blue-400",
    },
    {
      href: "/demos?role=cashier",
      icon: CreditCard,
      label: "Cajero / POS",
      desc: "Cobros y cierre de caja",
      color: "bg-green-500/20 text-green-400",
    },
    {
      href: "/demos?role=chef",
      icon: ChefHat,
      label: "Cocina (KDS)",
      desc: "Despacho en tiempo real",
      color: "bg-red-500/20 text-red-400",
    },
    {
      href: "/demos?role=store",
      icon: Store,
      label: "Carta Digital QR",
      desc: "Menú y delivery propio",
      color: "bg-purple-500/20 text-purple-400",
    },
  ];

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
            <div className="relative w-11 h-11 rounded-full overflow-hidden bg-white shadow-lg shadow-orange-500/10 group-hover:scale-105 transition-transform border border-orange-500/30 shrink-0">
              <Image
                src="/logokomi.png"
                alt="Komi"
                fill
                className="object-cover scale-[1.2] object-center"
                unoptimized
                priority
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  SaaS
                </span>
              </div>
              <span className="text-[11px] text-neutral-400 font-medium hidden sm:inline-block">
                Software &amp; Catálogo Digital para Comercios
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

            {/* Dropdown Demos en Vivo → /demos */}
            <div
              className="relative"
              onMouseEnter={() => setDemosDropdown(true)}
              onMouseLeave={() => setDemosDropdown(false)}
            >
              <Link
                href="/demos"
                className="flex items-center gap-1.5 text-sm font-medium text-neutral-300 hover:text-white transition-colors py-1"
              >
                <Play className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                <span>Demos en Vivo</span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              </Link>

              {demosDropdown && (
                <div className="absolute top-full left-0 w-72 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-2.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 px-2 pb-1.5 pt-0.5">
                    Elige un rol para ver la demo
                  </p>
                  {demoRoles.map((role) => {
                    const Icon = role.icon;
                    return (
                      <Link
                        key={role.href}
                        href={role.href}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-800/80 transition-colors text-neutral-300 hover:text-white"
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${role.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">{role.label}</p>
                          <p className="text-[11px] text-neutral-400">{role.desc}</p>
                        </div>
                      </Link>
                    );
                  })}
                  <div className="border-t border-neutral-800 pt-2 mt-1">
                    <Link
                      href="/demos"
                      className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg text-xs font-semibold text-orange-400 hover:bg-orange-500/10 transition-colors"
                    >
                      Ver todas las demos →
                    </Link>
                  </div>
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
              <UtensilsCrossed className="w-4 h-4" />
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
            <Link
              href="/demos"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-neutral-300 hover:text-white hover:bg-neutral-900 rounded-lg"
            >
              Demos en Vivo
            </Link>
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
              Planes &amp; Precios
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
            <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider px-3 mb-2">
              Demos por rol:
            </div>
            <div className="grid grid-cols-2 gap-2">
              {demoRoles.map((role) => {
                const Icon = role.icon;
                return (
                  <Link
                    key={role.href}
                    href={role.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-2 rounded-lg bg-neutral-900 border border-neutral-800"
                  >
                    <Icon className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span className="text-[11px] font-medium text-neutral-200 truncate">{role.label}</span>
                  </Link>
                );
              })}
            </div>

            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 mt-4 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-600 to-amber-600 rounded-lg shadow-lg"
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Empezar Gratis 14 Días</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
