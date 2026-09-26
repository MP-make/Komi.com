"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  CreditCard,
  ChefHat,
  ShoppingBag,
  Laptop,
  Tablet,
  Smartphone,
  Maximize2,
  X,
  ArrowLeft,
} from "lucide-react";
import {
  AdminDemoView,
  WaiterDemoView,
  CashierDemoView,
  ChefDemoView,
  StorefrontDemoView,
} from "@/components/demos/DemoRoleViews";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type RoleKey = "admin" | "waiter" | "cashier" | "chef" | "store";
type DeviceKey = "laptop" | "tablet" | "mobile";

interface Role {
  key: RoleKey;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
const ROLES: Role[] = [
  {
    key: "admin",
    label: "Dueño / Admin",
    sublabel: "Panel de control",
    icon: LayoutDashboard,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/40",
  },
  {
    key: "waiter",
    label: "Mesero",
    sublabel: "Toma de pedidos",
    icon: UtensilsCrossed,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/40",
  },
  {
    key: "cashier",
    label: "Cajero",
    sublabel: "Cobros y caja",
    icon: CreditCard,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/40",
  },
  {
    key: "chef",
    label: "Cocinero (KDS)",
    sublabel: "Despacho cocina",
    icon: ChefHat,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/40",
  },
  {
    key: "store",
    label: "Carta Digital",
    sublabel: "Menú QR / Delivery",
    icon: ShoppingBag,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/40",
  },
];

const DEVICES: { key: DeviceKey; label: string; icon: React.ElementType }[] = [
  { key: "laptop", label: "Laptop", icon: Laptop },
  { key: "tablet", label: "Tablet", icon: Tablet },
  { key: "mobile", label: "Móvil", icon: Smartphone },
];

// ---------------------------------------------------------------------------
// Demo content renderer
// ---------------------------------------------------------------------------
function DemoContent({ role, compact }: { role: RoleKey; compact?: boolean }) {
  switch (role) {
    case "admin":
      return <AdminDemoView isCompact={compact} />;
    case "waiter":
      return <WaiterDemoView isCompact={compact} />;
    case "cashier":
      return <CashierDemoView isCompact={compact} />;
    case "chef":
      return <ChefDemoView isCompact={compact} />;
    case "store":
      return <StorefrontDemoView isCompact={compact} />;
  }
}

// ---------------------------------------------------------------------------
// Scaled screen helper
// ---------------------------------------------------------------------------
function ScaledScreen({
  naturalWidth,
  screenW,
  screenH,
  children,
}: {
  naturalWidth: number;
  screenW: number;
  screenH: number;
  children: React.ReactNode;
}) {
  const scale = screenW / naturalWidth;
  return (
    <div
      style={{ width: screenW, height: screenH, overflow: "hidden", position: "relative" }}
      className="rounded-lg bg-stone-950"
    >
      <div
        style={{
          width: naturalWidth,
          height: Math.round(screenH / scale),
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          overflow: "auto",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Laptop Frame  (screen: 860×540, renders content at 1280px wide)
// ---------------------------------------------------------------------------
function LaptopFrame({
  children,
  onExpand,
}: {
  children: React.ReactNode;
  onExpand: () => void;
}) {
  const SCREEN_W = 860;
  const SCREEN_H = 540;
  const NATURAL_W = 1280;

  return (
    <div className="flex flex-col items-center select-none">
      {/* Screen bezel */}
      <div
        className="relative bg-stone-800 rounded-t-2xl border border-stone-600 border-b-0 p-2 shadow-2xl"
        style={{ width: SCREEN_W + 24 }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-2 mb-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-stone-600 border border-stone-500" />
          <button
            onClick={onExpand}
            className="flex items-center gap-1 text-xs text-stone-400 hover:text-white transition-colors bg-stone-700 hover:bg-stone-600 rounded px-2 py-0.5"
          >
            <Maximize2 className="w-3 h-3" />
            <span>Agrandar</span>
          </button>
        </div>
        <ScaledScreen naturalWidth={NATURAL_W} screenW={SCREEN_W} screenH={SCREEN_H}>
          {children}
        </ScaledScreen>
      </div>
      {/* Base */}
      <div
        className="bg-stone-700 rounded-b-lg border border-stone-600 border-t-0"
        style={{ width: SCREEN_W + 80, height: 14 }}
      />
      <div
        className="bg-stone-600 rounded-b-xl"
        style={{ width: 300, height: 7 }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tablet Frame  (screen: 420×580, renders content at 768px wide)
// ---------------------------------------------------------------------------
function TabletFrame({
  children,
  onExpand,
}: {
  children: React.ReactNode;
  onExpand: () => void;
}) {
  const SCREEN_W = 420;
  const SCREEN_H = 580;
  const NATURAL_W = 768;

  return (
    <div className="relative flex flex-col items-center select-none">
      <div
        className="relative bg-stone-800 rounded-[36px] border-[6px] border-stone-600 shadow-2xl flex flex-col items-center py-5 px-4"
        style={{ width: SCREEN_W + 36, minHeight: SCREEN_H + 70 }}
      >
        {/* Camera */}
        <div className="w-2.5 h-2.5 rounded-full bg-stone-600 mb-3 shrink-0" />
        {/* Screen */}
        <ScaledScreen naturalWidth={NATURAL_W} screenW={SCREEN_W} screenH={SCREEN_H}>
          {children}
        </ScaledScreen>
        {/* Home bar */}
        <div className="w-20 h-1.5 rounded-full bg-stone-600 mt-4 shrink-0" />
      </div>
      {/* Expand button */}
      <button
        onClick={onExpand}
        className="mt-3 flex items-center gap-1.5 text-sm text-stone-400 hover:text-white transition-colors bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-lg px-3 py-1.5"
      >
        <Maximize2 className="w-4 h-4" />
        <span>Agrandar</span>
      </button>
    </div>
  );
}

// Mobile Frame  (screen: 280×590, renders content at 640px wide)
// ---------------------------------------------------------------------------
function MobileFrame({
  children,
  onExpand,
}: {
  children: React.ReactNode;
  onExpand: () => void;
}) {
  const SCREEN_W = 280;
  const SCREEN_H = 590;
  const NATURAL_W = 640;

  return (
    <div className="relative flex flex-col items-center select-none">
      <div
        className="relative bg-stone-800 rounded-[48px] border-[6px] border-stone-600 shadow-2xl flex flex-col items-center py-4 px-2"
        style={{ width: SCREEN_W + 36, minHeight: SCREEN_H + 80 }}
      >
        {/* Notch */}
        <div className="w-20 h-5 rounded-b-2xl bg-stone-900 mb-3 shrink-0 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-stone-700" />
        </div>
        {/* Screen */}
        <ScaledScreen naturalWidth={NATURAL_W} screenW={SCREEN_W} screenH={SCREEN_H}>
          {children}
        </ScaledScreen>
        {/* Gesture bar */}
        <div className="w-16 h-1.5 rounded-full bg-stone-600 mt-4 shrink-0" />
      </div>
      {/* Expand button */}
      <button
        onClick={onExpand}
        className="mt-3 flex items-center gap-1.5 text-sm text-stone-400 hover:text-white transition-colors bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-lg px-3 py-1.5"
      >
        <Maximize2 className="w-4 h-4" />
        <span>Agrandar</span>
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------
function DeviceModal({
  isOpen,
  onClose,
  device,
  role,
}: {
  isOpen: boolean;
  onClose: () => void;
  device: DeviceKey;
  role: RoleKey;
}) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Each device: screenW/H = the modal's visible screen area, naturalW = what content renders at
  const cfg: Record<DeviceKey, {
    screenW: number; screenH: number; naturalW: number;
    bezelW: number; rounded: string; bezel: string;
  }> = {
    laptop: {
      screenW: 1100, screenH: 660, naturalW: 1280,
      bezelW: 1124, rounded: "rounded-2xl", bezel: "p-3",
    },
    tablet: {
      screenW: 560, screenH: 780, naturalW: 768,
      bezelW: 600, rounded: "rounded-[40px]", bezel: "p-5",
    },
    mobile: {
      // Same ratio as small frame (640→186), scaled up: 640→390 (scale 0.61)
      screenW: 390, screenH: 740, naturalW: 640,
      bezelW: 440, rounded: "rounded-[52px]", bezel: "p-3",
    },
  };

  const c = cfg[device];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col items-center gap-3"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "98vh", maxWidth: "98vw" }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between w-full px-1">
          <div className="text-white font-semibold text-sm opacity-80 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            Demo en vivo · {DEVICES.find((d) => d.key === device)?.label}
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/register"
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
            >
              <UtensilsCrossed className="w-4 h-4" />
              Empezar Gratis
            </Link>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-300 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Device shell */}
        <div
          className={`bg-stone-800 border-4 border-stone-600 shadow-2xl ${c.rounded} ${c.bezel} flex flex-col items-center`}
          style={{ width: c.bezelW, maxWidth: "96vw" }}
        >
          {/* Top bezel decoration */}
          {device === "laptop" && (
            <div className="flex items-center gap-1.5 self-start mb-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
          )}
          {device === "tablet" && (
            <div className="w-3 h-3 rounded-full bg-stone-600 mb-3 shrink-0" />
          )}
          {device === "mobile" && (
            <div className="w-20 h-5 rounded-b-2xl bg-stone-900 mb-2 shrink-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-stone-700" />
            </div>
          )}

          {/* Screen — scaled content */}
          <ScaledScreen
            naturalWidth={c.naturalW}
            screenW={c.screenW}
            screenH={c.screenH}
          >
            <DemoContent role={role} />
          </ScaledScreen>

          {/* Bottom bezel decoration */}
          {(device === "tablet" || device === "mobile") && (
            <div className="w-16 h-1.5 rounded-full bg-stone-600 mt-3 shrink-0" />
          )}
        </div>

        {/* Laptop base */}
        {device === "laptop" && (
          <div className="flex flex-col items-center -mt-1">
            <div
              className="bg-stone-700 rounded-b-lg border-x border-b border-stone-600"
              style={{ width: c.bezelW + 40, height: 10 }}
            />
            <div
              className="bg-stone-600 rounded-b-xl"
              style={{ width: 220, height: 5 }}
            />
          </div>
        )}

        <p className="text-stone-600 text-xs">ESC o clic fuera para cerrar</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function DemosPage() {
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role") as RoleKey | null;

  const [activeRole, setActiveRole] = useState<RoleKey>(
    roleParam && ["admin","waiter","cashier","chef","store"].includes(roleParam)
      ? roleParam
      : "admin"
  );
  const [activeDevice, setActiveDevice] = useState<DeviceKey>("laptop");
  const [modalOpen, setModalOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Sync if the query param changes (e.g. browser back/forward)
  useEffect(() => {
    if (roleParam && ["admin","waiter","cashier","chef","store"].includes(roleParam)) {
      setActiveRole(roleParam);
    }
  }, [roleParam]);

  const openModal = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  const currentRole = ROLES.find((r) => r.key === activeRole)!;

  return (
    <div className="min-h-screen bg-stone-950 text-white flex flex-col">
      {/* ------------------------------------------------------------------ */}
      {/* Top Navbar                                                          */}
      {/* ------------------------------------------------------------------ */}
      <header className="sticky top-0 z-40 bg-stone-950/90 backdrop-blur-md border-b border-stone-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image
              src="/logokomi.png"
              alt="Komi"
              width={32}
              height={32}
              className="rounded-lg"
              unoptimized
            />
            <span className="font-bold text-lg tracking-tight">Komi</span>
          </Link>
          <span className="hidden sm:block text-stone-600 text-lg">·</span>
          <span className="hidden sm:block text-stone-400 text-sm">Hub de Demos</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-stone-400 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Inicio</span>
          </Link>
          <Link
            href="/register"
            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Registrarme Gratis</span>
          </Link>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Body: Sidebar + Main Area                                           */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar -------------------------------------------------------- */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-stone-800 bg-stone-900/40 p-4 gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-1 px-1">
            Elige un Rol
          </p>
          {ROLES.map((role) => {
            const Icon = role.icon;
            const isActive = activeRole === role.key;
            return (
              <button
                key={role.key}
                onClick={() => setActiveRole(role.key)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border text-left transition-all ${
                  isActive
                    ? `${role.bgColor} ${role.borderColor} ${role.color}`
                    : "border-transparent text-stone-400 hover:bg-stone-800 hover:text-white"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isActive ? role.bgColor : "bg-stone-800"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? role.color : "text-stone-500"}`} />
                </div>
                <div>
                  <p className={`text-sm font-semibold leading-tight ${isActive ? role.color : ""}`}>
                    {role.label}
                  </p>
                  <p className="text-xs text-stone-500 mt-0.5">{role.sublabel}</p>
                </div>
              </button>
            );
          })}

          <div className="mt-auto pt-4 border-t border-stone-800">
            <Link
              href="/register"
              className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
            >
              <UtensilsCrossed className="w-4 h-4" />
              Empezar Gratis
            </Link>
            <p className="text-center text-xs text-stone-600 mt-2">
              14 días de prueba · Sin tarjeta
            </p>
          </div>
        </aside>

        {/* Main content --------------------------------------------------- */}
        <main className="flex-1 overflow-auto p-4 lg:p-8 flex flex-col items-center gap-6">
          {/* Mobile role picker */}
          <div className="flex lg:hidden w-full gap-2 overflow-x-auto pb-1 no-scrollbar">
            {ROLES.map((role) => {
              const Icon = role.icon;
              const isActive = activeRole === role.key;
              return (
                <button
                  key={role.key}
                  onClick={() => setActiveRole(role.key)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border shrink-0 text-sm font-medium transition-all ${
                    isActive
                      ? `${role.bgColor} ${role.borderColor} ${role.color}`
                      : "border-stone-700 text-stone-400 bg-stone-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{role.label}</span>
                </button>
              );
            })}
          </div>

          {/* Role title */}
          <div className="w-full max-w-5xl">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentRole.bgColor}`}>
                <currentRole.icon className={`w-5 h-5 ${currentRole.color}`} />
              </div>
              <div>
                <h1 className="text-xl font-bold">{currentRole.label}</h1>
                <p className="text-stone-400 text-sm">{currentRole.sublabel} · Demo interactiva en tiempo real</p>
              </div>
            </div>
          </div>

          {/* Device selector */}
          <div className="flex gap-2">
            {DEVICES.map((dev) => {
              const Icon = dev.icon;
              const isActive = activeDevice === dev.key;
              return (
                <button
                  key={dev.key}
                  onClick={() => setActiveDevice(dev.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                    isActive
                      ? "bg-orange-500/10 border-orange-500/40 text-orange-400"
                      : "border-stone-700 text-stone-400 hover:border-stone-500 hover:text-stone-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {dev.label}
                </button>
              );
            })}
          </div>

          {/* Device frame + right panel */}
          <div className="flex flex-col xl:flex-row items-center xl:items-start justify-center gap-6 w-full">

            {/* Device frame — shrinks to its natural size */}
            <div className="flex items-center justify-center shrink-0">
              {activeDevice === "laptop" && (
                <LaptopFrame onExpand={openModal}>
                  <DemoContent role={activeRole} />
                </LaptopFrame>
              )}
              {activeDevice === "tablet" && (
                <TabletFrame onExpand={openModal}>
                  <DemoContent role={activeRole} />
                </TabletFrame>
              )}
              {activeDevice === "mobile" && (
                <MobileFrame onExpand={openModal}>
                  <DemoContent role={activeRole} />
                </MobileFrame>
              )}
            </div>

            {/* Right panel: note + CTA */}
            <div className="flex flex-col gap-4 w-full xl:w-64 shrink-0 xl:pt-8">
              {/* Disclaimer */}
              <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-4">
                <p className="text-stone-400 text-xs leading-relaxed">
                  <span className="block text-stone-300 font-semibold text-sm mb-1">ℹ️ Datos de ejemplo</span>
                  Todos los datos mostrados son ficticios y sólo tienen fines demostrativos.
                  La demo es completamente interactiva — prueba hacer clic en los elementos.
                </p>
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-b from-orange-600/10 to-orange-500/5 border border-orange-500/20 rounded-xl p-5">
                <p className="font-bold text-base mb-1 text-white">¿Te convenciste?</p>
                <p className="text-stone-400 text-xs mb-4 leading-relaxed">
                  Crea tu cuenta gratis y empieza a usar Komi hoy mismo en tu restaurante.
                </p>
                <Link
                  href="/register"
                  className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm w-full"
                >
                  <UtensilsCrossed className="w-4 h-4 shrink-0" />
                  <span>Crear mi Restaurante Gratis</span>
                </Link>
                <p className="text-center text-xs text-stone-600 mt-2">14 días · Sin tarjeta</p>
              </div>
            </div>

          </div>
        </main>

      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Modal                                                               */}
      {/* ------------------------------------------------------------------ */}
      <DeviceModal
        isOpen={modalOpen}
        onClose={closeModal}
        device={activeDevice}
        role={activeRole}
      />
    </div>
  );
}
