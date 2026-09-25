"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Loader2,
  Upload,
  ImageIcon,
} from "lucide-react";
import { DEFAULT_TENANT } from "@/lib/tenant";

export default function StoreSettingsPage() {
  const [slug, setSlug] = useState("quebravazo");
  const [storeName, setStoreName] = useState("Que Bravazo! Restobar");
  const [whatsapp, setWhatsapp] = useState("51946826535");
  const [address, setAddress] = useState("Urb. Los Jardines de San Andrés, Pisco, Ica");
  const [description, setDescription] = useState(
    "Catálogo digital interactivo con pedidos directos a WhatsApp y entrega rápida."
  );
  const [deliveryCost, setDeliveryCost] = useState("5.00");
  const [allowDelivery, setAllowDelivery] = useState(true);
  const [allowTakeaway, setAllowTakeaway] = useState(true);
  const [yapeNumber, setYapeNumber] = useState("946826535");
  const [yapeHolder, setYapeHolder] = useState("Que Bravazo! Restobar");
  const [isOpen, setIsOpen] = useState(true);
  const [logoUrl, setLogoUrl] = useState("/logo_que_bravazo.png");
  const [bannerUrl, setBannerUrl] = useState("/Fondo restaurante.png");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [originUrl, setOriginUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const applyConfig = (parsed: any) => {
    if (!parsed) return;
    if (parsed.name) setStoreName(parsed.name);
    if (parsed.slug) setSlug(parsed.slug);
    if (parsed.whatsapp) setWhatsapp(parsed.whatsapp);
    if (parsed.address) setAddress(parsed.address);
    if (parsed.description) setDescription(parsed.description);
    if (parsed.deliveryCost !== undefined) setDeliveryCost(String(parsed.deliveryCost));
    if (parsed.allowDelivery !== undefined) setAllowDelivery(parsed.allowDelivery);
    if (parsed.allowTakeaway !== undefined) setAllowTakeaway(parsed.allowTakeaway);
    if (parsed.yapeNumber) setYapeNumber(parsed.yapeNumber);
    if (parsed.yapeHolder) setYapeHolder(parsed.yapeHolder);
    if (parsed.isOpen !== undefined) setIsOpen(parsed.isOpen);
    if (parsed.logo_url) setLogoUrl(parsed.logo_url);
    if (parsed.banner_url) setBannerUrl(parsed.banner_url);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOriginUrl(window.location.origin);
      // 1. Cargar desde localStorage para visualización instantánea
      try {
        const savedStore =
          localStorage.getItem("komi_store_settings") ||
          localStorage.getItem(`komi_store_settings_${slug}`);
        const savedRest = localStorage.getItem("restaurant_settings");
        if (savedStore) {
          applyConfig(JSON.parse(savedStore));
        } else if (savedRest) {
          applyConfig(JSON.parse(savedRest));
        }
      } catch (e) {
        console.warn("Could not load local store settings", e);
      }

      // 2. Cargar desde base de datos y multimedia
      Promise.all([
        fetch("/api/admin/settings?key=komi_store_settings").then((r) => r.json()).catch(() => ({})),
        fetch("/api/admin/settings?key=restaurant_settings").then((r) => r.json()).catch(() => ({})),
        fetch("/api/admin/media").then((r) => r.json()).catch(() => ({})),
      ])
        .then(([storeRes, restRes, mediaRes]) => {
          if (storeRes?.value) {
            applyConfig(storeRes.value);
            try {
              localStorage.setItem("komi_store_settings", JSON.stringify(storeRes.value));
            } catch {}
          } else if (restRes?.value) {
            applyConfig(restRes.value);
          }

          // Fallback a multimedia si no hay imágenes asignadas
          if (mediaRes?.data && Array.isArray(mediaRes.data)) {
            const mediaLogo = mediaRes.data.find((m: any) => m.section === "logo" && m.is_active);
            const mediaHero = mediaRes.data.find(
              (m: any) => (m.section === "hero" || m.section === "background") && m.is_active
            );
            if (mediaLogo && (!storeRes?.value?.logo_url && !restRes?.value?.logo_url)) {
              setLogoUrl(mediaLogo.url);
            }
            if (mediaHero && (!storeRes?.value?.banner_url && !restRes?.value?.banner_url)) {
              setBannerUrl(mediaHero.url);
            }
          }
        })
        .catch((e) => console.warn("Could not load remote store settings", e))
        .finally(() => setIsLoading(false));
    }
  }, [slug]);

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/media/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (json.url) {
        setLogoUrl(json.url);
      }
    } catch (err) {
      console.error("Error subiendo logo:", err);
      alert("Error al subir el logo");
    } finally {
      setIsUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  const handleUploadBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBanner(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/media/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (json.url) {
        setBannerUrl(json.url);
      }
    } catch (err) {
      console.error("Error subiendo banner:", err);
      alert("Error al subir la portada");
    } finally {
      setIsUploadingBanner(false);
      if (bannerInputRef.current) bannerInputRef.current.value = "";
    }
  };

  const storeUrl = `${originUrl}/t/${slug}`;

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(storeUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "") || "quebravazo";
    const config = {
      name: storeName.trim(),
      slug: cleanSlug,
      whatsapp: whatsapp.trim(),
      address: address.trim(),
      description: description.trim(),
      deliveryCost: parseFloat(deliveryCost) || 0,
      allowDelivery,
      allowTakeaway,
      yapeNumber: yapeNumber.trim(),
      yapeHolder: yapeHolder.trim(),
      isOpen,
      logo_url: logoUrl.trim(),
      banner_url: bannerUrl.trim(),
      updated_at: new Date().toISOString(),
    };

    try {
      // 1. Guardar en Supabase y sincronizar con restaurant_settings
      await Promise.all([
        fetch("/api/admin/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: "komi_store_settings",
            value: config,
          }),
        }),
        (async () => {
          try {
            const rRes = await fetch("/api/admin/settings?key=restaurant_settings");
            const rJson = await rRes.json().catch(() => ({}));
            const currentRest = rJson?.value || {};
            const updatedRest = {
              ...currentRest,
              name: storeName.trim(),
              slug: cleanSlug,
              address: address.trim(),
              phone: whatsapp.trim(),
              logo_url: logoUrl.trim(),
              banner_url: bannerUrl.trim(),
              updated_at: new Date().toISOString(),
            };
            localStorage.setItem("restaurant_settings", JSON.stringify(updatedRest));
            await fetch("/api/admin/settings", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                key: "restaurant_settings",
                value: updatedRest,
              }),
            });
          } catch (e) {
            console.warn("Could not sync restaurant_settings", e);
          }
        })(),
      ]);

      // 2. Guardar en localStorage
      localStorage.setItem("komi_store_settings", JSON.stringify(config));
      localStorage.setItem(`komi_store_settings_${cleanSlug}`, JSON.stringify(config));

      // 3. Notificar a componentes (como el Sidebar para actualizar el enlace inmediatamente)
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("komi_store_settings_updated"));
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err) {
      console.error("Error saving settings:", err);
      // Fallback a localStorage
      localStorage.setItem("komi_store_settings", JSON.stringify(config));
      localStorage.setItem(`komi_store_settings_${cleanSlug}`, JSON.stringify(config));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("komi_store_settings_updated"));
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } finally {
      setIsSaving(false);
    }
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

            {/* Logo de la Tienda */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Logo de la Tienda (Top Bar, Portada y Perfil)
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-stone-950 p-3.5 rounded-xl border border-stone-800">
                <div className="relative w-16 h-16 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center overflow-hidden shrink-0">
                  {logoUrl ? (
                    <Image src={logoUrl} alt="Logo Preview" fill className="object-contain p-1.5" unoptimized />
                  ) : (
                    <Store className="w-7 h-7 text-stone-600" />
                  )}
                </div>
                <div className="flex-1 w-full space-y-2">
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="URL o sube un archivo"
                    className="w-full px-3 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleUploadLogo}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isUploadingLogo}
                      onClick={() => logoInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-stone-700 cursor-pointer"
                    >
                      {isUploadingLogo ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>Subiendo...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={13} />
                          <span>Subir Logo</span>
                        </>
                      )}
                    </button>
                    {logoUrl && (
                      <button
                        type="button"
                        onClick={() => setLogoUrl("")}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium transition-colors border border-rose-500/20 cursor-pointer"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Portada / Banner de la Tienda */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Portada / Banner Principal de la Tienda
              </label>
              <div className="space-y-3 bg-stone-950 p-3.5 rounded-xl border border-stone-800">
                <div className="relative aspect-[3/1] w-full rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center overflow-hidden">
                  {bannerUrl ? (
                    <Image src={bannerUrl} alt="Banner Preview" fill className="object-cover" unoptimized />
                  ) : (
                    <div className="flex items-center gap-2 text-stone-600 text-xs">
                      <ImageIcon size={20} />
                      <span>Sin portada asignada</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="text"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    placeholder="URL del banner o sube un archivo"
                    className="w-full px-3 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      ref={bannerInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleUploadBanner}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isUploadingBanner}
                      onClick={() => bannerInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-stone-700 cursor-pointer"
                    >
                      {isUploadingBanner ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>Subiendo...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={13} />
                          <span>Subir Portada</span>
                        </>
                      )}
                    </button>
                    {bannerUrl && (
                      <button
                        type="button"
                        onClick={() => setBannerUrl("")}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium transition-colors border border-rose-500/20 cursor-pointer"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                </div>
              </div>
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
                placeholder="Ej. Komi SAC"
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
              disabled={isSaving}
              className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] disabled:opacity-50 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando en el Sistema...</span>
                </>
              ) : (
                <>
                  <Save size={17} />
                  <span>Guardar Configuración</span>
                </>
              )}
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
