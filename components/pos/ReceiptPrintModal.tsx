"use client";

import React, { useRef } from 'react';
import Image from 'next/image';
import { X, Printer, CheckCircle, ShieldCheck, Download, Share2, Copy } from 'lucide-react';
import type { IssuedInvoice } from '@/lib/services/billing.service';

interface ReceiptPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: IssuedInvoice | null;
}

export default function ReceiptPrintModal({ isOpen, onClose, invoice }: ReceiptPrintModalProps) {
  const ticketRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    invoice.qrString
  )}`;

  const isElectronic = invoice.docType === 'BOLETA' || invoice.docType === 'FACTURA';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div
        className="relative bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-md shadow-2xl flex flex-col my-auto max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 bg-stone-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Comprobante Emitido</span>
                {invoice.isMock && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Modo Simulador
                  </span>
                )}
              </h3>
              <p className="text-xs text-stone-400">{invoice.formattedNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenedor del Ticket Térmico con Scroll */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 bg-stone-950/40">
          {/* TICKET IMPRIMIBLE (80mm) */}
          <div
            ref={ticketRef}
            id="printable-ticket"
            className="bg-white text-black p-5 rounded-xl shadow-lg font-mono text-xs max-w-sm mx-auto select-text border border-stone-200"
          >
            {/* Header del Restaurante */}
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-stone-400">
              <div className="flex justify-center mb-1">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white border border-stone-300">
                  <Image
                    src="/logokomi.png"
                    alt="Logo"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
              <h4 className="font-extrabold text-sm uppercase tracking-wide">{invoice.emisor.nombreComercial}</h4>
              <p className="text-[11px] font-bold text-stone-700">{invoice.emisor.razonSocial}</p>
              <p className="text-[10px] font-bold">RUC: {invoice.emisor.ruc}</p>
              <p className="text-[9px] text-stone-600 leading-tight">{invoice.emisor.direccion}</p>
            </div>

            {/* Datos del Comprobante */}
            <div className="py-2.5 border-b border-dashed border-stone-400 space-y-0.5 text-[11px]">
              <div className="text-center font-black text-sm my-1 uppercase">
                {invoice.docType === 'FACTURA'
                  ? 'FACTURA ELECTRÓNICA'
                  : invoice.docType === 'BOLETA'
                  ? 'BOLETA DE VENTA ELECTRÓNICA'
                  : 'NOTA DE VENTA'}
              </div>
              <p className="text-center font-extrabold tracking-wider">{invoice.formattedNumber}</p>
              <div className="flex justify-between pt-1">
                <span>Fecha: {invoice.fechaEmision}</span>
                <span>Hora: {invoice.horaEmision}</span>
              </div>
              <p>Moneda: SOLES (PEN)</p>
              <p>Forma de Pago: {invoice.paymentMethod.toUpperCase()}</p>
            </div>

            {/* Datos del Cliente */}
            <div className="py-2 border-b border-dashed border-stone-400 space-y-0.5 text-[10px]">
              <p className="font-bold">CLIENTE:</p>
              <p className="font-medium truncate">{invoice.cliente.denominacion || 'CLIENTE GENERAL'}</p>
              {invoice.cliente.numDoc && (
                <p>
                  {invoice.cliente.tipoDoc.toUpperCase()}: {invoice.cliente.numDoc}
                </p>
              )}
              {invoice.cliente.direccion && (
                <p className="truncate text-stone-600">Dir: {invoice.cliente.direccion}</p>
              )}
            </div>

            {/* Tabla de Productos */}
            <div className="py-2 border-b border-dashed border-stone-400">
              <div className="flex justify-between font-bold text-[10px] pb-1 border-b border-stone-300">
                <span>CANT / DESCRIPCIÓN</span>
                <span>TOTAL</span>
              </div>
              <div className="divide-y divide-stone-100 py-1 space-y-1">
                {invoice.items.map((item, idx) => (
                  <div key={idx} className="pt-1 text-[11px]">
                    <div className="flex justify-between font-semibold">
                      <span className="truncate pr-2">
                        {item.quantity} x {item.name}
                      </span>
                      <span className="font-mono shrink-0">S/ {item.lineTotal.toFixed(2)}</span>
                    </div>
                    <div className="text-[9px] text-stone-500">
                      P.U. S/ {item.priceWithTax.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totales y Desglose Tributario */}
            <div className="py-2.5 border-b border-dashed border-stone-400 space-y-1 text-xs">
              {isElectronic && (
                <>
                  <div className="flex justify-between text-stone-700">
                    <span>OP. GRAVADA (Base):</span>
                    <span>S/ {invoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-stone-700">
                    <span>I.G.V. (18%):</span>
                    <span>S/ {invoice.igv.toFixed(2)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between font-extrabold text-sm pt-1 border-t border-stone-300">
                <span>TOTAL A PAGAR:</span>
                <span className="text-base">S/ {invoice.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Importe en Letras */}
            <div className="py-1.5 text-[9px] text-center font-bold text-stone-700 border-b border-dashed border-stone-400">
              {invoice.amountInWords}
            </div>

            {/* Código QR Reglamentario SUNAT */}
            <div className="py-3 flex flex-col items-center justify-center space-y-1">
              <div className="bg-white p-1 rounded border border-stone-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrImageUrl}
                  alt="QR SUNAT"
                  className="w-28 h-28 object-contain"
                />
              </div>
              <p className="text-[8px] text-center text-stone-500 max-w-[200px] break-all pt-0.5">
                Hash: {invoice.hash}
              </p>
              {isElectronic && (
                <p className="text-[9px] font-bold text-center text-emerald-800 flex items-center gap-1 justify-center">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Representación Impresa de la Boleta/Factura Electrónica
                </p>
              )}
              <p className="text-[9px] text-center text-stone-500">
                ¡Gracias por su preferencia!
              </p>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="p-4 border-t border-stone-800 bg-stone-950/80 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-xl transition-colors"
          >
            Cerrar
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 rounded-xl shadow-lg shadow-orange-600/30 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Ticket (80mm)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
