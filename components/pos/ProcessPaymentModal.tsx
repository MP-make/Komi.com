"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Receipt,
  Banknote,
  CreditCard,
  CheckCircle2,
  QrCode,
  Coins,
  Loader2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Copy,
  Check,
  Split,
  Layers,
  ArrowLeftRight,
} from "lucide-react";

export type PaymentMethodType = "Efectivo" | "Yape" | "Plin" | "Tarjeta" | "Mixto";
export type SinglePaymentMethod = "Efectivo" | "Yape" | "Plin" | "Tarjeta";
export type DocumentType = "NTV" | "BOLETA" | "FACTURA" | "COTIZACIÓN";

export interface ProcessPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  subtotal?: number;
  orderTitle?: string; // Ej: "Mesa 4" o "Venta en Caja"
  customerName?: string;
  initialDocType?: DocumentType;
  initialPaymentMethod?: PaymentMethodType;
  onConfirm: (data: {
    paymentMethod: PaymentMethodType;
    docType: DocumentType;
    cashReceived: number;
    vuelto: number;
    referenceCode?: string;
    mixedDetails?: {
      method1: string;
      amount1: number;
      method2: string;
      amount2: number;
    };
  }) => Promise<void> | void;
  isSubmitting?: boolean;
}

export default function ProcessPaymentModal({
  isOpen,
  onClose,
  total,
  subtotal,
  orderTitle = "Comanda",
  customerName = "Cliente General",
  initialDocType = "BOLETA",
  initialPaymentMethod = "Efectivo",
  onConfirm,
  isSubmitting = false,
}: ProcessPaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>(initialPaymentMethod);
  const [docType, setDocType] = useState<DocumentType>(initialDocType);
  const [cashReceived, setCashReceived] = useState<string>("");
  const [referenceCode, setReferenceCode] = useState<string>("");
  const [copiedAmount, setCopiedAmount] = useState(false);

  // Estados de Pago Mixto
  const [mixedMethod1, setMixedMethod1] = useState<SinglePaymentMethod>("Efectivo");
  const [mixedAmount1, setMixedAmount1] = useState<string>("");
  const [mixedMethod2, setMixedMethod2] = useState<SinglePaymentMethod>("Yape");
  const [mixedAmount2, setMixedAmount2] = useState<string>("");
  const [mixedCashReceived, setMixedCashReceived] = useState<string>("");

  // Configuración de QR (cargada dinámicamente)
  const [yapeConfig, setYapeConfig] = useState<{ qr_url: string; name: string }>({
    qr_url: "/uploads/1785226696144-hs71nv.png",
    name: "Juliana Pecho",
  });

  useEffect(() => {
    if (isOpen) {
      setSelectedMethod(initialPaymentMethod);
      setDocType(initialDocType);
      setCashReceived(total.toFixed(2));
      setReferenceCode("");

      // Inicializar split 50/50 por defecto para Mixto
      const half1 = Math.round((total / 2) * 100) / 100;
      const half2 = Math.round((total - half1) * 100) / 100;
      setMixedMethod1("Efectivo");
      setMixedAmount1(half1.toFixed(2));
      setMixedMethod2("Yape");
      setMixedAmount2(half2.toFixed(2));
      setMixedCashReceived(half1.toFixed(2));

      fetch("/api/admin/yape-config")
        .then((r) => r.json())
        .then((res) => {
          if (res?.value?.qr_url) {
            setYapeConfig({
              qr_url: res.value.qr_url,
              name: res.value.name || "Juliana Pecho",
            });
          }
        })
        .catch(() => {});
    }
  }, [isOpen, initialDocType, initialPaymentMethod, total]);

  if (!isOpen) return null;

  const cashNum = parseFloat(cashReceived) || 0;
  const vuelto = selectedMethod === "Efectivo" ? Math.max(0, cashNum - total) : 0;
  const isCashInsufficient = selectedMethod === "Efectivo" && cashNum < total;

  // Cálculos para Pago Mixto
  const mixedNum1 = parseFloat(mixedAmount1) || 0;
  const mixedNum2 = parseFloat(mixedAmount2) || 0;
  const mixedSum = Math.round((mixedNum1 + mixedNum2) * 100) / 100;
  const mixedDifference = Math.round((total - mixedSum) * 100) / 100;
  const isMixedMismatch = Math.abs(mixedDifference) > 0.05;

  // Vuelto en efectivo para pago mixto si alguno de los 2 es efectivo
  const isMixedCash1 = mixedMethod1 === "Efectivo";
  const isMixedCash2 = mixedMethod2 === "Efectivo";
  const hasCashInMixed = isMixedCash1 || isMixedCash2;
  const mixedCashRequired = isMixedCash1 ? mixedNum1 : isMixedCash2 ? mixedNum2 : 0;
  const mixedCashGiven = parseFloat(mixedCashReceived) || 0;
  const mixedCashVuelto = Math.max(0, mixedCashGiven - mixedCashRequired);
  const isMixedCashInsufficient = hasCashInMixed && mixedCashGiven < mixedCashRequired;

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(total.toFixed(2));
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const handleQuickCash = (amount: number) => {
    setCashReceived(amount.toFixed(2));
  };

  const handleMixedAmount1Change = (val: string) => {
    setMixedAmount1(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      const rest = Math.max(0, Math.round((total - num) * 100) / 100);
      setMixedAmount2(rest.toFixed(2));
      if (mixedMethod1 === "Efectivo") {
        setMixedCashReceived(num.toFixed(2));
      }
    }
  };

  const handleMixedAmount2Change = (val: string) => {
    setMixedAmount2(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      const rest = Math.max(0, Math.round((total - num) * 100) / 100);
      setMixedAmount1(rest.toFixed(2));
      if (mixedMethod2 === "Efectivo") {
        setMixedCashReceived(num.toFixed(2));
      }
    }
  };

  const handleSplit5050 = () => {
    const half1 = Math.round((total / 2) * 100) / 100;
    const half2 = Math.round((total - half1) * 100) / 100;
    setMixedAmount1(half1.toFixed(2));
    setMixedAmount2(half2.toFixed(2));
    if (mixedMethod1 === "Efectivo") setMixedCashReceived(half1.toFixed(2));
    if (mixedMethod2 === "Efectivo") setMixedCashReceived(half2.toFixed(2));
  };

  const handleSubmit = async () => {
    let mixedData = undefined;
    let finalCashReceived = cashNum;
    let finalVuelto = vuelto;

    if (selectedMethod === "Mixto") {
      mixedData = {
        method1: mixedMethod1,
        amount1: mixedNum1,
        method2: mixedMethod2,
        amount2: mixedNum2,
      };
      if (hasCashInMixed) {
        finalCashReceived = mixedCashGiven;
        finalVuelto = mixedCashVuelto;
      } else {
        finalCashReceived = total;
        finalVuelto = 0;
      }
    }

    const mixedSummaryStr = selectedMethod === "Mixto"
      ? `Mixto: ${mixedMethod1} (S/ ${mixedNum1.toFixed(2)}) + ${mixedMethod2} (S/ ${mixedNum2.toFixed(2)})`
      : "";

    const finalReference = selectedMethod === "Mixto"
      ? [mixedSummaryStr, referenceCode.trim()].filter(Boolean).join(" | ")
      : referenceCode.trim() || undefined;

    await onConfirm({
      paymentMethod: selectedMethod,
      docType,
      cashReceived: selectedMethod === "Efectivo" ? cashNum : finalCashReceived,
      vuelto: selectedMethod === "Efectivo" ? vuelto : finalVuelto,
      referenceCode: finalReference,
      mixedDetails: mixedData,
    });
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden text-stone-100">
        {/* ======================================================== */}
        {/* HEADER DEL MODAL */}
        {/* ======================================================== */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800/80 bg-stone-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-md shadow-amber-500/10">
              <Receipt size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Procesar Venta & Cobro
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Caja Activa
                </span>
              </div>
              <p className="text-xs text-stone-400">
                {orderTitle} {customerName ? `• ${customerName}` : ""}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 border border-transparent hover:border-stone-700 transition-all cursor-pointer"
            title="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* ======================================================== */}
        {/* CUERPO DEL MODAL (2 COLUMNAS EN DESKTOP) */}
        {/* ======================================================== */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ---------------------------------------------------- */}
          {/* COLUMNA IZQUIERDA (7 cols): Resumen + Comprobante + Métodos */}
          {/* ---------------------------------------------------- */}
          <div className="lg:col-span-7 space-y-5">
            {/* Total Hero Banner */}
            <div className="bg-gradient-to-br from-stone-950 via-stone-950 to-stone-900 border border-stone-800 p-4 sm:p-5 rounded-2xl flex items-center justify-between shadow-inner">
              <div>
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                  Total a Cobrar
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl sm:text-4xl font-black text-amber-400 font-mono tracking-tight">
                    S/ {total.toFixed(2)}
                  </span>
                  {subtotal && subtotal !== total && (
                    <span className="text-xs text-stone-500 line-through font-mono">
                      S/ {subtotal.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyAmount}
                className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Copiar monto"
              >
                {copiedAmount ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copiedAmount ? "Copiado" : "Copiar Monto"}</span>
              </button>
            </div>

            {/* Selector de Comprobante */}
            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
                Tipo de Comprobante
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["BOLETA", "FACTURA", "NTV"] as DocumentType[]).map((doc) => {
                  const active = docType === doc;
                  return (
                    <button
                      key={doc}
                      type="button"
                      onClick={() => setDocType(doc)}
                      className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                        active
                          ? doc === "BOLETA"
                            ? "bg-sky-500/20 text-sky-400 border-sky-500/50 shadow-md shadow-sky-500/10 font-extrabold"
                            : doc === "FACTURA"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-md shadow-emerald-500/10 font-extrabold"
                            : "bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-md shadow-amber-500/10 font-extrabold"
                          : "bg-stone-950/70 text-stone-400 border-stone-800 hover:border-stone-700 hover:text-white"
                      }`}
                    >
                      <span>
                        {doc === "NTV" ? "Nota Venta" : doc === "BOLETA" ? "Boleta Electrónica" : "Factura Electrónica"}
                      </span>
                      <span className="text-[10px] font-normal opacity-70">
                        {doc === "NTV" ? "Sin IGV" : "SUNAT Ready"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selector de Métodos de Pago con Logos Oficiales */}
            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
                Método de Pago
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {/* 1. YAPE (Logo Oficial) */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod("Yape")}
                  className={`relative p-3 rounded-2xl border transition-all flex items-center gap-3 text-left cursor-pointer group ${
                    selectedMethod === "Yape"
                      ? "bg-purple-950/40 border-purple-500 text-white shadow-lg shadow-purple-500/15 ring-1 ring-purple-500/50"
                      : "bg-stone-950/70 border-stone-800 text-stone-300 hover:border-stone-700 hover:bg-stone-900"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#742284] flex items-center justify-center p-1 shrink-0 shadow-md shadow-purple-950/50">
                    <Image
                      src="/icono-yape.png"
                      alt="Logo Oficial Yape"
                      width={36}
                      height={36}
                      className="object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black tracking-tight text-white flex items-center gap-1.5">
                      <span>Yape</span>
                      {selectedMethod === "Yape" && (
                        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                      )}
                    </h4>
                    <p className="text-[10px] text-purple-300/80 font-medium truncate">QR Digital</p>
                  </div>
                </button>

                {/* 2. PLIN (Logo Oficial) */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod("Plin")}
                  className={`relative p-3 rounded-2xl border transition-all flex items-center gap-3 text-left cursor-pointer group ${
                    selectedMethod === "Plin"
                      ? "bg-cyan-950/40 border-cyan-500 text-white shadow-lg shadow-cyan-500/15 ring-1 ring-cyan-500/50"
                      : "bg-stone-950/70 border-stone-800 text-stone-300 hover:border-stone-700 hover:bg-stone-900"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#00D0B7] flex items-center justify-center p-1 shrink-0 shadow-md shadow-cyan-950/50">
                    <Image
                      src="/icono-plin.png"
                      alt="Logo Oficial Plin"
                      width={36}
                      height={36}
                      className="object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black tracking-tight text-white flex items-center gap-1.5">
                      <span>Plin</span>
                      {selectedMethod === "Plin" && (
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      )}
                    </h4>
                    <p className="text-[10px] text-cyan-300/80 font-medium truncate">QR Digital</p>
                  </div>
                </button>

                {/* 3. EFECTIVO */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod("Efectivo")}
                  className={`relative p-3 rounded-2xl border transition-all flex items-center gap-3 text-left cursor-pointer group ${
                    selectedMethod === "Efectivo"
                      ? "bg-emerald-950/40 border-emerald-500 text-white shadow-lg shadow-emerald-500/15 ring-1 ring-emerald-500/50"
                      : "bg-stone-950/70 border-stone-800 text-stone-300 hover:border-stone-700 hover:bg-stone-900"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                    <Banknote size={20} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black tracking-tight text-white flex items-center gap-1.5">
                      <span>Efectivo</span>
                      {selectedMethod === "Efectivo" && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                    </h4>
                    <p className="text-[10px] text-emerald-300/80 font-medium truncate">Calcula vuelto</p>
                  </div>
                </button>

                {/* 4. TARJETA / POS */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod("Tarjeta")}
                  className={`relative p-3 rounded-2xl border transition-all flex items-center gap-3 text-left cursor-pointer group ${
                    selectedMethod === "Tarjeta"
                      ? "bg-blue-950/40 border-blue-500 text-white shadow-lg shadow-blue-500/15 ring-1 ring-blue-500/50"
                      : "bg-stone-950/70 border-stone-800 text-stone-300 hover:border-stone-700 hover:bg-stone-900"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                    <CreditCard size={20} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black tracking-tight text-white">Tarjeta</h4>
                    <p className="text-[10px] text-blue-300/80 font-medium truncate">POS Izipay / Niubiz</p>
                  </div>
                </button>

                {/* 5. MIXTO */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod("Mixto")}
                  className={`relative p-3 rounded-2xl border transition-all flex items-center gap-3 text-left cursor-pointer group sm:col-span-2 ${
                    selectedMethod === "Mixto"
                      ? "bg-amber-950/40 border-amber-500 text-white shadow-lg shadow-amber-500/15 ring-1 ring-amber-500/50"
                      : "bg-stone-950/70 border-stone-800 text-stone-300 hover:border-stone-700 hover:bg-stone-900"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                    <Coins size={20} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black tracking-tight text-white">Pago Mixto</h4>
                    <p className="text-[10px] text-amber-300/80 font-medium truncate">Parte Efectivo + Digital</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Inputs complementarios según método */}
            {selectedMethod === "Efectivo" && (
              <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-300">
                    Monto Recibido en Efectivo:
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-mono text-xs">
                      S/
                    </span>
                    <input
                      type="number"
                      step="0.50"
                      min="0"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      placeholder="0.00"
                      className="w-32 pl-8 pr-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-white font-mono text-sm font-bold text-right focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Botones rápidos de denominación */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-stone-400 mr-1">Rápido:</span>
                  <button
                    type="button"
                    onClick={() => handleQuickCash(total)}
                    className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold cursor-pointer border border-stone-700"
                  >
                    Exacto
                  </button>
                  {[10, 20, 50, 100, 200]
                    .filter((bill) => bill >= total || bill === 10)
                    .slice(0, 4)
                    .map((bill) => (
                      <button
                        key={bill}
                        type="button"
                        onClick={() => handleQuickCash(bill)}
                        className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-400 text-xs font-mono font-semibold cursor-pointer border border-stone-800 hover:border-stone-700"
                      >
                        S/{bill}
                      </button>
                    ))}
                </div>

                {/* Vuelto */}
                <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-400">Vuelto a entregar:</span>
                  <span
                    className={`text-base font-black font-mono ${
                      isCashInsufficient ? "text-rose-400" : "text-emerald-400"
                    }`}
                  >
                    {isCashInsufficient ? `Faltan S/ ${(total - cashNum).toFixed(2)}` : `S/ ${vuelto.toFixed(2)}`}
                  </span>
                </div>
              </div>
            )}

            {/* PAGO MIXTO: SELECCIÓN DE 2 MÉTODOS Y MONTOS */}
            {selectedMethod === "Mixto" && (
              <div className="p-4 rounded-2xl bg-stone-950 border border-amber-500/30 space-y-4 shadow-lg">
                <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                  <div className="flex items-center gap-2">
                    <Split size={16} className="text-amber-400" />
                    <span className="text-xs font-black text-white uppercase tracking-wider">
                      Dividir Cuenta en 2 Formas de Pago
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSplit5050}
                    className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                  >
                    50% / 50%
                  </button>
                </div>

                {/* Método 1 */}
                <div className="p-3 bg-stone-900/80 rounded-xl border border-stone-800 space-y-2">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wide block">
                    1º Método de Pago:
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(["Efectivo", "Yape", "Plin", "Tarjeta"] as SinglePaymentMethod[]).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setMixedMethod1(m);
                          if (m === "Efectivo") setMixedCashReceived(mixedAmount1);
                        }}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                          mixedMethod1 === m
                            ? "bg-amber-500 text-black border-amber-400 shadow-sm"
                            : "bg-stone-950 text-stone-400 border-stone-800 hover:text-white hover:border-stone-700"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-stone-400">Monto {mixedMethod1}:</span>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-500 font-mono text-xs">
                        S/
                      </span>
                      <input
                        type="number"
                        step="0.50"
                        min="0"
                        value={mixedAmount1}
                        onChange={(e) => handleMixedAmount1Change(e.target.value)}
                        className="w-28 pl-7 pr-2.5 py-1.5 bg-stone-950 border border-stone-700 rounded-lg text-white font-mono text-xs font-bold text-right focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Método 2 */}
                <div className="p-3 bg-stone-900/80 rounded-xl border border-stone-800 space-y-2">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wide block">
                    2º Método de Pago:
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(["Efectivo", "Yape", "Plin", "Tarjeta"] as SinglePaymentMethod[]).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setMixedMethod2(m);
                          if (m === "Efectivo") setMixedCashReceived(mixedAmount2);
                        }}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                          mixedMethod2 === m
                            ? "bg-amber-500 text-black border-amber-400 shadow-sm"
                            : "bg-stone-950 text-stone-400 border-stone-800 hover:text-white hover:border-stone-700"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-stone-400">Monto {mixedMethod2}:</span>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-500 font-mono text-xs">
                        S/
                      </span>
                      <input
                        type="number"
                        step="0.50"
                        min="0"
                        value={mixedAmount2}
                        onChange={(e) => handleMixedAmount2Change(e.target.value)}
                        className="w-28 pl-7 pr-2.5 py-1.5 bg-stone-950 border border-stone-700 rounded-lg text-white font-mono text-xs font-bold text-right focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Sub-cálculo de efectivo si alguno de los métodos es Efectivo */}
                {hasCashInMixed && (
                  <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400">
                        Efectivo Recibido para la parte en efectivo (S/ {mixedCashRequired.toFixed(2)}):
                      </span>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 font-mono text-xs">
                          S/
                        </span>
                        <input
                          type="number"
                          step="0.50"
                          min="0"
                          value={mixedCashReceived}
                          onChange={(e) => setMixedCashReceived(e.target.value)}
                          className="w-24 pl-7 pr-2.5 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-white font-mono text-xs font-bold text-right focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-1 border-t border-emerald-500/20">
                      <span className="text-stone-400">Vuelto a entregar:</span>
                      <span
                        className={`font-mono font-black ${
                          isMixedCashInsufficient ? "text-rose-400" : "text-emerald-400"
                        }`}
                      >
                        {isMixedCashInsufficient
                          ? `Falta S/ ${(mixedCashRequired - mixedCashGiven).toFixed(2)}`
                          : `S/ ${mixedCashVuelto.toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                )}

                {/* Barra de Validación de Cuadre */}
                <div
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                    isMixedMismatch
                      ? "bg-rose-950/30 border-rose-500/50 text-rose-300"
                      : "bg-emerald-950/30 border-emerald-500/50 text-emerald-300"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {isMixedMismatch ? (
                      <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                    ) : (
                      <CheckCircle2 size={15} className="text-emerald-400" />
                    )}
                    <span className="font-semibold">
                      {isMixedMismatch
                        ? mixedDifference > 0
                          ? `Falta cubrir: S/ ${mixedDifference.toFixed(2)}`
                          : `Excede por: S/ ${Math.abs(mixedDifference).toFixed(2)}`
                        : "Suma exacta: Cuenta cubierta al 100%"}
                    </span>
                  </div>
                  <span className="font-mono font-bold">
                    S/ {mixedSum.toFixed(2)} / S/ {total.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {(selectedMethod === "Yape" ||
              selectedMethod === "Plin" ||
              selectedMethod === "Tarjeta" ||
              selectedMethod === "Mixto") && (
              <div>
                <label className="block text-xs font-semibold text-stone-400 mb-1">
                  Código de Operación / Referencia (Opcional):
                </label>
                <input
                  type="text"
                  value={referenceCode}
                  onChange={(e) => setReferenceCode(e.target.value)}
                  placeholder="Ej: 948271 o últimos 4 dígitos"
                  className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-600 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            )}
          </div>

          {/* ---------------------------------------------------- */}
          {/* COLUMNA DERECHA (5 cols): SHOWCASE QR / DETALLES DE PAGO */}
          {/* ---------------------------------------------------- */}
          <div className="lg:col-span-5 flex flex-col">
            {selectedMethod === "Yape" || selectedMethod === "Plin" ? (
              /* PANEL DE QR DIGITAL (YAPE / PLIN) - SIN MARCA DE AGUA CENTRAL */
              <div className="flex-1 bg-gradient-to-b from-stone-950 via-stone-950 to-stone-900 border border-stone-800 rounded-3xl p-5 flex flex-col items-center justify-between text-center shadow-xl">
                {/* Cabecera del QR con logo oficial */}
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className={`w-8 h-8 rounded-xl p-1 flex items-center justify-center ${
                      selectedMethod === "Yape" ? "bg-[#742284]" : "bg-[#00D0B7]"
                    }`}
                  >
                    <Image
                      src={selectedMethod === "Yape" ? "/icono-yape.png" : "/icono-plin.png"}
                      alt={selectedMethod}
                      width={28}
                      height={28}
                      className="object-contain"
                    />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xs font-black text-white leading-tight">
                      Pagar con {selectedMethod}
                    </h3>
                    <p className="text-[10px] text-stone-400">Escaneo nítido sin marcas</p>
                  </div>
                </div>

                {/* Contenedor del QR en marco blanco de alto contraste (Limpio para escaneo) */}
                <div className="relative p-3.5 bg-white rounded-2xl shadow-2xl border-4 border-stone-800/80 group">
                  <div className="relative w-48 h-48 sm:w-52 sm:h-52">
                    <Image
                      src={yapeConfig.qr_url || "/uploads/1785226696144-hs71nv.png"}
                      alt={`Código QR ${selectedMethod}`}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                </div>

                {/* Titular e instrucciones */}
                <div className="mt-3 space-y-1">
                  <p className="text-xs font-bold text-white tracking-wide">
                    Titular: <span className="text-amber-400 font-extrabold">{yapeConfig.name}</span>
                  </p>
                  <p className="text-[11px] text-stone-400 leading-snug max-w-xs">
                    1. Abre tu app {selectedMethod} • 2. Escanea el código QR • 3. Monto exacto:
                  </p>
                  <div className="inline-block px-3 py-1 bg-stone-900 border border-stone-800 rounded-full text-amber-400 font-mono font-black text-sm mt-1">
                    S/ {total.toFixed(2)}
                  </div>
                </div>
              </div>
            ) : selectedMethod === "Mixto" ? (
              /* PANEL DE PAGO MIXTO CON QR Y DESGLOSE */
              <div className="flex-1 bg-stone-950 border border-stone-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                      <Coins size={18} />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-white">Resumen de Pago Dividido</h3>
                      <p className="text-[10px] text-stone-400">2 métodos combinados</p>
                    </div>
                  </div>

                  {/* Tarjetas de Desglose */}
                  <div className="space-y-2 mb-4">
                    <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {mixedMethod1 === "Yape" && (
                          <div className="w-6 h-6 rounded-lg bg-[#742284] p-0.5 flex items-center justify-center">
                            <Image src="/icono-yape.png" alt="Yape" width={20} height={20} className="object-contain" />
                          </div>
                        )}
                        {mixedMethod1 === "Plin" && (
                          <div className="w-6 h-6 rounded-lg bg-[#00D0B7] p-0.5 flex items-center justify-center">
                            <Image src="/icono-plin.png" alt="Plin" width={20} height={20} className="object-contain" />
                          </div>
                        )}
                        {mixedMethod1 === "Efectivo" && <Banknote size={18} className="text-emerald-400" />}
                        {mixedMethod1 === "Tarjeta" && <CreditCard size={18} className="text-blue-400" />}
                        <span className="text-xs font-bold text-white">{mixedMethod1}</span>
                      </div>
                      <span className="text-sm font-black font-mono text-amber-400">
                        S/ {mixedNum1.toFixed(2)}
                      </span>
                    </div>

                    <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {mixedMethod2 === "Yape" && (
                          <div className="w-6 h-6 rounded-lg bg-[#742284] p-0.5 flex items-center justify-center">
                            <Image src="/icono-yape.png" alt="Yape" width={20} height={20} className="object-contain" />
                          </div>
                        )}
                        {mixedMethod2 === "Plin" && (
                          <div className="w-6 h-6 rounded-lg bg-[#00D0B7] p-0.5 flex items-center justify-center">
                            <Image src="/icono-plin.png" alt="Plin" width={20} height={20} className="object-contain" />
                          </div>
                        )}
                        {mixedMethod2 === "Efectivo" && <Banknote size={18} className="text-emerald-400" />}
                        {mixedMethod2 === "Tarjeta" && <CreditCard size={18} className="text-blue-400" />}
                        <span className="text-xs font-bold text-white">{mixedMethod2}</span>
                      </div>
                      <span className="text-sm font-black font-mono text-amber-400">
                        S/ {mixedNum2.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Si alguno es digital QR (Yape o Plin), mostramos el código QR limpio */}
                {mixedMethod1 === "Yape" || mixedMethod1 === "Plin" || mixedMethod2 === "Yape" || mixedMethod2 === "Plin" ? (
                  <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3 flex flex-col items-center text-center">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-2">
                      Código QR para parte digital (
                      {mixedMethod1 === "Yape" || mixedMethod1 === "Plin" ? mixedMethod1 : mixedMethod2}: S/{" "}
                      {(mixedMethod1 === "Yape" || mixedMethod1 === "Plin" ? mixedNum1 : mixedNum2).toFixed(2)}
                      )
                    </span>
                    <div className="p-2 bg-white rounded-xl shadow-lg border-2 border-stone-700">
                      <div className="relative w-36 h-36">
                        <Image
                          src={yapeConfig.qr_url || "/uploads/1785226696144-hs71nv.png"}
                          alt="QR Digital"
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    </div>
                    <span className="text-[10px] text-stone-400 mt-1">Titular: {yapeConfig.name}</span>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 text-center space-y-1">
                    <span className="text-xs font-bold text-stone-300">Total de la Transacción:</span>
                    <span className="text-2xl font-black font-mono text-emerald-400 block">
                      S/ {total.toFixed(2)}
                    </span>
                    <p className="text-[10px] text-stone-500">Cobro dividido validado</p>
                  </div>
                )}
              </div>
            ) : selectedMethod === "Efectivo" ? (
              /* PANEL RESUMEN DE EFECTIVO */
              <div className="flex-1 bg-stone-950 border border-stone-800 rounded-3xl p-5 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                  <Banknote size={32} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Cobro en Efectivo</h3>
                  <p className="text-xs text-stone-400 mt-1 max-w-xs">
                    Verifica el efectivo recibido e introduce el importe para el cálculo automático de cambio.
                  </p>
                </div>

                <div className="w-full bg-stone-900/90 border border-stone-800 rounded-2xl p-4 space-y-2 text-left">
                  <div className="flex justify-between text-xs text-stone-400">
                    <span>Total de la Cuenta:</span>
                    <span className="font-mono text-white font-bold">S/ {total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-stone-400">
                    <span>Efectivo Recibido:</span>
                    <span className="font-mono text-white font-bold">S/ {cashNum.toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t border-stone-800 flex justify-between items-baseline">
                    <span className="text-xs font-bold text-stone-300">Vuelto:</span>
                    <span className="text-xl font-black font-mono text-emerald-400">
                      S/ {vuelto.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* PANEL DE TARJETA / OTROS */
              <div className="flex-1 bg-stone-950 border border-stone-800 rounded-3xl p-5 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/25 text-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/10">
                  <CreditCard size={32} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Terminal POS Externo</h3>
                  <p className="text-xs text-stone-400 mt-1 max-w-xs">
                    Procesa el cobro en el POS inalámbrico (Visa, Mastercard, Diners) y confirma la transacción.
                  </p>
                </div>
                <div className="w-full bg-stone-900/90 border border-stone-800 rounded-2xl p-4 text-center">
                  <span className="text-[11px] text-stone-400 block uppercase">Monto a cobrar en POS</span>
                  <span className="text-2xl font-black text-amber-400 font-mono mt-0.5 block">
                    S/ {total.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* FOOTER DEL MODAL */}
        {/* ======================================================== */}
        <div className="px-6 py-4 border-t border-stone-800/80 bg-stone-950/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
            <span>Transacción registrada bajo auditoría y sincronización POS</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none py-3 px-5 rounded-xl border border-stone-700 hover:bg-stone-800 text-stone-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                (selectedMethod === "Efectivo" && isCashInsufficient) ||
                (selectedMethod === "Mixto" && (isMixedMismatch || isMixedCashInsufficient))
              }
              className="flex-1 sm:flex-none py-3 px-6 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 text-white font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 active:scale-[0.99] transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Procesando Venta...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Confirmar y Finalizar Cobro</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
