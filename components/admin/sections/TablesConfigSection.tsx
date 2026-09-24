"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Utensils,
  Plus,
  Trash2,
  Save,
  Check,
  AlertCircle,
  Users,
  Grid2X2,
  RefreshCw,
  Sparkles,
  Search,
  Eye,
  CheckCircle2,
  Sliders,
  ChevronDown
} from "lucide-react";
import { RestaurantTable, TablesConfig } from "@/types";

const COMMON_ZONES = ["Salón Principal", "Terraza", "Barra", "Segundo Piso", "Zona VIP", "Patio Exterior"];

const DEFAULT_CONFIG: TablesConfig = {
  total_tables: 12,
  default_capacity: 4,
  tables: Array.from({ length: 12 }, (_, i) => ({
    id: `table_${i + 1}`,
    number: String(i + 1),
    label: `Mesa ${i + 1}`,
    capacity: 4,
    zone: "Salón Principal",
    is_active: true,
  })),
};

export default function TablesConfigSection() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Configuration state
  const [totalCountInput, setTotalCountInput] = useState<number>(12);
  const [defaultCapInput, setDefaultCapInput] = useState<number>(4);
  const [tables, setTables] = useState<RestaurantTable[]>(DEFAULT_CONFIG.tables);

  // Filters & Preview
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedZoneFilter, setSelectedZoneFilter] = useState("all");
  const [showPreview, setShowPreview] = useState(true);

  // Modal / Confirm Delete
  const [tableToDelete, setTableToDelete] = useState<RestaurantTable | null>(null);

  // Fetch initial configuration from API
  useEffect(() => {
    fetchTables();
  }, []);

  async function fetchTables() {
    setLoading(true);
    // 1. Check localStorage first for instant response
    if (typeof window !== "undefined") {
      try {
        const local = localStorage.getItem("restaurant_tables_config");
        if (local) {
          const parsed = JSON.parse(local);
          if (parsed && Array.isArray(parsed.tables) && parsed.tables.length > 0) {
            setTables(parsed.tables);
            setTotalCountInput(parsed.total_tables || parsed.tables.length);
            setDefaultCapInput(parsed.default_capacity || 4);
          }
        }
      } catch {}
    }

    try {
      const res = await fetch(`/api/admin/tables?_t=${Date.now()}`, { cache: "no-store" });
      const json = await res.json();
      if (json.data && Array.isArray(json.data.tables) && json.data.tables.length > 0) {
        setTables(json.data.tables);
        setTotalCountInput(json.data.total_tables || json.data.tables.length);
        setDefaultCapInput(json.data.default_capacity || 4);
        if (typeof window !== "undefined") {
          localStorage.setItem("restaurant_tables_config", JSON.stringify(json.data));
        }
      } else if (!localStorage.getItem("restaurant_tables_config")) {
        setTables(DEFAULT_CONFIG.tables);
        setTotalCountInput(DEFAULT_CONFIG.total_tables);
        setDefaultCapInput(DEFAULT_CONFIG.default_capacity);
      }
    } catch (err: any) {
      console.error("Error al cargar mesas:", err);
    } finally {
      setLoading(false);
    }
  }

  // Save configuration
  async function handleSave() {
    setSaving(true);
    setErrorMsg(null);
    try {
      const payload: TablesConfig = {
        total_tables: tables.length,
        default_capacity: defaultCapInput,
        tables,
      };

      // 1. Instant local persistence & broadcast event
      if (typeof window !== "undefined") {
        localStorage.setItem("restaurant_tables_config", JSON.stringify(payload));
        window.dispatchEvent(new CustomEvent("restaurant_tables_updated", { detail: payload }));
      }

      // 2. Persist to API / Supabase
      const res = await fetch("/api/admin/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Error al guardar");
      }

      setSavedSuccess(true);
      setTotalCountInput(tables.length);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al conectar con el servidor.");
    } finally {
      setSaving(false);
    }
  }

  // Quick count generator: adjust quantity of tables
  function handleApplyTotalCount() {
    const targetCount = Math.max(1, Math.min(60, Number(totalCountInput) || 1));
    const currentCount = tables.length;

    if (targetCount === currentCount) return;

    if (targetCount > currentCount) {
      // Add tables
      const newTables: RestaurantTable[] = [...tables];
      for (let i = currentCount + 1; i <= targetCount; i++) {
        newTables.push({
          id: `table_${Date.now()}_${i}`,
          number: String(i),
          label: `Mesa ${i}`,
          capacity: defaultCapInput,
          zone: "Salón Principal",
          is_active: true,
        });
      }
      setTables(newTables);
    } else {
      // Reduce tables (confirm if reduction is large)
      if (
        confirm(
          `Vas a reducir de ${currentCount} a ${targetCount} mesas. Las últimas ${currentCount - targetCount} mesas serán eliminadas. ¿Continuar?`
        )
      ) {
        setTables(tables.slice(0, targetCount));
      } else {
        setTotalCountInput(currentCount);
      }
    }
  }

  // Reset to default 12 tables
  function handleResetDefault() {
    if (confirm("¿Estás seguro de restablecer la configuración a 12 mesas estándar de 4 personas?")) {
      setTables(DEFAULT_CONFIG.tables);
      setTotalCountInput(DEFAULT_CONFIG.total_tables);
      setDefaultCapInput(DEFAULT_CONFIG.default_capacity);
    }
  }

  // Add individual table
  function handleAddSingleTable() {
    const nextNum = tables.length + 1;
    const newTable: RestaurantTable = {
      id: `table_${Date.now()}`,
      number: String(nextNum),
      label: `Mesa ${nextNum}`,
      capacity: defaultCapInput,
      zone: "Salón Principal",
      is_active: true,
    };
    setTables((prev) => [...prev, newTable]);
    setTotalCountInput((prev) => prev + 1);
  }

  // Update a single table field
  function handleUpdateTable(id: string, updates: Partial<RestaurantTable>) {
    setTables((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  }

  // Delete a table
  function handleDeleteTable(table: RestaurantTable) {
    setTables((prev) => prev.filter((t) => t.id !== table.id));
    setTotalCountInput((prev) => Math.max(1, prev - 1));
    setTableToDelete(null);
  }

  // Computed statistics
  const activeTablesCount = useMemo(() => {
    return tables.filter((t) => t.is_active).length;
  }, [tables]);

  const totalSeats = useMemo(() => {
    return tables
      .filter((t) => t.is_active)
      .reduce((sum, t) => sum + (Number(t.capacity) || 0), 0);
  }, [tables]);

  const uniqueZones = useMemo(() => {
    const zones = new Set<string>();
    tables.forEach((t) => {
      if (t.zone && t.zone.trim()) zones.add(t.zone.trim());
    });
    return Array.from(zones);
  }, [tables]);

  // Check for duplicate table numbers to show warning
  const duplicateNumbers = useMemo(() => {
    const seen = new Set<string>();
    const dupes = new Set<string>();
    for (const t of tables) {
      const num = t.number.trim().toLowerCase();
      if (!num) continue;
      if (seen.has(num)) {
        dupes.add(t.number.trim());
      } else {
        seen.add(num);
      }
    }
    return Array.from(dupes);
  }, [tables]);

  // Filtered tables for display
  const filteredTables = useMemo(() => {
    return tables.filter((t) => {
      const matchSearch =
        t.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.zone.toLowerCase().includes(searchQuery.toLowerCase());

      const matchZone =
        selectedZoneFilter === "all" || t.zone === selectedZoneFilter;

      return matchSearch && matchZone;
    });
  }, [tables, searchQuery, selectedZoneFilter]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-stone-400">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-medium">Cargando mesas del restaurante...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* 1. Header principal con Estadísticas y Guardar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Grid2X2 size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Configuración de Mesas
              </h1>
              <p className="text-xs sm:text-sm text-stone-400">
                Define la cantidad de mesas de tu local, sus nombres y capacidades de atención.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchTables}
            title="Recargar configuración"
            className="p-3 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer border border-stone-700/60"
          >
            <RefreshCw size={17} />
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg cursor-pointer ${
              savedSuccess
                ? "bg-emerald-500 text-stone-950 shadow-emerald-500/20"
                : "bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-500/20 active:scale-95"
            } ${saving ? "opacity-75 cursor-not-allowed" : ""}`}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                <span>Guardando...</span>
              </>
            ) : savedSuccess ? (
              <>
                <Check size={18} className="stroke-[3]" />
                <span>¡Guardado!</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Guardar Cambios</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Alerta de guardado exitoso o error */}
      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span className="font-semibold">
            ¡Configuración de mesas guardada correctamente! Ahora los meseros y la caja verán esta distribución.
          </span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2.5">
          <AlertCircle size={18} className="text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {duplicateNumbers.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs sm:text-sm flex items-center gap-2.5">
          <AlertCircle size={18} className="text-amber-400 shrink-0" />
          <span>
            <strong>Atención:</strong> Tienes mesas con el mismo número ({duplicateNumbers.join(", ")}). Te sugerimos que cada mesa tenga un número o código único.
          </span>
        </div>
      )}

      {/* 2. Tarjetas de Resumen y Ajuste Rápido de Cantidad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Generador de cantidad rápida */}
        <div className="md:col-span-2 bg-stone-900/90 border border-stone-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-stone-200 font-bold text-sm">
            <Sliders size={18} className="text-amber-400" />
            <span>Ajuste Rápido de Cantidad de Mesas</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Input Cantidad Total */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-400">
                ¿Cuántas mesas tiene tu restaurante?
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTotalCountInput((prev) => Math.max(1, prev - 1))}
                  className="w-10 h-10 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold flex items-center justify-center transition-colors cursor-pointer border border-stone-700/60"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={totalCountInput}
                  onChange={(e) => setTotalCountInput(Math.max(1, Math.min(60, Number(e.target.value) || 1)))}
                  className="w-20 h-10 bg-stone-950 border border-stone-700 rounded-xl text-center font-black text-lg text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setTotalCountInput((prev) => Math.min(60, prev + 1))}
                  className="w-10 h-10 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold flex items-center justify-center transition-colors cursor-pointer border border-stone-700/60"
                >
                  +
                </button>
                <span className="text-xs font-medium text-stone-400">mesas</span>
              </div>
            </div>

            {/* Capacidad estándar */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-400">
                Capacidad comensales por defecto
              </label>
              <select
                value={defaultCapInput}
                onChange={(e) => setDefaultCapInput(Number(e.target.value))}
                className="w-full h-10 bg-stone-950 border border-stone-700 rounded-xl px-3 text-sm font-semibold text-white focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value={2}>2 personas (Mesa pequeña)</option>
                <option value={4}>4 personas (Estándar)</option>
                <option value={6}>6 personas (Familiar)</option>
                <option value={8}>8 personas (Grupo grande)</option>
                <option value={10}>10 personas (Imperial)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1 border-t border-stone-800/80">
            <button
              type="button"
              onClick={handleApplyTotalCount}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 text-xs font-bold transition-colors cursor-pointer"
            >
              <Sparkles size={14} />
              <span>Aplicar cantidad ({totalCountInput} mesas)</span>
            </button>

            <button
              type="button"
              onClick={handleResetDefault}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw size={13} />
              <span>Restablecer a 12 estándar</span>
            </button>
          </div>
        </div>

        {/* Resumen de Capacidades */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-2 text-stone-200 font-bold text-sm">
            <Users size={18} className="text-amber-400" />
            <span>Capacidad Total del Local</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-stone-950/70 border border-stone-800/80 rounded-2xl">
              <span className="block text-2xl font-black text-amber-400 font-mono">
                {tables.length}
              </span>
              <span className="text-[11px] text-stone-400 font-medium">
                Mesas totales
              </span>
            </div>

            <div className="p-3 bg-stone-950/70 border border-stone-800/80 rounded-2xl">
              <span className="block text-2xl font-black text-emerald-400 font-mono">
                {activeTablesCount}
              </span>
              <span className="text-[11px] text-stone-400 font-medium">
                Mesas activas
              </span>
            </div>

            <div className="col-span-2 p-3 bg-stone-950/70 border border-stone-800/80 rounded-2xl flex items-center justify-around">
              <div>
                <span className="block text-2xl font-black text-white font-mono">
                  {totalSeats}
                </span>
                <span className="text-[11px] text-stone-400 font-medium">
                  Comensales simultáneos
                </span>
              </div>
              <div className="h-8 w-px bg-stone-800" />
              <div>
                <span className="block text-2xl font-black text-blue-400 font-mono">
                  {uniqueZones.length || 1}
                </span>
                <span className="text-[11px] text-stone-400 font-medium">
                  Zonas activas
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Barra de Herramientas de Mesas (Filtros, Buscador y Botón Agregar) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-stone-900 border border-stone-800 rounded-3xl p-4">
        {/* Buscador */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por número, nombre o zona..."
            className="w-full bg-stone-950 border border-stone-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Filtro por Zona */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            type="button"
            onClick={() => setSelectedZoneFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedZoneFilter === "all"
                ? "bg-amber-500 text-stone-950 shadow-sm"
                : "bg-stone-800 text-stone-400 hover:text-white"
            }`}
          >
            Todas ({tables.length})
          </button>
          {uniqueZones.map((z) => (
            <button
              key={z}
              type="button"
              onClick={() => setSelectedZoneFilter(z)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedZoneFilter === z
                  ? "bg-amber-500 text-stone-950 shadow-sm"
                  : "bg-stone-800 text-stone-400 hover:text-white"
              }`}
            >
              {z} ({tables.filter((t) => t.zone === z).length})
            </button>
          ))}
        </div>

        {/* Botón Agregar Mesa */}
        <button
          type="button"
          onClick={handleAddSingleTable}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-amber-400 font-bold text-xs sm:text-sm transition-all border border-amber-500/20 cursor-pointer shadow-sm shrink-0"
        >
          <Plus size={16} />
          <span>+ Agregar Mesa</span>
        </button>
      </div>

      {/* 4. Lista Editable de Mesas */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-stone-300">
            Listado de Mesas ({filteredTables.length}{" "}
            {filteredTables.length === 1 ? "mesa" : "mesas"})
          </h2>
          <span className="text-xs text-stone-500">
            Puedes cambiar el número, nombre, comensales y zona de cada mesa.
          </span>
        </div>

        {filteredTables.length === 0 ? (
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-12 text-center text-stone-400 space-y-3">
            <Utensils size={36} className="mx-auto text-stone-600" />
            <p className="text-sm font-semibold text-stone-300">
              No se encontraron mesas con los filtros aplicados.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedZoneFilter("all");
              }}
              className="text-xs text-amber-400 underline cursor-pointer"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTables.map((table) => {
              const isDupe = duplicateNumbers.includes(table.number.trim());

              return (
                <div
                  key={table.id}
                  className={`bg-stone-900/90 border rounded-3xl p-4 transition-all space-y-3 relative group ${
                    !table.is_active
                      ? "opacity-60 border-stone-800"
                      : isDupe
                      ? "border-amber-500/60 shadow-amber-500/10 shadow-lg"
                      : "border-stone-800 hover:border-stone-700 hover:shadow-lg"
                  }`}
                >
                  {/* Encabezado de la Tarjeta */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-center font-black text-amber-400 text-base shadow-inner">
                        {table.number || "?"}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                          Mesa #{table.number}
                        </span>
                        <span className="text-xs font-semibold text-white truncate max-w-[120px] block">
                          {table.label || `Mesa ${table.number}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Toggle Habilitada */}
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateTable(table.id, { is_active: !table.is_active })
                        }
                        title={table.is_active ? "Mesa Activa (Click para desactivar)" : "Mesa Inactiva (Click para activar)"}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors cursor-pointer border ${
                          table.is_active
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            : "bg-stone-800 text-stone-500 border-stone-700"
                        }`}
                      >
                        {table.is_active ? "Activa" : "Inactiva"}
                      </button>

                      {/* Botón Borrar */}
                      <button
                        type="button"
                        onClick={() => setTableToDelete(table)}
                        title="Eliminar mesa"
                        className="p-1.5 rounded-xl text-stone-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Campos de edición */}
                  <div className="space-y-2.5 pt-2 border-t border-stone-800/80">
                    {/* Número e Identificador */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-stone-400 block mb-1">
                          Nº Mesa
                        </label>
                        <input
                          type="text"
                          value={table.number}
                          onChange={(e) =>
                            handleUpdateTable(table.id, {
                              number: e.target.value,
                              label: `Mesa ${e.target.value}`,
                            })
                          }
                          className="w-full bg-stone-950 border border-stone-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                          placeholder="Ej: 1"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-stone-400 block mb-1">
                          Capacidad
                        </label>
                        <select
                          value={table.capacity}
                          onChange={(e) =>
                            handleUpdateTable(table.id, {
                              capacity: Number(e.target.value) || 4,
                            })
                          }
                          className="w-full bg-stone-950 border border-stone-800 rounded-xl px-2 py-1.5 text-xs font-semibold text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                        >
                          <option value={2}>2 comensales</option>
                          <option value={4}>4 comensales</option>
                          <option value={6}>6 comensales</option>
                          <option value={8}>8 comensales</option>
                          <option value={10}>10 comensales</option>
                          <option value={12}>12 comensales</option>
                        </select>
                      </div>
                    </div>

                    {/* Nombre Visible */}
                    <div>
                      <label className="text-[10px] font-bold text-stone-400 block mb-1">
                        Nombre completo o etiqueta
                      </label>
                      <input
                        type="text"
                        value={table.label}
                        onChange={(e) =>
                          handleUpdateTable(table.id, { label: e.target.value })
                        }
                        className="w-full bg-stone-950 border border-stone-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        placeholder="Ej: Mesa 1 / Terraza 2"
                      />
                    </div>

                    {/* Zona / Ubicación */}
                    <div>
                      <label className="text-[10px] font-bold text-stone-400 block mb-1">
                        Zona / Ambiente
                      </label>
                      <div className="flex gap-1.5">
                        <select
                          value={table.zone}
                          onChange={(e) =>
                            handleUpdateTable(table.id, { zone: e.target.value })
                          }
                          className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-2 py-1.5 text-xs text-stone-300 focus:outline-none focus:border-amber-500 cursor-pointer"
                        >
                          {COMMON_ZONES.map((zone) => (
                            <option key={zone} value={zone}>
                              {zone}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Vista Previa en Vivo (Simulación de cómo lo verá el Mesero y el Cajero) */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Eye size={18} className="text-amber-400" />
            <h3 className="text-sm sm:text-base font-bold text-white">
              Vista Previa en Vivo: ¿Cómo lo verán tus Meseros y Cajeros?
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-xs font-semibold text-stone-400 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <span>{showPreview ? "Ocultar" : "Mostrar"}</span>
            <ChevronDown
              size={14}
              className={`transition-transform ${showPreview ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {showPreview && (
          <div className="pt-2 space-y-4 border-t border-stone-800/80">
            <p className="text-xs text-stone-400">
              Así es como aparecerán los botones de selección de mesa en la pantalla de{" "}
              <strong className="text-white">Tomar Pedido</strong> para tus meseros:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {tables
                .filter((t) => t.is_active)
                .map((table) => (
                  <div
                    key={table.id}
                    className="p-3 rounded-2xl bg-stone-950 border border-stone-800 flex flex-col justify-between min-h-[95px] select-none hover:border-amber-500/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] text-stone-500 font-semibold uppercase block">
                          Mesa
                        </span>
                        <span className="text-xl font-black text-white">
                          {table.number}
                        </span>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>

                    <div className="pt-2 border-t border-stone-800/60 flex items-center justify-between text-[10px] text-stone-400">
                      <span className="truncate max-w-[70px]">{table.zone}</span>
                      <span className="font-semibold text-stone-300">
                        {table.capacity}p
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmación para eliminar mesa */}
      {tableToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <Trash2 size={22} />
            </div>

            <div className="text-center space-y-1">
              <h4 className="text-base font-bold text-white">¿Eliminar esta mesa?</h4>
              <p className="text-xs text-stone-400">
                Se quitará la <strong className="text-white">Mesa #{tableToDelete.number}</strong> ({tableToDelete.label}).
                Esta acción no se aplicará definitivamente hasta que guardes los cambios.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTableToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDeleteTable(tableToDelete)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-lg shadow-rose-600/20"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
