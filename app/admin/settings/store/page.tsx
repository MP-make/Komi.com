"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Store,
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
  Bike,
  Smartphone,
  MapPin,
  Save,
  Globe,
  Share2,
  Sparkles,
  QrCode,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { DEFAULT_TENANT } from "@/lib/tenant";

export default function StoreSettingsPage() {
  const [slug, setSlug] = useState("demo");
  const [storeName, setStoreName] = useState("Komi Market & Store");
  const [whatsapp, setWhatsapp] = useState("51987654321");
  const [address, setAddress] = useState("Av. Principal 123, Lima");
  const [description, setDescription] = useState(
    "Catálogo digital interactivo con pedidos directos a WhatsApp y entrega rápida."
  );
  const [deliveryCost, setDeliveryCost] = useState("5.00");
  const [allowDelivery, setAllowDelivery] = useState(true);
  const [allowTakeaway, setAllowTakeaway] = useState(true);
  const [yapeNumber, setYapeNumber] = useState("987654321");
  const [yapeHolder, setYapeHolder] = useState("Komi Store");
  const [isOpen, setIsOpen] = useState(true);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [originUrl, setOriginUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOriginUrl(window.location.origin);
      // Cargar configuración previa si existe
      try {
        const saved = localStorage.getItem(`komi_store_settings_${slug}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.name) setStoreName(parsed.name);
          if (parsed.whatsapp) setWhatsapp(parsed.whatsapp);
          if (parsed.address) setAddress(parsed.address);
          if (parsed.description) setDescription(parsed.description);
          if (parsed.deliveryCost !== undefined) setDeliveryCost(String(parsed.deliveryCost));
          if (parsed.allowDelivery !== undefined) setAllowDelivery(parsed.allowDelivery);
          if (parsed.allowTakeaway !== undefined) setAllowTakeaway(parsed.allowTakeaway);
          if (parsed.yapeNumber) setYapeNumber(parsed.yapeNumber);
          if (parsed.yapeHolder) setYapeHolder(parsed.yapeHolder);
          if (parsed.isOpen !== undefined) setIsOpen(parsed.isOpen);
        }
      } catch (e) {
        console.warn("Could not load local store settings", e);
      }
    }
  }, [slug]);

  const storeUrl = `${originUrl}/t/${slug}`;

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(storeUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const config = {
      name: storeName.trim(),
      slug: slug.trim(),
      whatsapp: whatsapp.trim(),
      address: address.trim(),
      description: description.trim(),
      deliveryCost: parseFloat(deliveryCost) || 0,
      allowDelivery,
      allowTakeaway,
      yapeNumber: yapeNumber.trim(),
      yapeHolder: yapeHolder.trim(),
      isOpen,
    };

    localStorage.setItem(`komi_store_settings_${slug}`, JSON.stringify(config));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header de la sección */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Store className="w-7 h-7 text-amber-400" />
            Tienda Online & Catálogo WhatsApp
          </h1>
          <p className="text-stone-400 text-sm mt-1">
            Configura tu vitrina digital interactiva, enlace para redes sociales y pedidos directos a WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/t/${slug}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <ExternalLink size={15} />
            <span>Ver Mi Tienda</span>
          </Link>
        </div>
      </div>

      {/* Banner Destacado: Tu Enlace Oficial */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-stone-900 border border-amber-500/30 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              <Sparkles size={13} />
              Enlace de tu tienda listo para vender
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Coloca este link en la bio de tu Instagram, TikTok o Estados de WhatsApp:
            </h3>
            <div className="flex items-center gap-2 mt-2 bg-stone-950/80 px-3.5 py-2 rounded-xl border border-stone-800 text-xs sm:text-sm font-mono text-amber-400">
              <Globe size={15} className="text-stone-400 shrink-0" />
              <span className="truncate">{storeUrl}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs flex items-center gap-2 transition-all border border-stone-700 cursor-pointer shadow-sm"
            >
              {copiedLink ? (
                <>
                  <Check size={15} className="text-emerald-400" />
                  <span className="text-emerald-400 font-bold">¡Enlace Copiado!</span>
                </>
              ) : (
                <>
                  <Copy size={15} />
                  <span>Copiar Enlace</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Formulario de Configuración */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Columna Izquierda: Información de la Tienda y WhatsApp */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card: Datos Comerciales */}
          <div className="p-5 sm:p-6 rounded-2xl bg-stone-900 border border-stone-800 shadow-md space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-stone-800">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <Store size={16} />
              </div>
              <h3 className="text-sm font-bold text-white">Identidad de la Tienda</h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Nombre Comercial de la Tienda *
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Identificador / Slug URL *
                </label>
                <div className="flex items-center bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-400">
                  <span>/t/</span>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    className="bg-transparent text-white font-mono focus:outline-none w-full ml-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Número de WhatsApp para Pedidos *
                </label>
                <div className="flex items-center bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs">
                  <MessageCircle size={15} className="text-emerald-400 mr-2 shrink-0" />
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="Ej. 51987654321"
                    className="bg-transparent text-white font-mono focus:outline-none w-full"
                  />
                </div>
                <span className="text-[10px] text-stone-500 mt-1 block">
                  Incluye código de país (ej. 51 para Perú).
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Descripción o Eslogan del Catálogo
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Dirección Física o Punto de Retiro
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ej. Av. San Martín 340, Pisco"
                className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Card: Opciones de Entrega y Delivery */}
          <div className="p-5 sm:p-6 rounded-2xl bg-stone-900 border border-stone-800 shadow-md space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-stone-800">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <Bike size={16} />
              </div>
              <h3 className="text-sm font-bold text-white">Modalidades de Entrega</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Delivery a domicilio</span>
                  <input
                    type="checkbox"
                    checked={allowDelivery}
                    onChange={(e) => setAllowDelivery(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-400 mb-1">Costo de envío estándar (S/)</label>
                  <input
                    type="number"
                    step="0.5"
                    disabled={!allowDelivery}
                    value={deliveryCost}
                    onChange={(e) => setDeliveryCost(e.target.value)}
                    className="w-full px-3 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 disabled:opacity-40"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Retiro en local</span>
                  <span className="text-[11px] text-stone-400">Cliente recoge en tienda sin costo</span>
                </div>
                <input
                  type="checkbox"
                  checked={allowTakeaway}
                  onChange={(e) => setAllowTakeaway(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Pagos, Estado y Preview */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: Métodos de Pago Digitales */}
          <div className="p-5 sm:p-6 rounded-2xl bg-stone-900 border border-stone-800 shadow-md space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-stone-800">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <Smartphone size={16} />
              </div>
              <h3 className="text-sm font-bold text-white">Cobro por Yape / Plin</h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Número de Yape / Plin del Negocio
              </label>
              <input
                type="text"
                value={yapeNumber}
                onChange={(e) => setYapeNumber(e.target.value)}
                placeholder="Ej. 987654321"
                className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Titular de la Cuenta
              </label>
              <input
                type="text"
                value={yapeHolder}
                onChange={(e) => setYapeHolder(e.target.value)}
                placeholder="Ej. ¡Qué Bravazo! SAC"
                className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Card: Estado Operativo */}
          <div className="p-5 sm:p-6 rounded-2xl bg-stone-900 border border-stone-800 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Estado de la Tienda</h4>
                <p className="text-xs text-stone-400 mt-0.5">
                  {isOpen ? "Aceptando pedidos actualmente" : "Pausada temporalmente"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  isOpen ? "bg-emerald-500" : "bg-stone-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isOpen ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Botón Guardar Cambios */}
          <div className="space-y-3">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Save size={17} />
              <span>Guardar Configuración</span>
            </button>

            {savedSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center text-xs text-emerald-400 font-bold animate-in fade-in">
                ✓ ¡Configuración guardada exitosamente! Los cambios ya están activos en tu catálogo web.
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
