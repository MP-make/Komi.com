"use client";
import Link from "next/link";
import { UtensilsCrossed, ShieldCheck, Heart, Smartphone, ChefHat, Store, BarChart3 } from "lucide-react";

export default function SaasFooter() {
  return (
    <footer className="bg-neutral-950 border-t border-neutral-900 text-neutral-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Logo & Marca */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-lg">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-black text-xl tracking-tight text-white">
                  Resto<span className="text-orange-500">OS</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  SaaS
                </span>
              </div>
            </Link>

            <p className="text-sm text-neutral-400 max-w-sm leading-relaxed">
              La plataforma en la nube todo-en-uno para restaurantes, bares, pollerías y dark kitchens. Optimiza tus comandas, KDS de cocina y delivery sin comisiones.
            </p>

            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Plataforma 100% en la nube con alta disponibilidad</span>
            </div>
          </div>

          {/* Demos del Sistema */}
          <div className="space-y-3">
            <p className="font-bold text-xs uppercase tracking-wider text-neutral-200">
              Demos del Sistema
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/waiter" className="hover:text-orange-400 transition-colors flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-neutral-500" />
                  Comandero Meseros
                </Link>
              </li>
              <li>
                <Link href="/chef" className="hover:text-orange-400 transition-colors flex items-center gap-1.5">
                  <ChefHat className="w-3.5 h-3.5 text-neutral-500" />
                  Pantalla Cocina KDS
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-orange-400 transition-colors flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-neutral-500" />
                  Carta Digital QR
                </Link>
              </li>
              <li>
                <Link href="/owner" className="hover:text-orange-400 transition-colors flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-neutral-500" />
                  Panel de Dueño
                </Link>
              </li>
              <li>
                <Link href="/delivery" className="hover:text-orange-400 transition-colors">
                  Tienda Delivery Cliente
                </Link>
              </li>
            </ul>
          </div>

          {/* Producto & Planes */}
          <div className="space-y-3">
            <p className="font-bold text-xs uppercase tracking-wider text-neutral-200">
              Plataforma
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#modulos" className="hover:text-white transition-colors">
                  Módulos y Funciones
                </a>
              </li>
              <li>
                <a href="#calculadora" className="hover:text-white transition-colors">
                  Calculadora de Ahorro
                </a>
              </li>
              <li>
                <a href="#precios" className="hover:text-white transition-colors">
                  Planes y Precios
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  Preguntas Frecuentes
                </a>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Prueba Gratis (14 días)
                </Link>
              </li>
            </ul>
          </div>

          {/* Acceso & Soporte */}
          <div className="space-y-3">
            <p className="font-bold text-xs uppercase tracking-wider text-neutral-200">
              Acceso Clientes
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/login" className="hover:text-orange-400 transition-colors">
                  Iniciar Sesión
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-orange-400 transition-colors">
                  Registrar Restaurante
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-orange-400 transition-colors">
                  Panel de Administrador
                </Link>
              </li>
              <li>
                <a
                  href="https://wa.me/51987654321?text=Hola,%20necesito%20soporte%20o%20informaci%C3%B3n%20sobre%20el%20SaaS"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Soporte WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Barra inferior */}
        <div className="border-t border-neutral-900 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} RestoOS SaaS. Todos los derechos reservados.</p>
          <div className="flex items-center gap-1">
            <span>Potenciando la gastronomía inteligente</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
