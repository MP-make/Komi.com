"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Image from "next/image";
import { 
  Search, 
  Loader2, 
  Plus, 
  Pencil, 
  Trash2, 
  Upload, 
  Star, 
  Package, 
  Globe, 
  Folder, 
  FileSpreadsheet, 
  FileDown, 
  UploadCloud, 
  X, 
  AlertCircle, 
  ChevronRight, 
  LayoutGrid, 
  List, 
  CheckCircle2
} from "lucide-react";
import { createProduct, updateProduct, deleteProduct } from "@/lib/api/products";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductItem {
  id?: string;
  ventify_id: string;
  sku: string;
  title: string;
  price: number;
  cost_price?: number;
  suggested_price?: number;
  stock?: number;
  barcode?: string;
  barcode_extras?: string[];
  supplier?: string;
  presentations?: { name: string; quantity: number; price: number }[];
  volume_pricing?: { min_qty: number; price: number }[];
  image: string;
  description?: string;
  original_category?: string;
  category_id: string | null;
  category_name?: string | null;
  display_order: number;
  menu_types: string[];
  is_active: boolean;
  is_featured: boolean;
}

const DEFAULT_IMAGE_PLACEHOLDER = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80";

export default function AdminProducts() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  
  // Filtros y Vista
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "landing">("general");
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Expandir escalas en modal
  const [showScales, setShowScales] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    title: "",
    sku: "",
    barcode: "",
    barcodeInput: "",
    barcode_extras: [] as string[],
    suggested_price: "",
    cost_price: "",
    price: "",
    stock: "25",
    category_id: "",
    supplier: "General",
    image: DEFAULT_IMAGE_PLACEHOLDER,
    description: "",
    menu_types: ["criollo", "rapida"],
    is_active: true,
    is_featured: false,
    volumeMinQty: "",
    volumePrice: "",
    volume_pricing: [] as { min_qty: number; price: number }[],
    presName: "",
    presQty: "",
    presPrice: "",
    presentations: [] as { name: string; quantity: number; price: number }[],
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/product-mappings");
      const json = await res.json();
      setProducts(json.products || []);
      setCategories(json.categories || []);
    } catch (e) {
      console.error("Error fetching products:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Cálculos para la barra de estadísticas
  const stats = useMemo(() => {
    const total = products.length;
    const activos = products.filter((p) => p.is_active).length;
    const totalPrice = products.reduce((acc, p) => acc + (p.price || 0), 0);
    const avg = total > 0 ? (totalPrice / total).toFixed(2) : "0.00";
    const totalCategories = categories.length;
    return { total, activos, avg, totalCategories };
  }, [products, categories]);

  // Abrir Modal para Crear
  function handleOpenCreate() {
    setEditingProduct(null);
    setActiveTab("general");
    setShowScales(false);
    setFormData({
      title: "",
      sku: `SKU-${Math.floor(100 + Math.random() * 900)}`,
      barcode: "",
      barcodeInput: "",
      barcode_extras: [],
      suggested_price: "",
      cost_price: "",
      price: "",
      stock: "25",
      category_id: categories.length > 0 ? categories[0].id : "",
      supplier: "General",
      image: DEFAULT_IMAGE_PLACEHOLDER,
      description: "",
      menu_types: ["criollo", "rapida"],
      is_active: true,
      is_featured: false,
      volumeMinQty: "",
      volumePrice: "",
      volume_pricing: [],
      presName: "",
      presQty: "",
      presPrice: "",
      presentations: [],
    });
    setFormError("");
    setModalOpen(true);
  }

  // Abrir Modal para Editar
  function handleOpenEdit(product: ProductItem) {
    setEditingProduct(product);
    setActiveTab("general");
    setShowScales(false);
    setFormData({
      title: product.title || "",
      sku: product.sku || "",
      barcode: product.barcode || "",
      barcodeInput: "",
      barcode_extras: product.barcode_extras || [],
      suggested_price: product.suggested_price ? product.suggested_price.toString() : "",
      cost_price: product.cost_price ? product.cost_price.toString() : "",
      price: product.price ? product.price.toString() : "0.00",
      stock: (product.stock !== undefined ? product.stock : 25).toString(),
      category_id: product.category_id || "",
      supplier: product.supplier || "General",
      image: product.image || DEFAULT_IMAGE_PLACEHOLDER,
      description: product.description || "",
      menu_types: product.menu_types || ["criollo", "rapida"],
      is_active: product.is_active,
      is_featured: product.is_featured,
      volumeMinQty: "",
      volumePrice: "",
      volume_pricing: product.volume_pricing || [],
      presName: "",
      presQty: "",
      presPrice: "",
      presentations: product.presentations || [],
    });
    setFormError("");
    setModalOpen(true);
  }

  // Carga de imagen local en Base64
  function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen no debe superar los 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target?.result as string;
      setFormData((prev) => ({ ...prev, image: base64 }));
    };
    reader.readAsDataURL(file);
  }

  // Guardar Producto (Crear o Actualizar)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!formData.title.trim()) {
      setFormError("El nombre del producto es obligatorio.");
      return;
    }

    const numPrice = parseFloat(formData.price || formData.suggested_price || "0");
    if (isNaN(numPrice) || numPrice < 0) {
      setFormError("Ingresa un precio de venta válido.");
      return;
    }

    const numCost = parseFloat(formData.cost_price || "0");
    const numSuggested = parseFloat(formData.suggested_price || formData.price || "0");
    const numStock = parseInt(formData.stock || "0", 10);

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        sku: formData.sku.trim(),
        barcode: formData.barcode.trim(),
        barcode_extras: formData.barcode_extras,
        price: numPrice,
        cost_price: numCost,
        suggested_price: numSuggested,
        stock: isNaN(numStock) ? 0 : numStock,
        category_id: formData.category_id || null,
        supplier: formData.supplier,
        image: formData.image.trim() || DEFAULT_IMAGE_PLACEHOLDER,
        description: formData.description.trim(),
        menu_types: formData.menu_types,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        volume_pricing: formData.volume_pricing,
        presentations: formData.presentations,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.ventify_id, payload);
      } else {
        await createProduct(payload as any);
      }

      setModalOpen(false);
      await fetchData();
    } catch (err: any) {
      setFormError(err.message || "Error al guardar el producto");
    } finally {
      setSubmitting(false);
    }
  }

  // Eliminar producto
  async function handleDelete(product: ProductItem) {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar "${product.title}"?`)) {
      return;
    }

    setSavingId(product.ventify_id);
    try {
      await deleteProduct(product.ventify_id);
      await fetchData();
    } catch (err: any) {
      alert(err.message || "Error al eliminar producto");
    } finally {
      setSavingId(null);
    }
  }

  // Exportar Excel (CSV)
  function handleExportExcel() {
    const headers = ["ID", "SKU", "Nombre", "Precio", "Stock", "Categoría", "Estado"];
    const rows = products.map((p) => [
      p.ventify_id,
      p.sku,
      `"${p.title.replace(/"/g, '""')}"`,
      p.price.toFixed(2),
      p.stock ?? 25,
      `"${(p.category_name || "Sin categoría").replace(/"/g, '""')}"`,
      p.is_active ? "Activo" : "Inactivo",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `catalogo_productos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Descargar PDF
  function handleDownloadPDF() {
    window.print();
  }

  // Filtrado reactivo
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = search
        ? p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.sku.toLowerCase().includes(search.toLowerCase()) ||
          (p.barcode && p.barcode.toLowerCase().includes(search.toLowerCase())) ||
          (p.category_name && p.category_name.toLowerCase().includes(search.toLowerCase()))
        : true;

      const matchCat = filterCategory === "all" || p.category_id === filterCategory;

      const matchStatus =
        filterStatus === "all"
          ? true
          : filterStatus === "active"
          ? p.is_active
          : !p.is_active;

      return matchSearch && matchCat && matchStatus;
    });
  }, [products, search, filterCategory, filterStatus]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-stone-400">
        <Loader2 className="w-9 h-9 text-amber-500 animate-spin mb-3" />
        <p className="text-sm font-medium">Cargando catálogo de productos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header con Título y Botones de Acción */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Productos
          </h1>
          <p className="text-stone-400 text-sm mt-0.5">
            Gestiona tu catálogo de productos y precios
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 text-xs sm:text-sm font-medium transition-colors shadow-sm cursor-pointer"
          >
            <FileDown size={15} />
            <span>Descargar PDF</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 text-xs sm:text-sm font-medium transition-colors shadow-sm cursor-pointer"
          >
            <FileSpreadsheet size={15} />
            <span>Exportar Excel</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 text-xs sm:text-sm font-medium transition-colors shadow-sm cursor-pointer"
          >
            <UploadCloud size={15} />
            <span>Importar Excel</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black text-xs sm:text-sm font-bold shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus size={16} />
            <span>Agregar Producto</span>
          </button>
        </div>
      </div>

      {/* 2. Barra Superior de Estadísticas (Estilo Oscuro) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL */}
        <div className="bg-stone-900/90 rounded-2xl p-4 sm:p-5 border border-stone-800 shadow-md flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">TOTAL</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {stats.total}{" "}
              <span className="text-xs font-normal text-stone-500">/ ∞</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <Package size={22} />
          </div>
        </div>

        {/* ACTIVOS */}
        <div className="bg-stone-900/90 rounded-2xl p-4 sm:p-5 border border-stone-800 shadow-md flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">ACTIVOS</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1">
              {stats.activos}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Package size={22} />
          </div>
        </div>

        {/* PROMEDIO */}
        <div className="bg-stone-900/90 rounded-2xl p-4 sm:p-5 border border-stone-800 shadow-md flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">PROMEDIO</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-400 mt-1">
              S/{stats.avg}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
            S/
          </div>
        </div>

        {/* CATEGORÍAS */}
        <div className="bg-stone-900/90 rounded-2xl p-4 sm:p-5 border border-stone-800 shadow-md flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">CATEGORÍAS</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-sky-400 mt-1">
              {stats.totalCategories}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
            <Folder size={22} />
          </div>
        </div>
      </div>

      {/* 3. Buscador y Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Input Buscador */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar productos por nombre, SKU o descripción..."
            className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-sm shadow-sm"
          />
        </div>

        {/* Filtro Categorías */}
        <div className="relative">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 shadow-sm cursor-pointer"
          >
            <option value="all">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro Estado */}
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 shadow-sm cursor-pointer"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>

        {/* Toggle Vista Grid / Tabla */}
        <div className="flex items-center bg-stone-900 border border-stone-800 rounded-xl p-1 shadow-sm shrink-0">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === "grid" ? "bg-amber-500 text-black font-bold" : "text-stone-400 hover:text-white"
            }`}
            title="Vista de cuadrícula"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === "table" ? "bg-amber-500 text-black font-bold" : "text-stone-400 hover:text-white"
            }`}
            title="Vista de tabla"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* 4. Grid de Tarjetas de Productos (Estilo Oscuro Urbano) */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full bg-stone-900/60 border border-stone-800 rounded-2xl p-12 text-center text-stone-500 shadow-sm">
              <Package className="w-12 h-12 mx-auto mb-3 text-stone-600" />
              <p className="text-base font-bold text-stone-300">No se encontraron productos</p>
              <p className="text-xs text-stone-500 mt-1">
                Haz clic en &quot;+ Agregar Producto&quot; para crear tu primer plato.
              </p>
            </div>
          ) : (
            filteredProducts.map((p) => {
              const stockVal = p.stock !== undefined ? p.stock : 25;
              const isStockLow = stockVal <= 0;

              return (
                <div
                  key={p.ventify_id}
                  className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-lg hover:border-stone-700 hover:shadow-2xl transition-all duration-200 flex flex-col justify-between group"
                >
                  {/* Imagen Superior */}
                  <div className="relative w-full aspect-[4/3] bg-stone-950 overflow-hidden">
                    <Image
                      src={p.image || DEFAULT_IMAGE_PLACEHOLDER}
                      alt={p.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                    {p.is_featured && (
                      <span className="absolute top-2.5 left-2.5 bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-md shadow flex items-center gap-1">
                        <Star size={10} className="fill-black" />
                        Destacado
                      </span>
                    )}
                    {!p.is_active && (
                      <span className="absolute top-2.5 right-2.5 bg-stone-950/90 text-stone-400 text-[10px] font-bold px-2 py-0.5 rounded-md border border-stone-800">
                        Inactivo
                      </span>
                    )}
                  </div>

                  {/* Cuerpo de la Tarjeta */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-white text-base leading-snug line-clamp-1 group-hover:text-amber-400 transition-colors">
                        {p.title}
                      </h3>
                      <div className="text-xs text-stone-400 mt-1 space-y-0.5">
                        <p>{p.category_name || "Sin categoría"}</p>
                        <p className="text-[11px] font-mono text-stone-500">SKU: {p.sku || "N/A"}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-800/80">
                      <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                        PRECIO DE VENTA
                      </p>
                      <p className="text-2xl font-black text-amber-400 tracking-tight mt-0.5 font-mono">
                        S/{p.price.toFixed(2)}
                      </p>

                      <div className="flex items-center justify-between text-xs text-stone-400 mt-3">
                        <span>Total:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white font-mono">{stockVal}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              isStockLow
                                ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                                : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            }`}
                          >
                            {isStockLow ? "Bajo" : "OK"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botones Inferiores: Editar y Eliminar */}
                  <div className="p-3 bg-stone-950/60 border-t border-stone-800/80 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(p)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-stone-700 bg-stone-800/80 hover:bg-stone-700 text-stone-200 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                    >
                      <Pencil size={13} />
                      <span>Editar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(p)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Vista de Tabla Alternativa en Oscuro */
        <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-950/80 border-b border-stone-800 text-stone-400 text-xs uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3.5 text-left">Foto</th>
                  <th className="px-4 py-3.5 text-left">Producto</th>
                  <th className="px-4 py-3.5 text-left">Precio Venta</th>
                  <th className="px-4 py-3.5 text-left">Stock</th>
                  <th className="px-4 py-3.5 text-left">Categoría</th>
                  <th className="px-4 py-3.5 text-center">Estado</th>
                  <th className="px-4 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {filteredProducts.map((p) => (
                  <tr key={p.ventify_id} className="hover:bg-stone-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-stone-800 relative">
                        <Image src={p.image} alt={p.title} fill className="object-cover" unoptimized />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-white text-sm">{p.title}</p>
                      <p className="text-xs text-stone-500 font-mono">SKU: {p.sku}</p>
                    </td>
                    <td className="px-4 py-3 font-bold text-amber-400 text-sm font-mono">
                      S/{p.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-stone-300 font-semibold font-mono">
                      {p.stock ?? 25}
                    </td>
                    <td className="px-4 py-3 text-stone-400 text-xs">
                      {p.category_name || "Sin categoría"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        p.is_active ? "bg-emerald-500/15 text-emerald-400" : "bg-stone-800 text-stone-500"
                      }`}>
                        {p.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-1.5">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 rounded-lg border border-stone-700 text-stone-300 hover:bg-stone-800"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400 hover:bg-rose-500/25"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. MODAL AGREGAR / EDITAR PRODUCTO (Tema Oscuro Elegante) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-stone-900 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-stone-800">
            {/* Cabecera del Modal */}
            <div className="px-6 py-4.5 border-b border-stone-800 flex items-center justify-between bg-stone-950">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  {editingProduct ? "Editar Producto" : "Agregar Nuevo Producto"}
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  {editingProduct
                    ? "Edita los detalles de tu producto."
                    : "Completa el formulario para añadir un nuevo producto."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Pestañas: General / Landing & E-commerce */}
            <div className="px-6 pt-3 pb-1 border-b border-stone-800 flex gap-2 bg-stone-950/60">
              <button
                type="button"
                onClick={() => setActiveTab("general")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === "general"
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                    : "text-stone-400 hover:text-white hover:bg-stone-800/60"
                }`}
              >
                <Package size={15} />
                <span>General</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("landing")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === "landing"
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                    : "text-stone-400 hover:text-white hover:bg-stone-800/60"
                }`}
              >
                <Globe size={15} />
                <span>Landing / E-commerce</span>
              </button>
            </div>

            {/* Formulario con Scroll */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
              {formError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {activeTab === "general" ? (
                <>
                  {/* Galería de Imágenes */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-stone-200">
                        Galería de Imágenes
                      </label>
                      <span className="text-[11px] text-stone-500">
                        {formData.image ? "1 / 6 Imágenes" : "0 / 6 Imágenes"}
                      </span>
                    </div>

                    <div className="flex gap-3 items-center flex-wrap">
                      {/* Cuadro de Imagen Existente */}
                      {formData.image && (
                        <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-amber-500 shadow-sm group">
                          <img
                            src={formData.image}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-1.5 left-1.5 bg-amber-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                            ★ Principal
                          </span>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, image: "" })}
                            className="absolute top-1.5 right-1.5 bg-rose-600 text-white p-1 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Quitar imagen"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      )}

                      {/* Botón Agregar Imagen */}
                      <label className="w-28 h-28 rounded-2xl border-2 border-dashed border-stone-700 hover:border-amber-500 bg-stone-950/80 hover:bg-stone-950 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all">
                        <Upload size={18} className="text-amber-400" />
                        <span className="text-xs font-bold text-amber-400">Agregar Imagen</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageFileChange}
                        />
                      </label>
                    </div>

                    {/* URL de imagen alternativa */}
                    <div className="pt-1">
                      <input
                        type="url"
                        placeholder="O pega una URL de imagen: https://..."
                        value={formData.image.startsWith("data:") ? "" : formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-stone-950 border border-stone-800 rounded-xl text-stone-200 placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    <div className="text-[11px] text-stone-500 space-y-0.5 pt-1">
                      <p>• Arrastra las imágenes para reordenarlas</p>
                      <p>• Haz clic en la estrella para marcar como imagen principal</p>
                      <p>• Formatos: JPEG, PNG, WebP (máx. 5MB por imagen)</p>
                    </div>
                  </div>

                  {/* Nombre */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-200">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Agua Cielo 2.5 lt"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    />
                  </div>

                  {/* SKU */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-200">
                      SKU
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Bebidas-008"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-mono"
                    />
                  </div>

                  {/* Código de barras */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-200">
                      Código de barras
                    </label>
                    <input
                      type="text"
                      placeholder="Opcional"
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-mono"
                    />
                  </div>

                  {/* Códigos de barras adicionales */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-200">
                      Códigos de barras adicionales
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ej: 77501234, 77501235 (separados por coma o espacio)"
                        value={formData.barcodeInput}
                        onChange={(e) => setFormData({ ...formData, barcodeInput: e.target.value })}
                        className="flex-1 px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!formData.barcodeInput.trim()) return;
                          const codes = formData.barcodeInput
                            .split(/[,\s]+/)
                            .filter(Boolean);
                          setFormData({
                            ...formData,
                            barcode_extras: [...formData.barcode_extras, ...codes],
                            barcodeInput: "",
                          });
                        }}
                        className="px-4 py-2.5 rounded-xl border border-stone-700 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Agregar
                      </button>
                    </div>
                    {formData.barcode_extras.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap pt-1">
                        {formData.barcode_extras.map((c, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 bg-stone-800 text-stone-300 text-[11px] font-mono px-2 py-0.5 rounded-md border border-stone-700"
                          >
                            {c}
                            <button
                              type="button"
                              onClick={() => {
                                const next = formData.barcode_extras.filter((_, idx) => idx !== i);
                                setFormData({ ...formData, barcode_extras: next });
                              }}
                              className="text-stone-500 hover:text-rose-400"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-[11px] text-stone-500">
                      Permite escanear códigos de distintos proveedores o internos.
                    </p>
                  </div>

                  {/* P. Sugerido & P. Costo */}
                  <div className="space-y-1.5 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-200">
                          P. Sugerido
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.suggested_price}
                          onChange={(e) => setFormData({ ...formData, suggested_price: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-200">
                          P. Costo
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.cost_price}
                          onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-mono"
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-stone-500">
                      Estos son los precios base del producto. Si los completas, puedes dejar vacíos los precios de cada sucursal: usarán automáticamente estos valores.
                    </p>
                  </div>

                  {/* Precios por sucursal */}
                  <div className="space-y-2.5 pt-2">
                    <div>
                      <h4 className="text-xs font-bold text-stone-200">Precios por sucursal</h4>
                      <p className="text-[11px] text-stone-500">
                        Configura un precio distinto para sucursales específicas. Las sucursales sin precio usan el precio base de este producto.
                      </p>
                    </div>

                    <div className="border border-stone-800 rounded-2xl p-4 bg-stone-950/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold uppercase text-amber-400">
                          ¡QUÉ BRAVAZO!
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-stone-400">Precio</label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="S/ 0.00"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-amber-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-mono font-bold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-stone-400">Costo</label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="S/ 0.00"
                            value={formData.cost_price}
                            onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                            className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-stone-400">Stock</label>
                          <input
                            type="number"
                            placeholder="0"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-mono"
                          />
                        </div>
                      </div>

                      {/* Escalas y presentaciones toggle */}
                      <div>
                        <button
                          type="button"
                          onClick={() => setShowScales(!showScales)}
                          className="text-xs font-semibold text-stone-400 hover:text-amber-400 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <ChevronRight
                            size={14}
                            className={`transition-transform ${showScales ? "rotate-90 text-amber-400" : ""}`}
                          />
                          <span>Escalas y presentaciones</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Categoría */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-200">
                      Categoría
                    </label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 cursor-pointer"
                    >
                      <option value="">Seleccionar categoría</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Proveedor */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-200">
                      Proveedor
                    </label>
                    <select
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 cursor-pointer"
                    >
                      <option value="General">Seleccionar proveedor</option>
                      <option value="Distribuidora San Jorge">Distribuidora San Jorge</option>
                      <option value="Avícola El Corral">Avícola El Corral</option>
                      <option value="Backus Cervecería">Backus Cervecería</option>
                      <option value="Ajeper Bebidas">Ajeper Bebidas</option>
                    </select>
                  </div>

                  {/* Precio por volumen */}
                  {showScales && (
                    <div className="border border-stone-800 rounded-2xl p-4 bg-stone-950/60 space-y-3">
                      <div>
                        <h4 className="text-xs font-bold text-stone-200">Precio por volumen (escala base)</h4>
                        <p className="text-[11px] text-stone-500">
                          Se aplica en las sucursales que no tengan su propia escala.
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Cant. mín."
                          value={formData.volumeMinQty}
                          onChange={(e) => setFormData({ ...formData, volumeMinQty: e.target.value })}
                          className="w-32 px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs font-mono text-white"
                        />
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Precio c/u"
                          value={formData.volumePrice}
                          onChange={(e) => setFormData({ ...formData, volumePrice: e.target.value })}
                          className="flex-1 px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs font-mono text-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const qty = parseInt(formData.volumeMinQty);
                            const pr = parseFloat(formData.volumePrice);
                            if (isNaN(qty) || isNaN(pr)) return;
                            setFormData({
                              ...formData,
                              volume_pricing: [...formData.volume_pricing, { min_qty: qty, price: pr }],
                              volumeMinQty: "",
                              volumePrice: "",
                            });
                          }}
                          className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold"
                        >
                          Agregar
                        </button>
                      </div>

                      {formData.volume_pricing.length > 0 && (
                        <div className="space-y-1">
                          {formData.volume_pricing.map((v, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs bg-stone-900 p-2 rounded-lg border border-stone-800 text-stone-300">
                              <span>A partir de {v.min_qty} unids: <strong className="text-amber-400">S/{v.price.toFixed(2)}</strong> c/u</span>
                              <button
                                type="button"
                                onClick={() => setFormData({ ...formData, volume_pricing: formData.volume_pricing.filter((_, i) => i !== idx) })}
                                className="text-rose-400 font-bold"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Presentaciones de venta */}
                  {showScales && (
                    <div className="border border-stone-800 rounded-2xl p-4 bg-stone-950/60 space-y-3">
                      <div>
                        <h4 className="text-xs font-bold text-stone-200">Presentaciones de venta</h4>
                        <p className="text-[11px] text-stone-500">
                          El cajero elige la presentación al vender. Una &quot;Caja x20&quot; cobra su precio y descuenta 20 unidades.
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Nombre (ej: Caja x20)"
                          value={formData.presName}
                          onChange={(e) => setFormData({ ...formData, presName: e.target.value })}
                          className="flex-1 px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-white"
                        />
                        <input
                          type="number"
                          placeholder="Cant. unid."
                          value={formData.presQty}
                          onChange={(e) => setFormData({ ...formData, presQty: e.target.value })}
                          className="w-24 px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs font-mono text-white"
                        />
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Precio"
                          value={formData.presPrice}
                          onChange={(e) => setFormData({ ...formData, presPrice: e.target.value })}
                          className="w-24 px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs font-mono text-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const qty = parseInt(formData.presQty);
                            const pr = parseFloat(formData.presPrice);
                            if (!formData.presName.trim() || isNaN(qty) || isNaN(pr)) return;
                            setFormData({
                              ...formData,
                              presentations: [...formData.presentations, { name: formData.presName.trim(), quantity: qty, price: pr }],
                              presName: "",
                              presQty: "",
                              presPrice: "",
                            });
                          }}
                          className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold"
                        >
                          Agregar
                        </button>
                      </div>

                      {formData.presentations.length > 0 && (
                        <div className="space-y-1">
                          {formData.presentations.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs bg-stone-900 p-2 rounded-lg border border-stone-800 text-stone-300">
                              <span><strong>{item.name}</strong> ({item.quantity} unidades) &rarr; <span className="text-amber-400">S/{item.price.toFixed(2)}</span></span>
                              <button
                                type="button"
                                onClick={() => setFormData({ ...formData, presentations: formData.presentations.filter((_, i) => i !== idx) })}
                                className="text-rose-400 font-bold"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                /* Tab: Landing / E-commerce */
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-200">
                      Descripción para la Carta y Tienda Online
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describe los ingredientes, guarniciones y preparación para antojar a tus comensales..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-200 block">
                      Disponibilidad por Horario
                    </label>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                        formData.menu_types.includes("criollo")
                          ? "bg-orange-500/10 border-orange-500/40 text-orange-300 font-semibold"
                          : "bg-stone-950 border-stone-800 text-stone-400"
                      }`}>
                        <input
                          type="checkbox"
                          checked={formData.menu_types.includes("criollo")}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...formData.menu_types, "criollo"]
                              : formData.menu_types.filter((t) => t !== "criollo");
                            setFormData({ ...formData, menu_types: next });
                          }}
                          className="rounded accent-orange-500 w-4 h-4"
                        />
                        <span>Menú Criollo (Día)</span>
                      </label>

                      <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                        formData.menu_types.includes("rapida")
                          ? "bg-blue-500/10 border-blue-500/40 text-blue-300 font-semibold"
                          : "bg-stone-950 border-stone-800 text-stone-400"
                      }`}>
                        <input
                          type="checkbox"
                          checked={formData.menu_types.includes("rapida")}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...formData.menu_types, "rapida"]
                              : formData.menu_types.filter((t) => t !== "rapida");
                            setFormData({ ...formData, menu_types: next });
                          }}
                          className="rounded accent-blue-500 w-4 h-4"
                        />
                        <span>Comida Rápida (Noche)</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-stone-800">
                    <label className="flex items-center justify-between p-3.5 rounded-xl border border-stone-800 bg-stone-950/80 cursor-pointer">
                      <div>
                        <p className="text-xs font-bold text-white">Producto Activo / Visible</p>
                        <p className="text-[11px] text-stone-400">Mostrar en el menú QR de mesa y delivery</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="rounded accent-emerald-500 w-5 h-5 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3.5 rounded-xl border border-stone-800 bg-stone-950/80 cursor-pointer">
                      <div>
                        <p className="text-xs font-bold text-white">Destacar en Inicio</p>
                        <p className="text-[11px] text-stone-400">Aparecer en las recomendaciones principales</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                        className="rounded accent-amber-500 w-5 h-5 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Botones del Modal: Cancelar y Guardar Producto */}
              <div className="pt-4 border-t border-stone-800 flex items-center justify-end gap-3 bg-stone-900">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-stone-700 bg-stone-800 hover:bg-stone-700 text-stone-300 text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black text-sm font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  <span>Guardar Producto</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Input oculto para importación de excel */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        className="hidden"
        onChange={() => {
          alert("Importador de catálogo: Selecciona un archivo CSV o Excel válido");
        }}
      />
    </div>
  );
}
