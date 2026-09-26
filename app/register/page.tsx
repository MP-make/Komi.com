"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  User,
  Phone,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  UtensilsCrossed,
  Search,
  Building2,
  AlertCircle,
  MapPin,
  Globe,
} from "lucide-react";
import { registerClient } from "@/lib/firebase/auth";
import { useAuthStore } from "@/lib/stores/auth";
import { useDniRucLookup } from "@/hooks/useDniRucLookup";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    address: "",
    slug: "",
    email: "",
    phone: "",
    dni: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: datos personales/negocio, 2: contraseña
  const [docType, setDocType] = useState<"dni" | "ruc">("dni");

  const router = useRouter();
  const { login } = useAuthStore();
  const { lookup, loading: isLookingUp, error: lookupError, data: lookupData, clear: clearLookup } = useDniRucLookup();

  const handleLookupDocument = async () => {
    const cleanDoc = formData.dni.trim().replace(/\D/g, "");
    if (!cleanDoc) return;
    const type = cleanDoc.length === 11 ? "ruc" : "dni";
    setDocType(type);
    const res = await lookup(type, cleanDoc);
    if (res && res.name) {
      const bName = res.nombre_comercial || res.razon_social || res.name;
      const cleanSlug = bName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 30) || "mi-restaurante";

      setFormData((prev) => ({
        ...prev,
        name: res.name,
        businessName: prev.businessName || bName,
        address: prev.address || res.direccion || "",
        slug: prev.slug || cleanSlug,
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "businessName" && !prev.slug) {
        updated.slug = value
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 30);
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      const finalBusinessName = formData.businessName.trim() || formData.name.trim() || "Mi Restaurante";
      const cleanSlug = (formData.slug || finalBusinessName)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "") || "mi-restaurante";

      const finalAddress = formData.address.trim() || "Lima, Perú";
      const finalPhone = formData.phone.trim();
      const cleanPhone = finalPhone.replace(/\D/g, "");

      // 1. Registrar usuario en Firebase Auth / Firestore
      const user = await registerClient(
        formData.email,
        formData.password,
        formData.name,
        formData.phone,
        formData.dni
      );

      // 2. Acoplar automáticamente todos los datos a las diferentes secciones:
      // a) Configuración del Negocio
      const restaurantPayload = {
        name: finalBusinessName,
        ruc: formData.dni.trim(),
        description: `Bienvenido a ${finalBusinessName}. La mejor carta, platos criollos y atención.`,
        address: finalAddress,
        phone: finalPhone,
        email: formData.email.trim(),
        website: `https://komi.pe/t/${cleanSlug}`,
        currency: "PEN (S/)",
        language: "Español",
        timeZone: "America/Lima (UTC-5, Perú)",
        dateFormat: "Dia/Mes/Año (dd/MM/yyyy)",
        slug: cleanSlug,
        ticket_footer: "¡GRACIAS POR SU PREFERENCIA! VUELVA PRONTO.",
        ticket_legal: "Representación Impresa de la Boleta / Factura Electrónica",
        updated_at: new Date().toISOString(),
      };

      // b) Tienda Online & Delivery
      const storePayload = {
        name: finalBusinessName,
        slug: cleanSlug,
        whatsapp: cleanPhone || "51999999999",
        address: finalAddress,
        description: `Catálogo oficial de ${finalBusinessName}. Haz tus pedidos por delivery o para llevar.`,
        deliveryCost: 5.0,
        allowDelivery: true,
        allowTakeaway: true,
        yapeNumber: cleanPhone,
        yapeHolder: finalBusinessName,
        isOpen: true,
        updated_at: new Date().toISOString(),
      };

      // c) Facturación Electrónica SUNAT
      const sunatPayload = {
        ruc: formData.dni.trim(),
        razonSocial: lookupData?.razon_social || finalBusinessName,
        nombreComercial: finalBusinessName,
        direccion: finalAddress,
        serieBoleta: "B001",
        serieFactura: "F001",
        serieNotaVenta: "NV01",
        billingMode: "mock",
        pseApiUrl: "https://api.nubefact.com/api/v1/",
        pseApiToken: "",
        ticket_footer: "¡GRACIAS POR SU PREFERENCIA! VUELVA PRONTO.",
        ticket_legal: "Representación Impresa de la Boleta / Factura Electrónica",
        updated_at: new Date().toISOString(),
      };

      // Guardar en Supabase site_settings para disponibilidad en backend
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
      ]).catch((err) => console.warn("Fallback guardado local:", err));

      // Guardar en localStorage para disponibilidad instantánea en toda la app
      localStorage.setItem("restaurant_settings", JSON.stringify(restaurantPayload));
      localStorage.setItem("komi_store_settings", JSON.stringify(storePayload));
      localStorage.setItem(`komi_store_settings_${cleanSlug}`, JSON.stringify(storePayload));
      localStorage.setItem("restaurant_sunat_settings", JSON.stringify(sunatPayload));

      // Notificar a componentes en escucha
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("komi_store_settings_updated"));
        window.dispatchEvent(new Event("komi_sunat_settings_updated"));
      }

      // 3. Auto login después del registro
      login({
        uid: user.uid,
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
        dni: formData.dni,
        role: "admin",
      });

      // Redirigir al panel de administración
      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "Error al crear la cuenta");
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setError("Completa nombre, correo y WhatsApp para continuar.");
      return;
    }
    setError("");
    setStep(2);
  };

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col lg:flex-row relative overflow-hidden font-sans text-stone-100">
      {/* ======================================================== */}
      {/* LADO IZQUIERDO: SHOWCASE SAAS KOMI (Desktop / Tablet horizontal) */}
      {/* ======================================================== */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative flex-col justify-between p-10 xl:p-14 overflow-hidden border-r border-stone-800/80">
        {/* Foto de Restaurante de fondo oficial */}
        <div className="absolute inset-0 bg-stone-950">
          <Image
            src="/login-imagen.png"
            alt="Restaurante Komi"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Degradado para nitidez y contraste premium */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/40 to-stone-950/60" />
        </div>

        {/* Encabezado Izquierdo: Branding Komi */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white shadow-xl border-2 border-amber-500/40 group-hover:scale-105 transition-transform shrink-0">
              <Image
                src="/logokomi.png"
                alt="Komi"
                fill
                className="object-cover scale-[1.2] object-center"
                unoptimized
                priority
              />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-stone-900/80 text-amber-400 border border-amber-500/30 backdrop-blur-md shadow-sm">
              SaaS Restaurantes
            </span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Volver a la portada</span>
          </Link>
        </div>

        {/* Contenido Central: Beneficios de Registro */}
        <div className="relative z-10 max-w-xl space-y-7 my-auto py-8">
          <div>
            <h1 className="text-3xl xl:text-4xl font-black text-white tracking-tight leading-tight">
              Comienza a digitalizar y hacer crecer tu negocio
            </h1>
            <p className="text-sm xl:text-base text-stone-300 mt-2 font-medium leading-relaxed">
              Crea tu cuenta en menos de 2 minutos y accede al catálogo digital, punto de venta (POS) y control total en la nube.
            </p>
          </div>

          {/* Lista de ventajas con checks */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 size={15} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white leading-tight">
                  Catálogo Digital & WhatsApp Inmediato
                </h4>
                <p className="text-xs text-stone-400 mt-0.5">
                  Comparte tu enlace único en redes sociales y recibe pedidos directos a tu celular.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 size={15} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white leading-tight">
                  Punto de Venta (POS) & Inventario en Vivo
                </h4>
                <p className="text-xs text-stone-400 mt-0.5">
                  El stock se actualiza automáticamente al vender en caja o en la tienda web.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 size={15} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white leading-tight">
                  0% de Comisiones por tus Ventas
                </h4>
                <p className="text-xs text-stone-400 mt-0.5">
                  Tus clientes te pagan por Yape, Plin o efectivo directo a tu cuenta sin descuentos.
                </p>
              </div>
            </div>
          </div>

          {/* Tarjeta de Prueba Gratis */}
          <div className="p-5 rounded-2xl bg-stone-900/60 backdrop-blur-md border border-stone-800/80 shadow-xl space-y-1.5">
            <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <UtensilsCrossed size={14} />
              Prueba Gratuita de 14 Días
            </h5>
            <p className="text-xs text-stone-300 leading-relaxed">
              Sin tarjeta de crédito obligatoria. Acceso completo a todas las funciones profesionales para que compruebes el impacto en tu negocio desde el primer día.
            </p>
          </div>
        </div>

        {/* Footer Izquierdo */}
        <div className="relative z-10 flex items-center justify-between text-xs text-stone-500 pt-4 border-t border-stone-800/80">
          <span>© {new Date().getFullYear()} Komi. Todos los derechos reservados.</span>
          <span className="flex items-center gap-1 text-stone-400">
            <ShieldCheck size={14} className="text-emerald-400" />
            Infraestructura Segura Cloud
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* LADO DERECHO: FORMULARIO CON VIDEO DE FONDO */}
      {/* En móvil ocupa toda la pantalla (w-full min-h-screen) */}
      {/* En desktop ocupa el 50% derecho con el video de fondo */}
      {/* ======================================================== */}
      <div className="w-full lg:w-1/2 xl:w-[45%] min-h-screen flex items-center justify-center relative overflow-hidden p-6 sm:p-10">
        {/* Video de Fondo */}
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

        {/* Overlay oscuro para contraste */}
        <div className="absolute inset-0 bg-stone-950/75 backdrop-blur-[2px]" />

        {/* Tarjeta de Formulario de Registro */}
        <div className="relative z-10 w-full max-w-sm sm:max-w-md bg-stone-950/80 backdrop-blur-xl border border-stone-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Header del Formulario */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-2">
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-white shadow-xl border-2 border-amber-500/40">
                <Image
                  src="/logokomi.png"
                  alt="Komi"
                  fill
                  className="object-cover scale-[1.2] object-center"
                  unoptimized
                  priority
                />
              </div>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Crear Cuenta de Negocio</h2>
            <p className="text-xs text-stone-400">
              {step === 1 ? "Paso 1: Datos de contacto y negocio" : "Paso 2: Contraseña y seguridad"}
            </p>
          </div>

          {/* Indicador de Pasos */}
          <div className="flex items-center justify-center gap-3">
            <div
              className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${
                step >= 1 ? "bg-amber-500 text-black shadow-md shadow-amber-500/25" : "bg-stone-800 text-stone-400"
              }`}
            >
              1
            </div>
            <div className={`w-12 h-1 rounded-full transition-all ${step >= 2 ? "bg-amber-500" : "bg-stone-800"}`} />
            <div
              className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${
                step >= 2 ? "bg-amber-500 text-black shadow-md shadow-amber-500/25" : "bg-stone-800 text-stone-400"
              }`}
            >
              2
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-center">
              <p className="text-rose-300 text-xs font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 ? (
              <>
                {/* Identificación Automática (DNI o RUC) */}
                <div className="bg-stone-900/70 border border-stone-800 rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="dni" className="block text-xs font-bold text-amber-400">
                      Identificación (DNI o RUC)
                    </label>
                    <span className="text-[10px] text-stone-400">Autocompletado automático</span>
                  </div>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        id="dni"
                        name="dni"
                        type="text"
                        value={formData.dni}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setFormData({ ...formData, dni: val });
                          if (val.length === 8) setDocType("dni");
                          if (val.length === 11) setDocType("ruc");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleLookupDocument();
                          }
                        }}
                        placeholder="Ingresa DNI (8) o RUC (11)..."
                        maxLength={11}
                        className="w-full pl-10 pr-3 py-2.5 bg-stone-950/90 border border-stone-700/80 rounded-xl text-white text-xs sm:text-sm font-mono placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-inner"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleLookupDocument}
                      disabled={isLookingUp || (formData.dni.length !== 8 && formData.dni.length !== 11)}
                      className="px-3.5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 disabled:opacity-40 text-black text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      {isLookingUp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                      <span>Consultar</span>
                    </button>
                  </div>

                  {/* Feedback del documento consultado */}
                  {lookupData && (
                    <div className="flex items-center gap-2 text-[10px] flex-wrap pt-0.5">
                      {lookupData.isMock ? (
                        <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-bold">
                          ● Datos Simulados
                        </span>
                      ) : (
                        <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                          ✓ Padrón Oficial Verificado
                        </span>
                      )}
                      {lookupData.estado && (
                        <span className="bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded font-bold">
                          {lookupData.estado}
                        </span>
                      )}
                      {lookupData.condicion && (
                        <span className="bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded font-bold">
                          {lookupData.condicion}
                        </span>
                      )}
                    </div>
                  )}

                  {lookupError && (
                    <p className="text-[11px] text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{lookupError}</span>
                    </p>
                  )}
                </div>

                {/* Nombre o Razón Social del Titular */}
                <div>
                  <label htmlFor="name" className="block text-xs font-bold text-stone-300 mb-1.5">
                    {formData.dni.length === 11 ? "Razón Social Oficial *" : "Nombre del Titular o Representante *"}
                  </label>
                  <div className="relative">
                    {formData.dni.length === 11 ? (
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    ) : (
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    )}
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={formData.dni.length === 11 ? "Razón Social registrada en SUNAT" : "Ej. Juan Carlos Pérez"}
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-900/90 border border-stone-700/80 rounded-xl text-white text-xs sm:text-sm placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* Nombre del Restaurante / Marca Comercial */}
                <div>
                  <label htmlFor="businessName" className="block text-xs font-bold text-amber-400 mb-1.5">
                    Nombre de tu Restaurante o Negocio *
                  </label>
                  <div className="relative">
                    <UtensilsCrossed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                    <input
                      id="businessName"
                      name="businessName"
                      type="text"
                      required
                      value={formData.businessName}
                      onChange={handleChange}
                      placeholder="Ej. Sabor Criollo Restobar"
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-900/90 border border-stone-700/80 rounded-xl text-white text-xs sm:text-sm placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner font-semibold"
                    />
                  </div>
                </div>

                {/* Dirección del Local */}
                <div>
                  <label htmlFor="address" className="block text-xs font-bold text-stone-300 mb-1.5">
                    Dirección del Local o Domicilio Fiscal
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      id="address"
                      name="address"
                      type="text"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Ej. Av. Los Próceres 450, Miraflores"
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-900/90 border border-stone-700/80 rounded-xl text-white text-xs sm:text-sm placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* Enlace de Tienda Online (Slug Automático) */}
                <div className="p-3 bg-stone-900/80 border border-amber-500/30 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-stone-300 flex items-center gap-1.5">
                      <Globe size={13} className="text-amber-400" />
                      Tu Enlace de Tienda Web & Delivery
                    </span>
                    <span className="text-[10px] text-amber-400 font-semibold">Automático</span>
                  </div>
                  <div className="flex items-center bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs font-mono">
                    <span className="text-stone-500 select-none">komi.pe/t/</span>
                    <input
                      name="slug"
                      type="text"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, "").slice(0, 30),
                        })
                      }
                      placeholder="mi-restaurante"
                      className="bg-transparent text-amber-400 font-bold focus:outline-none flex-1 ml-0.5"
                    />
                  </div>
                  <p className="text-[10px] text-stone-500">
                    Tu carta digital con pedidos directos a WhatsApp estará disponible en este enlace.
                  </p>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-stone-300 mb-1.5">
                    Correo Electrónico *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="admin@tunegocio.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-900/90 border border-stone-700/80 rounded-xl text-white text-xs sm:text-sm placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* Teléfono WhatsApp */}
                <div>
                  <label htmlFor="phone" className="block text-xs font-bold text-stone-300 mb-1.5">
                    Teléfono WhatsApp (Pedidos y Caja) *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="987654321"
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-900/90 border border-stone-700/80 rounded-xl text-white text-xs sm:text-sm placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* Botón Siguiente */}
                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-extrabold rounded-xl transition-all text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.99] cursor-pointer"
                >
                  <span>Continuar a Seguridad</span>
                  <ArrowRight size={16} />
                </button>
              </>
            ) : (
              <>
                {/* Contraseña */}
                <div>
                  <label htmlFor="password" className="block text-xs font-bold text-stone-300 mb-1.5">
                    Contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Mínimo 6 caracteres"
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

                {/* Confirmar Contraseña */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-bold text-stone-300 mb-1.5">
                    Confirmar Contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repite tu contraseña"
                      className="w-full pl-10 pr-10 py-3 bg-stone-900/90 border border-stone-700/80 rounded-xl text-white text-xs sm:text-sm placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* Resumen */}
                <div className="p-3 bg-stone-900/90 rounded-xl border border-stone-800 text-xs space-y-0.5">
                  <p className="text-stone-400">Cuenta para:</p>
                  <p className="text-white font-bold">{formData.name}</p>
                  <p className="text-amber-400 font-mono text-[11px]">{formData.email}</p>
                </div>

                {/* Botones Atrás y Finalizar */}
                <div className="flex gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="py-3 px-4 rounded-xl border border-stone-700 hover:bg-stone-800 text-stone-300 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Atrás
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 disabled:opacity-50 text-black font-extrabold rounded-xl transition-all text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.99] cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Creando cuenta...</span>
                      </>
                    ) : (
                      <>
                        <span>Crear mi Cuenta</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </form>

          {/* Enlace a Login */}
          <div className="pt-2 text-center border-t border-stone-800/80">
            <p className="text-xs text-stone-400">
              ¿Ya tienes una cuenta registrada?{" "}
              <Link
                href="/login"
                className="font-bold text-amber-400 hover:text-amber-300 transition-colors"
              >
                Iniciar Sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}