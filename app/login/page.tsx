"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CreditCard,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const { login } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const query = dni.trim();

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dni: query, email: query, password }),
      });
      const data = await res.json();

      if (!data.ok) {
        setError(data.error || "Error al iniciar sesión");
        setIsLoading(false);
        return;
      }

      login(data.user);
      if (data.user.role === "staff") router.push("/waiter");
      else if (data.user.role === "chef") router.push("/chef");
      else if (data.user.role === "owner") router.push("/owner");
      else if (data.user.role === "cashier") router.push("/cashier");
      else router.push("/admin");
    } catch {
      setError("Error de conexión. Verifica tu internet.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col lg:flex-row relative overflow-hidden font-sans text-stone-100">
      {/* ======================================================== */}
      {/* LADO IZQUIERDO: SHOWCASE RESTAURANTE (Solo en Desktop / Tablet horizontal) */}
      {/* ======================================================== */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative flex-col justify-between p-10 xl:p-14 overflow-hidden border-r border-stone-800/80">
        {/* Foto de Restaurante de fondo */}
        <div className="absolute inset-0 bg-stone-950">
          <Image
            src="/Fondo restaurante.png"
            alt="Restaurante Komi"
            fill
            className="object-cover opacity-35 filter blur-[0.5px]"
            priority
          />
          {/* Degradado oscuro para que el texto sea nítido y legible */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/80 to-stone-950/40" />
        </div>

        {/* Encabezado Izquierdo: Branding Komi */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform">
              K
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-black tracking-tight text-white">
                Komi<span className="text-amber-400">.</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                SaaS
              </span>
            </div>
          </Link>
        </div>

        {/* Bloque Central Izquierdo: Propuesta de Valor y Características */}
        <div className="relative z-10 max-w-xl space-y-7 my-auto py-8">
          <div>
            <h1 className="text-3xl xl:text-4xl font-black text-white tracking-tight leading-tight">
              La plataforma completa para gestionar tu negocio
            </h1>
            <p className="text-sm xl:text-base text-stone-300 mt-2 font-medium leading-relaxed">
              Control de ventas, comandero de mesas, cocina KDS, inventario inteligente y catálogo online con pedidos a WhatsApp.
            </p>
          </div>

          {/* Lista de características con checks */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 size={15} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white leading-tight">Gestión de Ventas & POS</h4>
                <p className="text-xs text-stone-400 mt-0.5">
                  Control total de comandas, boletas, facturas y cobros rápidos con Yape/Plin.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 size={15} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white leading-tight">Inventario en Tiempo Real</h4>
                <p className="text-xs text-stone-400 mt-0.5">
                  Stock sincronizado automáticamente entre tu caja física y tu tienda web.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 size={15} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white leading-tight">Catálogo Digital & WhatsApp</h4>
                <p className="text-xs text-stone-400 mt-0.5">
                  Tus clientes compran directo desde tu enlace en Instagram o WhatsApp sin pasarelas.
                </p>
              </div>
            </div>
          </div>

          {/* Tarjeta Glassmorphic explicativa "¿Qué es Komi?" */}
          <div className="p-5 rounded-2xl bg-stone-900/60 backdrop-blur-md border border-stone-800/80 shadow-xl space-y-1.5">
            <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} />
              ¿Qué es Komi?
            </h5>
            <p className="text-xs text-stone-300 leading-relaxed">
              Komi es la solución SaaS diseñada para pequeños y medianos comercios o restaurantes que buscan digitalizar su operativa. Centraliza caja, cocina, meseros y ventas online en un único sistema intuitivo.
            </p>
          </div>
        </div>

        {/* Footer Izquierdo */}
        <div className="relative z-10 flex items-center justify-between text-xs text-stone-500 pt-4 border-t border-stone-800/80">
          <span>© {new Date().getFullYear()} Komi. Todos los derechos reservados.</span>
          <span className="flex items-center gap-1 text-stone-400">
            <ShieldCheck size={14} className="text-emerald-400" />
            Acceso Seguro SSL
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* LADO DERECHO: FORMULARIO CON VIDEO DE FONDO */}
      {/* En móvil ocupa toda la pantalla (w-full min-h-screen) exactamente como estaba */}
      {/* En desktop ocupa el 50% derecho con el video de fondo */}
      {/* ======================================================== */}
      <div className="w-full lg:w-1/2 xl:w-[45%] min-h-screen flex items-center justify-center relative overflow-hidden p-6 sm:p-10">
        {/* Video de Fondo (en móvil abarca toda la pantalla, en desktop el lado derecho) */}
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/login.png"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/login.mp4" type="video/mp4" />
        </video>

        {/* Overlay oscuro para legibilidad óptima */}
        <div className="absolute inset-0 bg-stone-950/75 backdrop-blur-[2px]" />

        {/* Tarjeta de Formulario de Login */}
        <div className="relative z-10 w-full max-w-sm sm:max-w-md bg-stone-950/80 backdrop-blur-xl border border-stone-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Header del Formulario */}
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-black font-black text-xl shadow-md shadow-amber-500/25">
                K
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Komi<span className="text-amber-400">.</span>
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Iniciar Sesión</h2>
            <p className="text-xs text-stone-400">
              Ingresa con tu correo o DNI para continuar
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-center">
              <p className="text-rose-300 text-xs font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="dni" className="block text-xs font-bold text-stone-300 mb-1.5">
                Correo Electrónico o DNI
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  id="dni"
                  type="text"
                  autoComplete="username"
                  required
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  placeholder="admin@komi.app o tu DNI"
                  className="w-full pl-10 pr-4 py-3 bg-stone-900/90 border border-stone-700/80 rounded-xl text-white text-xs sm:text-sm placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-bold text-stone-300">
                  Contraseña
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-stone-900/90 border border-stone-700/80 rounded-xl text-white text-xs sm:text-sm placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 disabled:opacity-50 text-black font-extrabold rounded-xl transition-all text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.99] cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verificando credenciales...</span>
                </>
              ) : (
                <>
                  <span>Iniciar Sesión</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Enlace de Registro */}
          <div className="pt-2 text-center border-t border-stone-800/80">
            <p className="text-xs text-stone-400">
              ¿No tienes una cuenta de negocio?{" "}
              <Link
                href="/register"
                className="font-bold text-amber-400 hover:text-amber-300 transition-colors"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
