"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuthStore } from "@/lib/stores/auth";
import {
  Users,
  UserPlus,
  CheckCircle2,
  Shield,
  UserX,
  Search,
  Download,
  DollarSign,
  MoreVertical,
  Edit2,
  Key,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronUp,
  X,
  Loader2,
  Crown,
  Calculator,
  Coffee,
  Flame,
  Utensils,
  ShoppingBag,
  BarChart3,
  Building2,
  Check,
  FileSpreadsheet,
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react";

// --- TYPES & INTERFACES ---
export interface StaffMember {
  id: string;
  email: string;
  name: string;
  dni?: string | null;
  role: string;
  is_active: boolean;
  branch?: string;
  base_salary?: number;
  permissions?: string[];
  created_at: string;
}

export type StaffRole = "owner" | "admin" | "cashier" | "staff" | "chef";

export interface PermissionItem {
  id: string;
  label: string;
  category: "Ventas" | "Cocina / KDS" | "Carta & Inventario" | "Administración";
}

// --- PERMISSIONS DEFINITIONS ---
export const PERMISSIONS_LIST: PermissionItem[] = [
  // Ventas
  { id: "pos.orders.create", label: "Crear pedidos (POS / Mesero)", category: "Ventas" },
  { id: "pos.orders.checkout", label: "Cobrar y emitir comprobantes", category: "Ventas" },
  { id: "pos.orders.cancel", label: "Anular ventas y devoluciones", category: "Ventas" },
  { id: "pos.reports.view", label: "Ver reportes de caja y arqueo", category: "Ventas" },

  // Cocina / KDS
  { id: "kds.view", label: "Ver pantalla KDS de comandas", category: "Cocina / KDS" },
  { id: "kds.update_status", label: "Cambiar estado de platillos", category: "Cocina / KDS" },

  // Carta & Inventario
  { id: "menu.manage", label: "Gestionar productos y precios", category: "Carta & Inventario" },
  { id: "inventory.manage", label: "Ver y ajustar existencias / stock", category: "Carta & Inventario" },

  // Administración
  { id: "admin.metrics.view", label: "Ver estadísticas globales y ventas", category: "Administración" },
  { id: "admin.staff.manage", label: "Gestionar usuarios y roles", category: "Administración" },
  { id: "admin.settings.manage", label: "Configurar restaurante", category: "Administración" },
];

export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  owner: [
    "pos.orders.create", "pos.orders.checkout", "pos.orders.cancel", "pos.reports.view",
    "kds.view", "kds.update_status",
    "menu.manage", "inventory.manage",
    "admin.metrics.view", "admin.staff.manage", "admin.settings.manage"
  ],
  admin: [
    "pos.orders.create", "pos.orders.checkout", "pos.orders.cancel", "pos.reports.view",
    "kds.view", "kds.update_status",
    "menu.manage", "inventory.manage",
    "admin.metrics.view", "admin.staff.manage"
  ],
  cashier: [
    "pos.orders.create", "pos.orders.checkout", "pos.reports.view"
  ],
  staff: [
    "pos.orders.create"
  ],
  chef: [
    "kds.view", "kds.update_status"
  ],
};

const ROLE_CONFIG: Record<string, { label: string; icon: any; badgeClass: string; avatarBg: string }> = {
  owner: {
    label: "Propietario",
    icon: Crown,
    badgeClass: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
    avatarBg: "bg-purple-600/30 text-purple-300 border-purple-500/30"
  },
  admin: {
    label: "Administrador",
    icon: Shield,
    badgeClass: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    avatarBg: "bg-amber-600/30 text-amber-300 border-amber-500/30"
  },
  cashier: {
    label: "Cajero",
    icon: Calculator,
    badgeClass: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    avatarBg: "bg-emerald-600/30 text-emerald-300 border-emerald-500/30"
  },
  staff: {
    label: "Mesero",
    icon: Coffee,
    badgeClass: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
    avatarBg: "bg-sky-600/30 text-sky-300 border-sky-500/30"
  },
  chef: {
    label: "Cocina",
    icon: Flame,
    badgeClass: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
    avatarBg: "bg-orange-600/30 text-orange-300 border-orange-500/30"
  },
};

export default function AdminStaffPage() {
  const { user: currentUser } = useAuthStore();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterBranch, setFilterBranch] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Notifications
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modals state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffMember | null>(null);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordTargetUser, setPasswordTargetUser] = useState<StaffMember | null>(null);

  // Actions menu state
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Form fields for User Modal (Create/Edit)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dni: "",
    password: "",
    role: "staff" as StaffRole,
    branch: "QUEBRAVAZO!",
    baseSalary: 1200,
    permissions: [] as string[],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Password reset modal state
  const [newPassword, setNewPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Close actions menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showToast = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Fetch staff list
  const fetchStaff = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/staff");
      const json = await res.json();
      if (json.data) {
        setStaff(json.data);
      }
    } catch {
      showToast("error", "Error al cargar la lista de usuarios.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // Unique branches for the filter dropdown
  const branchOptions = useMemo(() => {
    const list = new Set<string>(["QUEBRAVAZO!"]);
    staff.forEach((s) => {
      if (s.branch && s.branch.trim()) list.add(s.branch.trim());
    });
    return Array.from(list);
  }, [staff]);

  // Filtered users
  const filteredStaff = useMemo(() => {
    return staff.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.dni && u.dni.includes(searchTerm));

      const matchesRole = filterRole === "all" || u.role === filterRole;
      const matchesBranch = filterBranch === "all" || (u.branch || "QUEBRAVAZO!") === filterBranch;
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && u.is_active) ||
        (filterStatus === "inactive" && !u.is_active);

      return matchesSearch && matchesRole && matchesBranch && matchesStatus;
    });
  }, [staff, searchTerm, filterRole, filterBranch, filterStatus]);

  // KPIs
  const totalCount = staff.length;
  const activeCount = staff.filter((s) => s.is_active).length;
  const adminCount = staff.filter((s) => s.role === "admin" || s.role === "owner").length;
  const inactiveCount = staff.filter((s) => !s.is_active).length;

  // Total payroll for active staff
  const totalPayroll = useMemo(() => {
    return staff
      .filter((s) => s.is_active)
      .reduce((sum, s) => sum + (Number(s.base_salary) || 0), 0);
  }, [staff]);

  // Open modal for creating new user
  const handleOpenCreateModal = () => {
    setEditingUser(null);
    const initialRole: StaffRole = "staff";
    setFormData({
      name: "",
      email: "",
      dni: "",
      password: "",
      role: initialRole,
      branch: "QUEBRAVAZO!",
      baseSalary: 1200,
      permissions: [...(DEFAULT_ROLE_PERMISSIONS[initialRole] || [])],
    });
    setIsPermissionsOpen(false);
    setShowPassword(false);
    setIsUserModalOpen(true);
  };

  // Open modal for editing user
  const handleOpenEditModal = (user: StaffMember) => {
    setEditingUser(user);
    const role = (user.role as StaffRole) || "staff";
    const userPermissions = Array.isArray(user.permissions) && user.permissions.length > 0
      ? user.permissions
      : DEFAULT_ROLE_PERMISSIONS[role] || [];

    setFormData({
      name: user.name,
      email: user.email,
      dni: user.dni || "",
      password: "",
      role,
      branch: user.branch || "QUEBRAVAZO!",
      baseSalary: user.base_salary !== undefined ? Number(user.base_salary) : 1200,
      permissions: [...userPermissions],
    });
    setIsPermissionsOpen(false);
    setShowPassword(false);
    setIsUserModalOpen(true);
    setActiveMenuId(null);
  };

  // Change role in form: updates permissions to default for that role if not modified
  const handleRoleChange = (newRole: StaffRole) => {
    setFormData((prev) => ({
      ...prev,
      role: newRole,
      permissions: [...(DEFAULT_ROLE_PERMISSIONS[newRole] || [])],
    }));
  };

  // Toggle permission checkbox
  const handleTogglePermission = (permId: string) => {
    setFormData((prev) => {
      const exists = prev.permissions.includes(permId);
      const nextPermissions = exists
        ? prev.permissions.filter((p) => p !== permId)
        : [...prev.permissions, permId];
      return { ...prev, permissions: nextPermissions };
    });
  };

  // Reset permissions to role defaults
  const handleResetToRolePermissions = () => {
    setFormData((prev) => ({
      ...prev,
      permissions: [...(DEFAULT_ROLE_PERMISSIONS[prev.role] || [])],
    }));
  };

  // Check if permissions are customized compared to defaults
  const isCustomizedPermissions = useMemo(() => {
    const defaults = DEFAULT_ROLE_PERMISSIONS[formData.role] || [];
    if (defaults.length !== formData.permissions.length) return true;
    return !defaults.every((p) => formData.permissions.includes(p));
  }, [formData.role, formData.permissions]);

  // Submit User Create / Edit
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      showToast("error", "Por favor completa el nombre y correo electrónico.");
      return;
    }

    if (!editingUser && (!formData.password || formData.password.length < 6)) {
      showToast("error", "La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingUser) {
        // Edit existing
        const payload: any = {
          name: formData.name.trim(),
          dni: formData.dni.trim() || null,
          role: formData.role,
          branch: formData.branch.trim(),
          base_salary: Number(formData.baseSalary) || 0,
          permissions: formData.permissions,
        };
        if (formData.password.trim()) {
          payload.new_password = formData.password.trim();
        }

        const res = await fetch(`/api/admin/staff/${editingUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!json.ok) {
          showToast("error", json.error || "Error al actualizar usuario.");
        } else {
          showToast("success", `Usuario "${formData.name}" actualizado correctamente.`);
          setIsUserModalOpen(false);
          await fetchStaff();
        }
      } else {
        // Create new
        const payload = {
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          dni: formData.dni.trim() || null,
          password: formData.password,
          role: formData.role,
          branch: formData.branch.trim(),
          base_salary: Number(formData.baseSalary) || 0,
          permissions: formData.permissions,
        };

        const res = await fetch("/api/admin/staff", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!json.ok) {
          showToast("error", json.error || "Error al crear usuario.");
        } else {
          showToast("success", `Usuario "${formData.name}" creado con éxito.`);
          setIsUserModalOpen(false);
          await fetchStaff();
        }
      }
    } catch {
      showToast("error", "Error de conexión con el servidor.");
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle user active status
  const handleToggleStatus = async (user: StaffMember) => {
    const nextStatus = !user.is_active;
    try {
      const res = await fetch(`/api/admin/staff/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: nextStatus }),
      });
      const json = await res.json();
      if (!json.ok) {
        showToast("error", json.error || "No se pudo cambiar el estado.");
      } else {
        showToast("success", `Usuario "${user.name}" ${nextStatus ? "activado" : "desactivado"}.`);
        await fetchStaff();
      }
    } catch {
      showToast("error", "Error de red al actualizar estado.");
    } finally {
      setActiveMenuId(null);
    }
  };

  // Delete user
  const handleDeleteUser = async (user: StaffMember) => {
    if (!confirm(`¿Estás seguro de eliminar al usuario "${user.name}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/staff/${user.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.ok) {
        showToast("error", json.error || "Error al eliminar usuario.");
      } else {
        showToast("success", `Usuario "${user.name}" eliminado del sistema.`);
        await fetchStaff();
      }
    } catch {
      showToast("error", "Error al eliminar usuario.");
    } finally {
      setActiveMenuId(null);
    }
  };

  // Open password modal
  const handleOpenPasswordModal = (user: StaffMember) => {
    setPasswordTargetUser(user);
    setNewPassword("");
    setIsPasswordModalOpen(true);
    setActiveMenuId(null);
  };

  // Submit Password Change
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordTargetUser) return;
    if (newPassword.length < 6) {
      showToast("error", "La contraseña debe tener mínimo 6 caracteres.");
      return;
    }

    setIsSavingPassword(true);
    try {
      const res = await fetch(`/api/admin/staff/${passwordTargetUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_password: newPassword }),
      });
      const json = await res.json();
      if (!json.ok) {
        showToast("error", json.error || "Error al cambiar la contraseña.");
      } else {
        showToast("success", `Contraseña de "${passwordTargetUser.name}" actualizada con éxito.`);
        setIsPasswordModalOpen(false);
      }
    } catch {
      showToast("error", "Error de conexión al actualizar contraseña.");
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Export Users to CSV
  const handleExportCSV = () => {
    if (filteredStaff.length === 0) {
      showToast("error", "No hay usuarios para exportar.");
      return;
    }

    const headers = ["Nombre", "Email", "DNI", "Rol", "Sucursal", "Sueldo Base", "Estado", "Fecha Registro"];
    const rows = filteredStaff.map((u) => [
      `"${u.name.replace(/"/g, '""')}"`,
      `"${u.email}"`,
      `"${u.dni || ""}"`,
      `"${ROLE_CONFIG[u.role]?.label || u.role}"`,
      `"${u.branch || "QUEBRAVAZO!"}"`,
      `"${Number(u.base_salary || 0).toFixed(2)}"`,
      `"${u.is_active ? "Activo" : "Inactivo"}"`,
      `"${new Date(u.created_at).toLocaleDateString()}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `usuarios_quebravazo_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("success", "Archivo CSV de usuarios generado exitosamente.");
  };

  // Export Payroll to CSV
  const handleExportPayrollCSV = () => {
    const activeStaff = staff.filter((s) => s.is_active);
    if (activeStaff.length === 0) {
      showToast("error", "No hay personal activo para exportar en nómina.");
      return;
    }

    const headers = ["Colaborador", "Email", "DNI", "Rol", "Sucursal", "Sueldo Base (PEN)"];
    const rows = activeStaff.map((u) => [
      `"${u.name.replace(/"/g, '""')}"`,
      `"${u.email}"`,
      `"${u.dni || ""}"`,
      `"${ROLE_CONFIG[u.role]?.label || u.role}"`,
      `"${u.branch || "QUEBRAVAZO!"}"`,
      `"${Number(u.base_salary || 0).toFixed(2)}"`,
    ]);

    // Summary row
    rows.push(["\"TOTAL PLANILLA MENSUAL\"", "\"\"", "\"\"", "\"\"", "\"\"", `"${totalPayroll.toFixed(2)}"`]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `nomina_quebravazo_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("success", "Planilla exportada correctamente.");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 space-y-4">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-stone-400 text-sm font-medium">Cargando gestión de usuarios...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notifications */}
      {feedback && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${
            feedback.type === "success"
              ? "bg-stone-900 border-emerald-500/40 text-emerald-400"
              : "bg-stone-900 border-rose-500/40 text-rose-400"
          }`}
        >
          {feedback.type === "success" ? <Check size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-medium">{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="ml-2 text-stone-500 hover:text-stone-300">
            <X size={14} />
          </button>
        </div>
      )}

      {/* --- TOP HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Usuarios</h1>
          <p className="text-stone-400 text-sm mt-0.5">Gestiona los usuarios que tienen acceso al sistema.</p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Limit Badge */}
          <div className="px-3.5 py-2 bg-stone-900/90 border border-stone-800 rounded-xl text-xs font-semibold text-stone-300 flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-pulse" />
            <span>Límite: <strong className="text-white">{totalCount} / 10</strong></span>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 text-stone-300 hover:text-white rounded-xl text-xs font-medium transition-all shadow-sm"
          >
            <Download size={14} />
            <span>Exportar</span>
          </button>

          {/* New User Button */}
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl text-xs transition-all shadow-md shadow-amber-500/10 active:scale-95"
          >
            <UserPlus size={15} />
            <span>+ Nuevo Usuario</span>
          </button>

          {/* Payroll (Nómina) Button */}
          <button
            onClick={() => setIsPayrollModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 text-stone-300 hover:text-white rounded-xl text-xs font-medium transition-all shadow-sm"
          >
            <DollarSign size={14} className="text-emerald-400" />
            <span>Nómina</span>
          </button>
        </div>
      </div>

      {/* --- 4 KPI CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Usuarios */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:border-stone-700/70 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-400">Total Usuarios</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white tracking-tight">{totalCount} / 10</div>
            <div className="mt-2 w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min((totalCount / 10) * 100, 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-stone-500 mt-1.5">{totalCount} de 10 usuarios usados</p>
          </div>
        </div>

        {/* Card 2: Activos */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:border-stone-700/70 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-400">Activos</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-400 tracking-tight">{activeCount}</div>
            <p className="text-[11px] text-stone-500 mt-1">Usuarios activos</p>
          </div>
        </div>

        {/* Card 3: Administradores */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:border-stone-700/70 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-400">Administradores</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Shield size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-sky-400 tracking-tight">{adminCount}</div>
            <p className="text-[11px] text-stone-500 mt-1">Roles con permisos</p>
          </div>
        </div>

        {/* Card 4: Inactivos */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:border-stone-700/70 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-400">Inactivos</span>
            <div className="w-8 h-8 rounded-xl bg-stone-800 text-stone-400 flex items-center justify-center">
              <UserX size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-stone-300 tracking-tight">{inactiveCount}</div>
            <p className="text-[11px] text-stone-500 mt-1">Usuarios desactivados</p>
          </div>
        </div>
      </div>

      {/* --- SEARCH & FILTERS BAR --- */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3.5 flex flex-col lg:flex-row items-center gap-3 shadow-sm">
        {/* Search input */}
        <div className="relative w-full lg:flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar usuario por nombre, email o DNI..."
            className="w-full pl-9 pr-3.5 py-2 bg-stone-950/70 border border-stone-800 rounded-xl text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-500/50 transition-colors"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Roles Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-stone-950/70 border border-stone-800 rounded-xl px-3 py-2 text-xs font-medium text-stone-300 focus:outline-none focus:border-amber-500/50 transition-colors"
          >
            <option value="all">Todos los roles</option>
            <option value="owner">Propietario</option>
            <option value="admin">Administrador</option>
            <option value="cashier">Cajero</option>
            <option value="staff">Mesero</option>
            <option value="chef">Cocina</option>
          </select>

          {/* Sucursal Filter */}
          <select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            className="bg-stone-950/70 border border-stone-800 rounded-xl px-3 py-2 text-xs font-medium text-stone-300 focus:outline-none focus:border-amber-500/50 transition-colors"
          >
            <option value="all">Todas las sucursales</option>
            {branchOptions.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          {/* Estado Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-stone-950/70 border border-stone-800 rounded-xl px-3 py-2 text-xs font-medium text-stone-300 focus:outline-none focus:border-amber-500/50 transition-colors"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
        </div>
      </div>

      {/* --- USERS TABLE --- */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-800/80 bg-stone-950/40 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                <th className="py-3.5 px-4">Usuario</th>
                <th className="py-3.5 px-4">Rol</th>
                <th className="py-3.5 px-4">Sucursal</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/50 text-sm">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-14 text-center">
                    <Users size={32} className="mx-auto text-stone-600 mb-2" />
                    <p className="text-stone-400 font-medium text-sm">No se encontraron usuarios</p>
                    <p className="text-stone-500 text-xs mt-0.5">Prueba cambiando los filtros o agregando uno nuevo.</p>
                  </td>
                </tr>
              ) : (
                filteredStaff.map((user) => {
                  const roleCfg = ROLE_CONFIG[user.role] || ROLE_CONFIG.staff;
                  const RoleIcon = roleCfg.icon;
                  const initial = user.name.trim().charAt(0).toUpperCase() || "U";
                  const isSelf = user.id === currentUser?.uid;

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-stone-800/30 transition-colors group"
                    >
                      {/* USUARIO */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${roleCfg.avatarBg}`}
                          >
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white truncate">{user.name}</span>
                              {isSelf && (
                                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.2 rounded-md font-semibold">
                                  Tú
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-stone-400 mt-0.5">
                              <span className="truncate">{user.email}</span>
                              {user.dni && (
                                <span className="text-stone-500 font-mono text-[11px] bg-stone-800/70 px-1.5 py-0.5 rounded">
                                  DNI: {user.dni}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* ROL */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold ${roleCfg.badgeClass}`}
                        >
                          <RoleIcon size={13} />
                          {roleCfg.label}
                        </span>
                      </td>

                      {/* SUCURSAL */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-stone-300 text-xs font-medium">
                          <Building2 size={13} className="text-stone-500 shrink-0" />
                          <span>{user.branch || "QUEBRAVAZO!"}</span>
                        </div>
                      </td>

                      {/* ESTADO */}
                      <td className="py-3.5 px-4">
                        {user.is_active ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-800/80 text-stone-400 border border-stone-700/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-stone-500" />
                            Inactivo
                          </span>
                        )}
                      </td>

                      {/* ACCIONES */}
                      <td className="py-3.5 px-4 text-right relative">
                        <div className="relative inline-block text-left" ref={activeMenuId === user.id ? menuRef : null}>
                          <button
                            onClick={() => setActiveMenuId(activeMenuId === user.id ? null : user.id)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                            title="Opciones de usuario"
                          >
                            <MoreVertical size={16} />
                          </button>

                          {/* Floating Dropdown */}
                          {activeMenuId === user.id && (
                            <div className="absolute right-0 mt-1 w-48 bg-stone-900 border border-stone-700/80 rounded-2xl shadow-2xl z-40 py-1.5 animate-in fade-in zoom-in-95 text-left">
                              <button
                                onClick={() => handleOpenEditModal(user)}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-stone-200 hover:text-white hover:bg-stone-800 transition-colors"
                              >
                                <Edit2 size={14} className="text-amber-400" />
                                <span>Editar usuario</span>
                              </button>

                              <button
                                onClick={() => handleOpenPasswordModal(user)}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-stone-200 hover:text-white hover:bg-stone-800 transition-colors"
                              >
                                <Key size={14} className="text-sky-400" />
                                <span>Cambiar contraseña</span>
                              </button>

                              {!isSelf && (
                                <button
                                  onClick={() => handleToggleStatus(user)}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-stone-200 hover:text-white hover:bg-stone-800 transition-colors"
                                >
                                  {user.is_active ? (
                                    <>
                                      <ToggleLeft size={14} className="text-amber-400" />
                                      <span>Desactivar usuario</span>
                                    </>
                                  ) : (
                                    <>
                                      <ToggleRight size={14} className="text-emerald-400" />
                                      <span>Activar usuario</span>
                                    </>
                                  )}
                                </button>
                              )}

                              {!isSelf && (
                                <>
                                  <div className="my-1 border-t border-stone-800" />
                                  <button
                                    onClick={() => handleDeleteUser(user)}
                                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                                  >
                                    <Trash2 size={14} />
                                    <span>Eliminar usuario</span>
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================ */}
      {/* --- MODAL: NUEVO / EDITAR USUARIO (Images 2 & 3 Match) --- */}
      {/* ============================================================ */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="sticky top-0 bg-stone-900/95 backdrop-blur-md px-6 py-4 border-b border-stone-800 flex items-center justify-between z-10">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  {editingUser
                    ? "Modifica los datos, rol y permisos específicos del colaborador."
                    : "Crea una nueva cuenta de acceso para tu equipo con permisos personalizados."}
                </p>
              </div>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveUser} className="p-6 space-y-4 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nombre completo */}
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">Nombre completo</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej. Juan Pérez"
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                {/* Correo electrónico */}
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">Correo electrónico</label>
                  <input
                    type="email"
                    required
                    disabled={!!editingUser}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="cajero@quebravazo.com"
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500/50 disabled:opacity-60"
                  />
                  {editingUser && (
                    <span className="text-[10px] text-stone-500 mt-1 block">El email no se puede modificar.</span>
                  )}
                </div>

                {/* DNI */}
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">DNI (Opcional / Login rápido)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={8}
                    value={formData.dni}
                    onChange={(e) => setFormData({ ...formData, dni: e.target.value.replace(/\D/g, "") })}
                    placeholder="8 dígitos"
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                {/* Contraseña */}
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    {editingUser ? "Nueva contraseña (opcional)" : "Contraseña"}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required={!editingUser}
                      minLength={6}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder={editingUser ? "Dejar en blanco para conservar" : "Mínimo 6 caracteres"}
                      className="w-full pl-3.5 pr-10 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Rol */}
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">Rol</label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleRoleChange(e.target.value as StaffRole)}
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="owner">Propietario</option>
                    <option value="admin">Administrador</option>
                    <option value="cashier">Cajero</option>
                    <option value="staff">Mesero</option>
                    <option value="chef">Cocina</option>
                  </select>
                </div>

                {/* Sucursal */}
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">Sucursal</label>
                  <input
                    type="text"
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    placeholder="QUEBRAVAZO!"
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                {/* Sueldo base */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">Sueldo base (PEN)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-xs">
                      S/.
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.baseSalary}
                      onChange={(e) => setFormData({ ...formData, baseSalary: Number(e.target.value) })}
                      placeholder="1200.00"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500/50 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* --- COLLAPSIBLE PERMISSIONS ACCORDION (Images 2 & 3) --- */}
              <div className="border border-stone-800 rounded-2xl overflow-hidden mt-6 bg-stone-950/40">
                {/* Accordion Trigger */}
                <button
                  type="button"
                  onClick={() => setIsPermissionsOpen(!isPermissionsOpen)}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-stone-800/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <Key size={14} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Personalizar permisos</span>
                      <span className="text-[11px] text-stone-500">
                        Configura accesos específicos para este colaborador.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isCustomizedPermissions ? (
                      <span className="text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full font-medium">
                        Personalizado
                      </span>
                    ) : (
                      <span className="text-[10px] bg-stone-800 text-stone-400 border border-stone-700/60 px-2 py-0.5 rounded-full font-medium">
                        Permisos por defecto del rol
                      </span>
                    )}
                    {isPermissionsOpen ? <ChevronUp size={16} className="text-stone-400" /> : <ChevronDown size={16} className="text-stone-400" />}
                  </div>
                </button>

                {/* Accordion Content */}
                {isPermissionsOpen && (
                  <div className="p-4 border-t border-stone-800 space-y-5 bg-stone-950/80 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] text-stone-400 leading-relaxed max-w-md">
                        Los permisos con el distintivo <span className="text-amber-400 font-medium">[del rol]</span> se heredan por defecto. Puedes activar o desactivar permisos específicos para este usuario.
                      </p>
                      {isCustomizedPermissions && (
                        <button
                          type="button"
                          onClick={handleResetToRolePermissions}
                          className="text-[11px] text-amber-400 hover:text-amber-300 underline font-medium"
                        >
                          Restablecer por defecto
                        </button>
                      )}
                    </div>

                    {/* Permission Categories */}
                    {(["Ventas", "Cocina / KDS", "Carta & Inventario", "Administración"] as const).map((cat) => {
                      const perms = PERMISSIONS_LIST.filter((p) => p.category === cat);
                      const defaultRolePerms = DEFAULT_ROLE_PERMISSIONS[formData.role] || [];

                      return (
                        <div key={cat} className="space-y-2">
                          <div className="flex items-center gap-2 text-xs font-semibold text-stone-300">
                            {cat === "Ventas" && <ShoppingBag size={13} className="text-emerald-400" />}
                            {cat === "Cocina / KDS" && <Flame size={13} className="text-orange-400" />}
                            {cat === "Carta & Inventario" && <Utensils size={13} className="text-sky-400" />}
                            {cat === "Administración" && <BarChart3 size={13} className="text-amber-400" />}
                            <span>{cat}</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {perms.map((perm) => {
                              const isChecked = formData.permissions.includes(perm.id);
                              const isDefaultFromRole = defaultRolePerms.includes(perm.id);

                              return (
                                <label
                                  key={perm.id}
                                  className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                                    isChecked
                                      ? "bg-amber-500/5 border-amber-500/30 text-white"
                                      : "bg-stone-900/50 border-stone-800 text-stone-400 hover:border-stone-700"
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => handleTogglePermission(perm.id)}
                                      className="rounded bg-stone-800 border-stone-700 text-amber-500 focus:ring-amber-500/50 h-4 w-4"
                                    />
                                    <span className="text-xs">{perm.label}</span>
                                  </div>
                                  {isDefaultFromRole && (
                                    <span className="text-[10px] text-amber-400/80 font-mono shrink-0 ml-1">
                                      [del rol]
                                    </span>
                                  )}
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold rounded-xl text-xs transition-all shadow-md shadow-amber-500/10"
                >
                  {isSaving && <Loader2 size={14} className="animate-spin" />}
                  <span>{editingUser ? "Guardar cambios" : "Crear usuario"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* --- MODAL: NÓMINA / PLANILLA SUMMARY --- */}
      {/* ============================================================ */}
      {isPayrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Header */}
            <div className="sticky top-0 bg-stone-900/95 backdrop-blur-md px-6 py-4 border-b border-stone-800 flex items-center justify-between z-10">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <DollarSign size={18} className="text-emerald-400" />
                  <span>Resumen de Nómina y Planilla</span>
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Cálculo mensual proyectado según el sueldo base asignado a los usuarios activos.
                </p>
              </div>
              <button
                onClick={() => setIsPayrollModalOpen(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 flex-1">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800">
                  <span className="text-[11px] font-medium text-stone-400 block">Personal activo</span>
                  <span className="text-xl font-bold text-white mt-1 block">
                    {staff.filter((s) => s.is_active).length} colaboradores
                  </span>
                </div>
                <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800">
                  <span className="text-[11px] font-medium text-stone-400 block">Gasto mensual proyectado</span>
                  <span className="text-xl font-bold text-emerald-400 mt-1 block font-mono">
                    S/. {totalPayroll.toFixed(2)}
                  </span>
                </div>
                <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800">
                  <span className="text-[11px] font-medium text-stone-400 block">Promedio por colaborador</span>
                  <span className="text-xl font-bold text-amber-400 mt-1 block font-mono">
                    S/. {activeCount > 0 ? (totalPayroll / activeCount).toFixed(2) : "0.00"}
                  </span>
                </div>
              </div>

              {/* Breakdown list */}
              <div>
                <h4 className="text-xs font-bold text-stone-300 uppercase tracking-wider mb-2.5">
                  Desglose por Colaborador
                </h4>
                <div className="bg-stone-950 rounded-2xl border border-stone-800 divide-y divide-stone-800/60 overflow-hidden">
                  {staff
                    .filter((s) => s.is_active)
                    .map((member) => (
                      <div key={member.id} className="p-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-stone-800 text-stone-200 flex items-center justify-center font-bold text-xs">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-white block">{member.name}</span>
                            <span className="text-[11px] text-stone-500">
                              {ROLE_CONFIG[member.role]?.label || member.role} • {member.branch || "QUEBRAVAZO!"}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-white block">
                            S/. {Number(member.base_salary || 0).toFixed(2)}
                          </span>
                          <span className="text-[10px] text-stone-500">Sueldo Base</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-stone-800 flex items-center justify-between">
              <button
                onClick={handleExportPayrollCSV}
                className="flex items-center gap-2 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-medium transition-colors"
              >
                <FileSpreadsheet size={14} className="text-emerald-400" />
                <span>Descargar Reporte CSV</span>
              </button>
              <button
                onClick={() => setIsPayrollModalOpen(false)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl text-xs transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* --- MODAL: CAMBIAR CONTRASEÑA --- */}
      {/* ============================================================ */}
      {isPasswordModalOpen && passwordTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                  <Key size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Cambiar contraseña</h3>
                  <p className="text-[11px] text-stone-400">Usuario: {passwordTargetUser.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-stone-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold rounded-xl text-xs transition-colors"
                >
                  {isSavingPassword && <Loader2 size={13} className="animate-spin" />}
                  <span>Guardar contraseña</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
