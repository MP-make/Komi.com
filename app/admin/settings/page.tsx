"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  Palette,
  Receipt,
  Store,
  Save,
  Upload,
  Trash2,
  Check,
  ExternalLink,
  Globe,
  Loader2,
  Copy,
  Sparkles,
  Printer,
  ChevronRight,
  ShieldCheck,
  Search,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useDniRucLookup } from "@/hooks/useDniRucLookup";

export default function BusinessSettingsPage() {
  const [activeTab, setActiveTab] = useState<"negocio" | "apariencia" | "comprobantes" | "tienda">("negocio");

  // 1. Datos del Negocio
  const [businessName, setBusinessName] = useState("Que Bravazo! Restobar");
  const [rucNit, setRucNit] = useState("20608945123");
  const [shortDescription, setShortDescription] = useState("Restobar, hamburguesas artesanales, alitas BBQ, comida criolla y coctelería.");
  const [address, setAddress] = useState("Urb. Los Jardines de San Andrés, Pisco, Ica");
  const [phone, setPhone] = useState("+51 946 826 535");
  const [email, setEmail] = useState("contacto@quebravazo.pe");
  const [website, setWebsite] = useState("https://www.quebravazo.pe");

  // 2. Apariencia & Localización
  const [primaryColor, setPrimaryColor] = useState("#f59e0b");
  const [logoUrl, setLogoUrl] = useState("/logo_que_bravazo.png");
  const [bannerUrl, setBannerUrl] = useState("/Fondo restaurante.png");
  const [currency, setCurrency] = useState("PEN (S/) — Sol Peruano");
  const [language, setLanguage] = useState("Español");
  const [timeZone, setTimeZone] = useState("America/Lima (UTC-5, Perú)");
  const [dateFormat, setDateFormat] = useState("Dia/Mes/Año (dd/MM/yyyy)");

  // 3. Comprobantes / Facturación SUNAT
  const [ticketFooter, setTicketFooter] = useState("¡GRACIAS POR SU PREFERENCIA! VUELVA PRONTO.");
  const [ticketLegal, setTicketLegal] = useState("Representación Impresa de la Boleta / Factura Electrónica");
  const [sunatRuc, setSunatRuc] = useState("20608945123");
  const [sunatRazonSocial, setSunatRazonSocial] = useState("QUE BRAVAZO RESTOBAR S.A.C.");
  const [sunatNombreComercial, setSunatNombreComercial] = useState("Que Bravazo! Restobar");
  const [sunatDireccion, setSunatDireccion] = useState("Urb. Los Jardines de San Andrés, Pisco, Ica");
  const [serieBoleta, setSerieBoleta] = useState("B001");
  const [serieFactura, setSerieFactura] = useState("F001");
  const [serieNotaVenta, setSerieNotaVenta] = useState("NV01");
  const [billingMode, setBillingMode] = useState<"mock" | "production">("mock");
  const [pseApiUrl, setPseApiUrl] = useState("https://api.nubefact.com/api/v1/");
  const [pseApiToken, setPseApiToken] = useState("");

  const { lookup: lookupSunatSettings, loading: isLookingUpSunat } = useDniRucLookup();

  // 4. Tienda Online
  const [storeSlug, setStoreSlug] = useState("quebravazo");
  const [deliveryCost, setDeliveryCost] = useState("5.00");
  const [allowDelivery, setAllowDelivery] = useState(true);
  const [allowTakeaway, setAllowTakeaway] = useState(true);
  const [yapeNumber, setYapeNumber] = useState("946826535");
  const [yapeHolder, setYapeHolder] = useState("Que Bravazo! Restobar");
  const [isOpen, setIsOpen] = useState(true);

  // Estados UI
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [originUrl, setOriginUrl] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Carga inicial de datos desde Supabase y localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      setOriginUrl(window.location.origin);

      // Carga inmediata de localStorage
      try {
        const localRest = localStorage.getItem("restaurant_settings");
        const localStore = localStorage.getItem("komi_store_settings");
        const localSunat = localStorage.getItem("restaurant_sunat_settings");

        if (localRest) {
          const p = JSON.parse(localRest);
          if (p.name) setBusinessName(p.name);
          if (p.ruc) setRucNit(p.ruc);
          if (p.description) setShortDescription(p.description);
          if (p.address) setAddress(p.address);
          if (p.phone) setPhone(p.phone);
          if (p.email) setEmail(p.email);
          if (p.website) setWebsite(p.website);
          if (p.logo_url) setLogoUrl(p.logo_url);
          if (p.banner_url) setBannerUrl(p.banner_url);
          if (p.primary_color) setPrimaryColor(p.primary_color);
          if (p.ticket_footer) setTicketFooter(p.ticket_footer);
          if (p.ticket_legal) setTicketLegal(p.ticket_legal);
          if (p.currency) setCurrency(p.currency);
          if (p.language) setLanguage(p.language);
          if (p.timeZone) setTimeZone(p.timeZone);
          if (p.dateFormat) setDateFormat(p.dateFormat);
        }
        if (localStore) {
          const s = JSON.parse(localStore);
          if (s.slug) setStoreSlug(s.slug);
          if (s.deliveryCost !== undefined) setDeliveryCost(String(s.deliveryCost));
          if (s.allowDelivery !== undefined) setAllowDelivery(s.allowDelivery);
          if (s.allowTakeaway !== undefined) setAllowTakeaway(s.allowTakeaway);
          if (s.yapeNumber) setYapeNumber(s.yapeNumber);
          if (s.yapeHolder) setYapeHolder(s.yapeHolder);
          if (s.isOpen !== undefined) setIsOpen(s.isOpen);
          if (s.logo_url && !logoUrl) setLogoUrl(s.logo_url);
          if (s.banner_url && !bannerUrl) setBannerUrl(s.banner_url);
        }
        if (localSunat) {
          const su = JSON.parse(localSunat);
          if (su.ruc) setSunatRuc(su.ruc);
          if (su.razonSocial) setSunatRazonSocial(su.razonSocial);
          if (su.nombreComercial) setSunatNombreComercial(su.nombreComercial);
          if (su.direccion) setSunatDireccion(su.direccion);
          if (su.serieBoleta) setSerieBoleta(su.serieBoleta);
          if (su.serieFactura) setSerieFactura(su.serieFactura);
          if (su.serieNotaVenta) setSerieNotaVenta(su.serieNotaVenta);
          if (su.billingMode) setBillingMode(su.billingMode);
          if (su.pseApiUrl) setPseApiUrl(su.pseApiUrl);
          if (su.pseApiToken) setPseApiToken(su.pseApiToken);
        }
      } catch (e) {
        console.warn("Could not parse local settings", e);
      }

      // Sincronizar desde base de datos
      Promise.all([
        fetch("/api/admin/settings?key=restaurant_settings").then((r) => r.json()).catch(() => ({})),
        fetch("/api/admin/settings?key=komi_store_settings").then((r) => r.json()).catch(() => ({})),
        fetch("/api/admin/settings?key=restaurant_sunat_settings").then((r) => r.json()).catch(() => ({})),
        fetch("/api/admin/media").then((r) => r.json()).catch(() => ({})),
      ]).then(([restRes, storeRes, sunatRes, mediaRes]) => {
        if (restRes?.value) {
          const p = restRes.value;
          if (p.name) setBusinessName(p.name);
          if (p.ruc) setRucNit(p.ruc);
          if (p.description) setShortDescription(p.description);
          if (p.address) setAddress(p.address);
          if (p.phone) setPhone(p.phone);
          if (p.email) setEmail(p.email);
          if (p.website) setWebsite(p.website);
          if (p.logo_url) setLogoUrl(p.logo_url);
          if (p.banner_url) setBannerUrl(p.banner_url);
          if (p.primary_color) setPrimaryColor(p.primary_color);
          if (p.ticket_footer) setTicketFooter(p.ticket_footer);
          if (p.ticket_legal) setTicketLegal(p.ticket_legal);
          if (p.currency) setCurrency(p.currency);
          if (p.language) setLanguage(p.language);
          if (p.timeZone) setTimeZone(p.timeZone);
          if (p.dateFormat) setDateFormat(p.dateFormat);
        }

        if (storeRes?.value) {
          const s = storeRes.value;
          if (s.slug) setStoreSlug(s.slug);
          if (s.name && !restRes?.value?.name) setBusinessName(s.name);
          if (s.address && !restRes?.value?.address) setAddress(s.address);
          if (s.whatsapp && !restRes?.value?.phone) setPhone(s.whatsapp);
          if (s.deliveryCost !== undefined) setDeliveryCost(String(s.deliveryCost));
          if (s.allowDelivery !== undefined) setAllowDelivery(s.allowDelivery);
          if (s.allowTakeaway !== undefined) setAllowTakeaway(s.allowTakeaway);
          if (s.yapeNumber) setYapeNumber(s.yapeNumber);
          if (s.yapeHolder) setYapeHolder(s.yapeHolder);
          if (s.isOpen !== undefined) setIsOpen(s.isOpen);
          if (s.logo_url) setLogoUrl(s.logo_url);
          if (s.banner_url) setBannerUrl(s.banner_url);
        }

        if (sunatRes?.value) {
          const su = sunatRes.value;
          if (su.ruc) setSunatRuc(su.ruc);
          if (su.razonSocial) setSunatRazonSocial(su.razonSocial);
          if (su.nombreComercial) setSunatNombreComercial(su.nombreComercial);
          if (su.direccion) setSunatDireccion(su.direccion);
          if (su.serieBoleta) setSerieBoleta(su.serieBoleta);
          if (su.serieFactura) setSerieFactura(su.serieFactura);
          if (su.serieNotaVenta) setSerieNotaVenta(su.serieNotaVenta);
          if (su.billingMode) setBillingMode(su.billingMode);
          if (su.pseApiUrl) setPseApiUrl(su.pseApiUrl);
          if (su.pseApiToken) setPseApiToken(su.pseApiToken);
        }

        // Si no hay logo ni banner explícito, intentar tomar de multimedia
        if (mediaRes?.data && Array.isArray(mediaRes.data)) {
          const mediaLogo = mediaRes.data.find((m: any) => m.section === "logo" && m.is_active);
          const mediaHero = mediaRes.data.find((m: any) => (m.section === "hero" || m.section === "background") && m.is_active);
          if (mediaLogo && !restRes?.value?.logo_url && !storeRes?.value?.logo_url) {
            setLogoUrl(mediaLogo.url);
          }
          if (mediaHero && !restRes?.value?.banner_url && !storeRes?.value?.banner_url) {
            setBannerUrl(mediaHero.url);
          }
        }
      });
    }
  }, []);

  // Consultar RUC emisor directamente a SUNAT
  const handleLookupSunat = async () => {
    const clean = sunatRuc.replace(/\D/g, "");
    if (clean.length !== 11) {
      alert("Por favor ingrese un RUC de 11 dígitos para consultar en SUNAT.");
      return;
    }
    const result = await lookupSunatSettings(clean);
    if (result) {
      if (result.razon_social) setSunatRazonSocial(result.razon_social);
      if (result.nombre_comercial) {
        setSunatNombreComercial(result.nombre_comercial);
      } else if (result.razon_social && !sunatNombreComercial) {
        setSunatNombreComercial(result.razon_social);
      }
      if (result.direccion) setSunatDireccion(result.direccion);
    }
  };

  // Subir archivo de logo
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

  // Subir archivo de banner
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

  // Guardar configuración completa
  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    const cleanSlug = storeSlug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "") || "quebravazo";

    const restaurantPayload = {
      name: businessName.trim(),
      ruc: rucNit.trim(),
      description: shortDescription.trim(),
      address: address.trim(),
      phone: phone.trim(),
      email: email.trim(),
      website: website.trim(),
      logo_url: logoUrl.trim(),
      banner_url: bannerUrl.trim(),
      primary_color: primaryColor.trim(),
      ticket_footer: ticketFooter.trim(),
      ticket_legal: ticketLegal.trim(),
      currency,
      language,
      timeZone,
      dateFormat,
      slug: cleanSlug,
      updated_at: new Date().toISOString(),
    };

    const storePayload = {
      name: businessName.trim(),
      slug: cleanSlug,
      whatsapp: phone.replace(/\D/g, "") || "51946826535",
      address: address.trim(),
      description: shortDescription.trim(),
      deliveryCost: parseFloat(deliveryCost) || 0,
      allowDelivery,
      allowTakeaway,
      yapeNumber: yapeNumber.trim(),
      yapeHolder: yapeHolder.trim(),
      isOpen,
      logo_url: logoUrl.trim(),
      banner_url: bannerUrl.trim(),
      primary_color: primaryColor.trim(),
      updated_at: new Date().toISOString(),
    };

    const sunatPayload = {
      ruc: sunatRuc.trim(),
      razonSocial: sunatRazonSocial.trim(),
      nombreComercial: sunatNombreComercial.trim(),
      direccion: sunatDireccion.trim(),
      serieBoleta: serieBoleta.trim(),
      serieFactura: serieFactura.trim(),
      serieNotaVenta: serieNotaVenta.trim(),
      billingMode,
      pseApiUrl: pseApiUrl.trim(),
      pseApiToken: pseApiToken.trim(),
      ticket_footer: ticketFooter.trim(),
      ticket_legal: ticketLegal.trim(),
      updated_at: new Date().toISOString(),
    };

    try {
      // 1. Guardar en Supabase site_settings
      await Promise.all([
        fetch("/api/admin/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "restaurant_settings", value: restaurantPayload }),
        }),
        fetch("/api/admin/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "komi_store_settings", value: storePayload }),
        }),
        fetch("/api/admin/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "restaurant_sunat_settings", value: sunatPayload }),
        }),
      ]);

      // 2. Guardar en localStorage para disponibilidad inmediata en toda la app
      localStorage.setItem("restaurant_settings", JSON.stringify(restaurantPayload));
      localStorage.setItem("komi_store_settings", JSON.stringify(storePayload));
      localStorage.setItem(`komi_store_settings_${cleanSlug}`, JSON.stringify(storePayload));
      localStorage.setItem("restaurant_sunat_settings", JSON.stringify(sunatPayload));

      // 3. Notificar a componentes en escucha (como el Sidebar o POS)
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("komi_store_settings_updated"));
        window.dispatchEvent(new Event("komi_sunat_settings_updated"));
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err) {
      console.error("Error guardando ajustes:", err);
      // Fallback local
      localStorage.setItem("restaurant_settings", JSON.stringify(restaurantPayload));
      localStorage.setItem("komi_store_settings", JSON.stringify(storePayload));
      localStorage.setItem("restaurant_sunat_settings", JSON.stringify(sunatPayload));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } finally {
      setIsSaving(false);
    }
  };

  const storeUrl = `${originUrl}/t/${storeSlug || "quebravazo"}`;

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(storeUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 font-sans">
      {/* Header Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Building2 className="w-7 h-7 text-blue-500" />
            Configuración del Negocio & Sistema
          </h1>
          <p className="text-stone-400 text-xs sm:text-sm mt-1">
            Gestiona la información de tu establecimiento, logo, apariencia, tienda online y comprobantes de venta.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/t/${storeSlug || "quebravazo"}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white text-xs font-bold transition-all border border-stone-700 active:scale-95 cursor-pointer shadow-sm"
          >
            <ExternalLink size={15} />
            <span>Ver Tienda Online</span>
          </Link>
          <button
            type="button"
            onClick={() => handleSaveAll()}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>{isSaving ? "Guardando..." : "Guardar Cambios"}</span>
          </button>
        </div>
      </div>

      {/* Alerta de Éxito al Guardar */}
      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 font-bold">
            <Check size={18} className="text-emerald-400" />
            <span>¡Configuración guardada exitosamente! Se ha sincronizado en todo el sistema.</span>
          </div>
          <span className="text-[11px] text-emerald-300 font-mono hidden sm:inline">Listo</span>
        </div>
      )}

      {/* Pestañas de Navegación Superiores (Estilo similar a la imagen enviada) */}
      <div className="flex items-center gap-1.5 p-1.5 bg-stone-900/90 border border-stone-800 rounded-2xl overflow-x-auto text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("negocio")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "negocio"
              ? "bg-blue-600 text-white shadow-md font-bold"
              : "text-stone-400 hover:text-white hover:bg-stone-800/60"
          }`}
        >
          <Building2 size={15} />
          <span>Negocio</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("apariencia")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "apariencia"
              ? "bg-blue-600 text-white shadow-md font-bold"
              : "text-stone-400 hover:text-white hover:bg-stone-800/60"
          }`}
        >
          <Palette size={15} />
          <span>Apariencia</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("comprobantes")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "comprobantes"
              ? "bg-blue-600 text-white shadow-md font-bold"
              : "text-stone-400 hover:text-white hover:bg-stone-800/60"
          }`}
        >
          <Receipt size={15} />
          <span>Facturación SUNAT & Tickets</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tienda")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "tienda"
              ? "bg-blue-600 text-white shadow-md font-bold"
              : "text-stone-400 hover:text-white hover:bg-stone-800/60"
          }`}
        >
          <Store size={15} />
          <span>Tienda Online & Slug</span>
        </button>
      </div>

      {/* CONTENIDO DE PESTAÑAS */}

      {/* 1. PESTAÑA: NEGOCIO (Idéntica estructura a imagen 3) */}
      {activeTab === "negocio" && (
        <div className="bg-stone-900/60 border border-stone-800/80 rounded-3xl p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-500" />
              Información del Negocio
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Configura los datos básicos y fiscales de tu establecimiento gastronómico.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block text-stone-300 font-semibold mb-1.5">
                Nombre del Negocio *
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Ej. Que Bravazo! Restobar"
                className="w-full px-4 py-3 bg-stone-950/80 border border-stone-800 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-stone-300 font-semibold mb-1.5">
                RUC / NIT *
              </label>
              <input
                type="text"
                value={rucNit}
                onChange={(e) => setRucNit(e.target.value)}
                placeholder="Ej. 20608945123"
                className="w-full px-4 py-3 bg-stone-950/80 border border-stone-800 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-stone-300 font-semibold mb-1.5">
                Descripción corta (opcional)
              </label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Ej. Hamburguesas artesanales, broaster, alitas y la mejor barra de tragos."
                className="w-full px-4 py-3 bg-stone-950/80 border border-stone-800 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-stone-300 font-semibold mb-1.5">
                Dirección Física *
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ej. Urb. Los Jardines de San Andrés, Pisco, Ica"
                className="w-full px-4 py-3 bg-stone-950/80 border border-stone-800 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-stone-300 font-semibold mb-1.5">
                Teléfono / WhatsApp *
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej. +51 946 826 535"
                className="w-full px-4 py-3 bg-stone-950/80 border border-stone-800 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-stone-300 font-semibold mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contacto@minegocio.com"
                className="w-full px-4 py-3 bg-stone-950/80 border border-stone-800 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-stone-300 font-semibold mb-1.5">
                Sitio Web (Opcional)
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://www.minegocio.com"
                className="w-full px-4 py-3 bg-stone-950/80 border border-stone-800 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. PESTAÑA: APARIENCIA (Idéntica estructura a imagen 4 con logo, color y localización) */}
      {activeTab === "apariencia" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Card: Personalización de Apariencia */}
          <div className="bg-stone-900/60 border border-stone-800/80 rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Palette className="w-5 h-5 text-blue-500" />
                Personalización de Apariencia
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Personaliza la identidad visual, colores y logos oficiales de tu negocio y tienda online.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              {/* Color Principal */}
              <div>
                <label className="block text-stone-300 font-semibold mb-1.5">
                  Color Principal
                </label>
                <div className="flex items-center gap-2 bg-stone-950/80 border border-stone-800 rounded-xl px-3 py-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-8 h-8 rounded-lg border-0 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    placeholder="#f59e0b"
                    className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* URL del Logo con Botón Subir y Remover */}
              <div>
                <label className="block text-stone-300 font-semibold mb-1.5">
                  URL del Logo (Opcional)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://... o /logo.png"
                    className="flex-1 px-3 py-2.5 bg-stone-950/80 border border-stone-800 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-blue-500 text-xs"
                  />
                  <input
                    type="file"
                    ref={logoInputRef}
                    onChange={handleUploadLogo}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={isUploadingLogo}
                    className="px-3 py-2.5 bg-stone-800 hover:bg-stone-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    {isUploadingLogo ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                    <span>Subir</span>
                  </button>
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoUrl("")}
                      className="px-3 py-2.5 bg-rose-600/90 hover:bg-rose-500 text-white rounded-xl font-bold transition-colors cursor-pointer shrink-0"
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Recuadro de Vista previa del Logo (Igual a la imagen 4) */}
            <div>
              <p className="text-[11px] font-semibold text-stone-400 mb-2">Vista previa del logo</p>
              <div className="w-full h-36 bg-stone-950/70 border border-dashed border-stone-800 rounded-2xl flex items-center justify-center p-4 relative overflow-hidden">
                {logoUrl ? (
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <Image
                      src={logoUrl}
                      alt="Logo Preview"
                      width={112}
                      height={112}
                      className="max-h-28 max-w-28 object-contain rounded-xl"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="text-center text-stone-600 space-y-1">
                    <Building2 className="w-8 h-8 mx-auto opacity-40" />
                    <p className="text-[11px]">No hay logo seleccionado</p>
                  </div>
                )}
              </div>
            </div>

            {/* URL y Vista previa de Portada / Banner de la Tienda */}
            <div className="pt-2 border-t border-stone-800/80">
              <label className="block text-stone-300 font-semibold mb-1.5 text-xs">
                Banner / Portada de la Tienda Online
              </label>
              <div className="flex items-center gap-2 mb-3 text-xs">
                <input
                  type="text"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://... o /Fondo restaurante.png"
                  className="flex-1 px-3 py-2.5 bg-stone-950/80 border border-stone-800 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-blue-500"
                />
                <input
                  type="file"
                  ref={bannerInputRef}
                  onChange={handleUploadBanner}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => bannerInputRef.current?.click()}
                  disabled={isUploadingBanner}
                  className="px-3 py-2.5 bg-stone-800 hover:bg-stone-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  {isUploadingBanner ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                  <span>Subir Portada</span>
                </button>
                {bannerUrl && (
                  <button
                    type="button"
                    onClick={() => setBannerUrl("")}
                    className="px-3 py-2.5 bg-rose-600/90 hover:bg-rose-500 text-white rounded-xl font-bold transition-colors cursor-pointer shrink-0"
                  >
                    Remover
                  </button>
                )}
              </div>

              {/* Vista previa de Portada */}
              <div className="relative h-32 sm:h-40 w-full bg-stone-950/70 border border-dashed border-stone-800 rounded-2xl overflow-hidden flex items-center justify-center">
                {bannerUrl ? (
                  <Image
                    src={bannerUrl}
                    alt="Banner Preview"
                    fill
                    className="object-cover opacity-80"
                    unoptimized
                  />
                ) : (
                  <span className="text-xs text-stone-500">Sin imagen de portada</span>
                )}
              </div>
            </div>
          </div>

          {/* Card: Configuración Regional y Localización (Idéntica a imagen 4) */}
          <div className="bg-stone-900/60 border border-stone-800/80 rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" />
                Configuración Regional y Localización
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Configura la moneda base, idioma, zona horaria y formato de fechas de tu negocio.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div>
                <label className="block text-stone-300 font-semibold mb-1.5">Moneda Base</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-950/80 border border-stone-800 rounded-xl text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="PEN (S/) — Sol Peruano">PEN (S/) — Sol Peruano</option>
                  <option value="USD ($) — Dólar Americano">USD ($) — Dólar Americano</option>
                  <option value="EUR (€) — Euro">EUR (€) — Euro</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1.5">Idioma del Sistema</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-950/80 border border-stone-800 rounded-xl text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="Español">Español</option>
                  <option value="English">English</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1.5">Zona Horaria</label>
                <select
                  value={timeZone}
                  onChange={(e) => setTimeZone(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-950/80 border border-stone-800 rounded-xl text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="America/Lima (UTC-5, Perú)">America/Lima (UTC-5, Perú)</option>
                  <option value="America/Bogota (UTC-5, Colombia)">America/Bogota (UTC-5, Colombia)</option>
                  <option value="America/Mexico_City (UTC-6, México)">America/Mexico_City (UTC-6, México)</option>
                  <option value="America/Santiago (UTC-4, Chile)">America/Santiago (UTC-4, Chile)</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1.5">Formato de Fecha</label>
                <select
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-950/80 border border-stone-800 rounded-xl text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="Dia/Mes/Año (dd/MM/yyyy)">Dia/Mes/Año (dd/MM/yyyy)</option>
                  <option value="Año/Mes/Día (yyyy-MM-dd)">Año/Mes/Día (yyyy-MM-dd)</option>
                  <option value="Mes/Día/Año (MM/dd/yyyy)">Mes/Día/Año (MM/dd/yyyy)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. PESTAÑA: COMPROBANTES / FACTURACIÓN SUNAT */}
      {activeTab === "comprobantes" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
          <div className="lg:col-span-7 space-y-6">
            {/* Cabecera */}
            <div className="bg-stone-900/60 border border-stone-800/80 rounded-3xl p-6 sm:p-8 space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Receipt className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    Facturación Electrónica SUNAT y Comprobantes
                  </h2>
                  <p className="text-xs text-stone-400">
                    Configura los datos del contribuyente emisor, series de emisión y credenciales del facturador.
                  </p>
                </div>
              </div>
            </div>

            {/* Bloque 1: Datos del Emisor Tributario */}
            <div className="bg-stone-900/60 border border-stone-800/80 rounded-3xl p-6 sm:p-8 space-y-5 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-500" />
                    Datos del Emisor Tributario (SUNAT)
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Información fiscal obligatoria que aparecerá en el encabezado de Boletas y Facturas.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <ShieldCheck size={12} /> RUC Activo
                </span>
              </div>

              {/* RUC con buscador */}
              <div>
                <label className="block text-stone-300 font-semibold mb-1.5">
                  RUC de la Empresa (11 dígitos) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={11}
                    value={sunatRuc}
                    onChange={(e) => setSunatRuc(e.target.value.replace(/\D/g, "").slice(0, 11))}
                    placeholder="20608945123"
                    className="flex-1 px-4 py-3 bg-stone-950/80 border border-stone-800 rounded-xl text-white font-mono text-sm tracking-wider focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleLookupSunat}
                    disabled={isLookingUpSunat || sunatRuc.length !== 11}
                    className="px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl flex items-center gap-2 transition"
                  >
                    {isLookingUpSunat ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    <span>Consultar SUNAT</span>
                  </button>
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Autocompleta Razón Social y Domicilio Fiscal oficial registrado ante la SUNAT.
                </p>
              </div>

              {/* Razón Social */}
              <div>
                <label className="block text-stone-300 font-semibold mb-1.5">
                  Razón Social (Nombre Legal) *
                </label>
                <input
                  type="text"
                  value={sunatRazonSocial}
                  onChange={(e) => setSunatRazonSocial(e.target.value)}
                  placeholder="QUE BRAVAZO RESTOBAR S.A.C."
                  className="w-full px-4 py-3 bg-stone-950/80 border border-stone-800 rounded-xl text-white uppercase placeholder-stone-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Nombre Comercial y Domicilio Fiscal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1.5">
                    Nombre Comercial (Fantasía)
                  </label>
                  <input
                    type="text"
                    value={sunatNombreComercial}
                    onChange={(e) => setSunatNombreComercial(e.target.value)}
                    placeholder="Que Bravazo! Restobar"
                    className="w-full px-4 py-3 bg-stone-950/80 border border-stone-800 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-semibold mb-1.5">
                    Domicilio Fiscal (Dirección SUNAT) *
                  </label>
                  <input
                    type="text"
                    value={sunatDireccion}
                    onChange={(e) => setSunatDireccion(e.target.value)}
                    placeholder="Urb. Los Jardines de San Andrés, Pisco, Ica"
                    className="w-full px-4 py-3 bg-stone-950/80 border border-stone-800 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Bloque 2: Series de Facturación Electrónica */}
            <div className="bg-stone-900/60 border border-stone-800/80 rounded-3xl p-6 sm:p-8 space-y-4 text-xs">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  Series de Emisión Electrónica
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Prefijo alfanumérico oficial de 4 caracteres para la numeración de los comprobantes.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-stone-300 font-semibold">Boletas</label>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">Tipo 03</span>
                  </div>
                  <input
                    type="text"
                    maxLength={4}
                    value={serieBoleta}
                    onChange={(e) => setSerieBoleta(e.target.value.toUpperCase().slice(0, 4))}
                    placeholder="B001"
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-white font-mono text-center font-bold text-sm tracking-wider focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-[10px] text-stone-500">Inicia con &apos;B&apos; (ej: B001)</p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-stone-300 font-semibold">Facturas</label>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">Tipo 01</span>
                  </div>
                  <input
                    type="text"
                    maxLength={4}
                    value={serieFactura}
                    onChange={(e) => setSerieFactura(e.target.value.toUpperCase().slice(0, 4))}
                    placeholder="F001"
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-white font-mono text-center font-bold text-sm tracking-wider focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-[10px] text-stone-500">Inicia con &apos;F&apos; (ej: F001)</p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-stone-300 font-semibold">Notas de Venta</label>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-500/10 text-stone-400">Ticket</span>
                  </div>
                  <input
                    type="text"
                    maxLength={4}
                    value={serieNotaVenta}
                    onChange={(e) => setSerieNotaVenta(e.target.value.toUpperCase().slice(0, 4))}
                    placeholder="NV01"
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-white font-mono text-center font-bold text-sm tracking-wider focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-[10px] text-stone-500">Interno (ej: NV01, T001)</p>
                </div>
              </div>
            </div>

            {/* Bloque 3: Modo de Emisión & Proveedor PSE */}
            <div className="bg-stone-900/60 border border-stone-800/80 rounded-3xl p-6 sm:p-8 space-y-5 text-xs">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Modo de Facturación y Conexión PSE
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Elige entre el entorno de simulador para capacitación o emisión legal directa.
                </p>
              </div>

              {/* Selector de Modo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setBillingMode("mock")}
                  className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                    billingMode === "mock"
                      ? "bg-blue-600/10 border-blue-500 text-white"
                      : "bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-white">Modo Simulador</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-300">
                      Entrenamiento
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Genera comprobantes oficiales, códigos QR y correlativos reales para pruebas y capacitación sin coste fiscal.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setBillingMode("production")}
                  className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                    billingMode === "production"
                      ? "bg-emerald-600/10 border-emerald-500 text-white"
                      : "bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-white">Modo Producción PSE</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">
                      Validez Legal SUNAT
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Envía comprobantes firmados digitalmente a SUNAT a través de un Proveedor de Servicios Electrónicos (PSE).
                  </p>
                </button>
              </div>

              {/* Credenciales PSE en producción */}
              {billingMode === "production" && (
                <div className="p-4 rounded-2xl bg-stone-950/90 border border-emerald-500/30 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                    <CheckCircle2 size={16} />
                    <span>Configuración de API del PSE (NubeFact / Facturador.pro / Decolecta)</span>
                  </div>

                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">URL Endpoint del PSE</label>
                    <input
                      type="url"
                      value={pseApiUrl}
                      onChange={(e) => setPseApiUrl(e.target.value)}
                      placeholder="https://api.nubefact.com/api/v1/"
                      className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">Token de API / API Key del PSE</label>
                    <input
                      type="password"
                      value={pseApiToken}
                      onChange={(e) => setPseApiToken(e.target.value)}
                      placeholder="Bearer token o hash de autorización"
                      className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Bloque 4: Textos y Pie de Ticket */}
            <div className="bg-stone-900/60 border border-stone-800/80 rounded-3xl p-6 sm:p-8 space-y-4 text-xs">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Printer className="w-4 h-4 text-stone-300" />
                Personalización del Ticket Térmico
              </h3>

              <div>
                <label className="block text-stone-300 font-semibold mb-1.5">
                  Pie de página / Mensaje de agradecimiento *
                </label>
                <textarea
                  rows={2}
                  value={ticketFooter}
                  onChange={(e) => setTicketFooter(e.target.value)}
                  placeholder="¡GRACIAS POR SU PREFERENCIA! VUELVA PRONTO."
                  className="w-full px-4 py-3 bg-stone-950/80 border border-stone-800 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1.5">
                  Leyenda legal o aviso adicional
                </label>
                <input
                  type="text"
                  value={ticketLegal}
                  onChange={(e) => setTicketLegal(e.target.value)}
                  placeholder="Representación Impresa de la Boleta / Factura Electrónica"
                  className="w-full px-4 py-3 bg-stone-950/80 border border-stone-800 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Vista previa en Vivo del Ticket Térmico (80mm) */}
          <div className="lg:col-span-5 bg-stone-900/60 border border-stone-800/80 rounded-3xl p-6 flex flex-col items-center sticky top-6 h-fit">
            <div className="w-full flex items-center justify-between text-stone-400 font-semibold text-xs mb-3">
              <div className="flex items-center gap-1.5">
                <Printer size={14} className="text-blue-400" />
                <span>Simulación de Ticket (80mm)</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                billingMode === "production"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-blue-500/20 text-blue-400"
              }`}>
                {billingMode === "production" ? "SUNAT PROD" : "SIMULADOR"}
              </span>
            </div>

            <div className="w-full max-w-[290px] bg-white text-black p-5 rounded-2xl font-mono text-[11px] shadow-2xl space-y-2 select-none border border-stone-300">
              <div className="text-center space-y-0.5">
                {logoUrl && (
                  <div className="w-12 h-12 mx-auto relative mb-1">
                    <Image src={logoUrl} alt="Logo" fill className="object-contain" unoptimized />
                  </div>
                )}
                <p className="font-extrabold text-xs uppercase">{sunatNombreComercial || businessName}</p>
                <p className="text-[10px] text-gray-700 font-semibold">{sunatRazonSocial}</p>
                <p className="text-[10px] text-gray-600 font-bold">RUC: {sunatRuc || "20608945123"}</p>
                <p className="text-[9px] text-gray-500 leading-tight">{sunatDireccion || address}</p>
              </div>

              <div className="border-t border-dashed border-gray-400 my-2" />

              <div className="text-center space-y-0.5">
                <p className="font-bold text-[11px]">BOLETA DE VENTA ELECTRÓNICA</p>
                <p className="font-extrabold text-xs">{serieBoleta || "B001"}-00000124</p>
              </div>

              <div className="border-t border-dashed border-gray-400 my-2" />

              <div className="space-y-0.5 text-[10px]">
                <p><span className="text-gray-500">FECHA:</span> 25/09/2026 13:45</p>
                <p><span className="text-gray-500">CLIENTE:</span> CLIENTE VARIOS</p>
                <p><span className="text-gray-500">DOC:</span> 00000000</p>
                <p><span className="text-gray-500">PAGO:</span> EFECTIVO</p>
              </div>

              <div className="border-t border-dashed border-gray-400 my-2" />

              <div className="space-y-1 text-[10px]">
                <div className="flex justify-between font-bold border-b border-gray-200 pb-0.5">
                  <span>CANT / DESCRIPCIÓN</span>
                  <span>TOTAL</span>
                </div>
                <div className="flex justify-between">
                  <span>1x Lomo Saltado Criollo</span>
                  <span className="font-semibold">S/ 28.00</span>
                </div>
                <div className="flex justify-between text-gray-600 text-[9px] pl-2">
                  <span>(Base S/ 23.73 + IGV S/ 4.27)</span>
                </div>
                <div className="flex justify-between">
                  <span>1x Chicha Morada 1L</span>
                  <span className="font-semibold">S/ 12.00</span>
                </div>
                <div className="flex justify-between">
                  <span>1x Envase Biodegradable</span>
                  <span className="font-semibold">S/ 1.00</span>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-400 my-2" />

              <div className="space-y-0.5 text-[10px]">
                <div className="flex justify-between text-gray-600">
                  <span>OP. GRAVADA:</span>
                  <span>S/ 34.75</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>IGV (18%):</span>
                  <span>S/ 6.25</span>
                </div>
                <div className="flex justify-between font-bold text-xs pt-1 border-t border-gray-200">
                  <span>TOTAL A PAGAR:</span>
                  <span>S/ 41.00</span>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-400 my-2" />

              {/* QR SUNAT Simulation */}
              <div className="flex flex-col items-center py-1">
                <div className="w-20 h-20 bg-gray-100 border border-gray-300 rounded flex flex-col items-center justify-center p-1 text-[8px] text-gray-500">
                  <div className="w-16 h-16 bg-black/10 rounded flex items-center justify-center font-mono text-[9px] text-black font-bold">
                    [QR SUNAT]
                  </div>
                </div>
                <span className="text-[8px] text-gray-400 font-mono mt-0.5">Hash: dGhpcyBpcyBhIHRlc3Q</span>
              </div>

              <div className="text-center text-[9px] space-y-0.5 pt-1 text-gray-700">
                <p className="font-bold uppercase">{ticketFooter}</p>
                <p className="text-[8px] text-gray-500">{ticketLegal}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. PESTAÑA: TIENDA ONLINE & SLUG */}
      {activeTab === "tienda" && (
        <div className="bg-stone-900/60 border border-stone-800/80 rounded-3xl p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Store className="w-5 h-5 text-blue-500" />
              Tienda Digital & Enlace de Venta
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Personaliza el link único de tu catálogo digital para tus redes sociales y WhatsApp.
            </p>
          </div>

          {/* Enlace destacado */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs text-amber-300 font-bold">Enlace de tu tienda en vivo:</p>
              <p className="text-sm font-mono text-white font-black mt-0.5">{storeUrl}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow"
              >
                {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedLink ? "¡Copiado!" : "Copiar Enlace"}</span>
              </button>
              <Link
                href={`/t/${storeSlug || "quebravazo"}`}
                target="_blank"
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white border border-stone-700 transition-colors"
                title="Abrir tienda en nueva pestaña"
              >
                <ExternalLink size={16} />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block text-stone-300 font-semibold mb-1.5">
                Identificador / Slug URL *
              </label>
              <div className="flex items-center bg-stone-950/80 border border-stone-800 rounded-xl px-3 py-2.5">
                <span className="text-stone-500 font-mono text-xs select-none">/t/</span>
                <input
                  type="text"
                  value={storeSlug}
                  onChange={(e) =>
                    setStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ""))
                  }
                  placeholder="quebravazo"
                  className="w-full bg-transparent text-white font-mono text-xs focus:outline-none ml-1"
                />
              </div>
              <p className="text-[10px] text-stone-500 mt-1">Solo letras minúsculas, números y guiones.</p>
            </div>

            <div>
              <label className="block text-stone-300 font-semibold mb-1.5">
                Costo de Envío Estándar (S/) *
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={deliveryCost}
                onChange={(e) => setDeliveryCost(e.target.value)}
                placeholder="5.00"
                className="w-full px-4 py-3 bg-stone-950/80 border border-stone-800 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-stone-300 font-semibold mb-1.5">Número de Yape / Plin</label>
              <input
                type="text"
                value={yapeNumber}
                onChange={(e) => setYapeNumber(e.target.value)}
                placeholder="946826535"
                className="w-full px-4 py-3 bg-stone-950/80 border border-stone-800 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-stone-300 font-semibold mb-1.5">Titular de la Cuenta Yape / Plin</label>
              <input
                type="text"
                value={yapeHolder}
                onChange={(e) => setYapeHolder(e.target.value)}
                placeholder="Que Bravazo! Restobar"
                className="w-full px-4 py-3 bg-stone-950/80 border border-stone-800 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-3 md:col-span-2 pt-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOpen}
                  onChange={(e) => setIsOpen(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
              <span className="text-xs font-semibold text-stone-300">
                {isOpen ? "Tienda Abierta (Aceptando pedidos)" : "Tienda Pausada temporalmente"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* BOTÓN INFERIOR DE GUARDADO (Estilo idéntico a imagen 4 con color azul) */}
      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={() => handleSaveAll()}
          disabled={isSaving}
          className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          <span>{isSaving ? "Guardando..." : "Guardar Configuración"}</span>
        </button>
      </div>
    </div>
  );
}
