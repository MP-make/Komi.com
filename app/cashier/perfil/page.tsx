"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth";
import { LogOut, Mail, Shield, Save, Eye, EyeOff, CheckCircle } from "lucide-react";

export default function CashierPerfilPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || "");
  const [savingName, setSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [editingDni, setEditingDni] = useState(false);
  const [dniInput, setDniInput] = useState(user?.dni || "");
  const [dniPassword, setDniPassword] = useState("");
  const [showDniPassword, setShowDniPassword] = useState(false);
  const [savingDni, setSavingDni] = useState(false);
  const [dniError, setDniError] = useState("");
  const [dniSaved, setDniSaved] = useState(false);

  if (!user) return null;

  async function handleSaveName() {
    if (!nameInput.trim() || !user) return;
    setSavingName(true);
    try {
      const res = await fetch(`/api/admin/staff/${user.uid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameInput.trim() }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      user.name = nameInput.trim();
      setEditingName(false);
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 3000);
    } catch {
      alert("Error al guardar nombre");
    } finally {
      setSavingName(false);
    }
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmPassword || !user) return;
    setPasswordError("");
    if (newPassword.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch(`/api/admin/staff/${user.uid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowChangePassword(false);
      setPasswordSaved(true);
      setTimeout(() => setPasswordSaved(false), 3000);
    } catch (err: any) {
      setPasswordError(err.message || "Error al cambiar contraseña");
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleSaveDni() {
    if (!dniInput.trim() || !dniPassword || !user) return;
    setDniError("");
    setSavingDni(true);
    try {
      const res = await fetch(`/api/admin/staff/${user.uid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dni: dniInput.trim(), current_password: dniPassword }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      user.dni = dniInput.trim();
      setEditingDni(false);
      setDniPassword("");
      setDniSaved(true);
      setTimeout(() => setDniSaved(false), 3000);
    } catch (err: any) {
      setDniError(err.message || "Error al actualizar DNI");
    } finally {
      setSavingDni(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-6">
        {/* User Card Header */}
        <div className="flex items-center gap-4 border-b border-stone-800 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-black text-2xl font-black shadow-lg shadow-emerald-500/20">
            {user.name?.charAt(0) || "C"}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white truncate">{user.name}</h2>
            <p className="text-xs text-stone-400 mt-0.5 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                Cajero
              </span>
              <span>•</span>
              <span>{user.email}</span>
            </p>
          </div>
        </div>

        {/* Edit Name */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider block">
            Nombre de Visualización
          </label>
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/50"
              />
              <button
                type="button"
                onClick={handleSaveName}
                disabled={savingName}
                className="px-4 py-2 bg-amber-500 text-black font-bold text-xs rounded-xl hover:bg-amber-400 transition-colors"
              >
                {savingName ? "Guardando..." : "Guardar"}
              </button>
              <button
                type="button"
                onClick={() => setEditingName(false)}
                className="px-3 py-2 text-xs text-stone-400 hover:text-white"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-stone-950 rounded-xl border border-stone-800/80">
              <span className="text-sm text-white font-medium">{user.name}</span>
              <button
                type="button"
                onClick={() => setEditingName(true)}
                className="text-xs text-amber-400 hover:underline"
              >
                Cambiar nombre
              </button>
            </div>
          )}
          {nameSaved && (
            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
              <CheckCircle size={13} /> Nombre guardado correctamente
            </p>
          )}
        </div>

        {/* DNI */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider block">
            Número de Documento (DNI)
          </label>
          {editingDni ? (
            <div className="space-y-2 bg-stone-950 p-4 rounded-xl border border-stone-800">
              <input
                type="text"
                value={dniInput}
                onChange={(e) => setDniInput(e.target.value)}
                placeholder="Número de DNI"
                className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/50"
              />
              <div className="relative">
                <input
                  type={showDniPassword ? "text" : "password"}
                  value={dniPassword}
                  onChange={(e) => setDniPassword(e.target.value)}
                  placeholder="Tu contraseña actual para confirmar"
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/50"
                />
                <button
                  type="button"
                  onClick={() => setShowDniPassword(!showDniPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500"
                >
                  {showDniPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {dniError && <p className="text-xs text-rose-400">{dniError}</p>}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSaveDni}
                  disabled={savingDni}
                  className="px-4 py-2 bg-amber-500 text-black font-bold text-xs rounded-xl hover:bg-amber-400 transition-colors"
                >
                  {savingDni ? "Guardando..." : "Confirmar cambio de DNI"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingDni(false)}
                  className="px-3 py-2 text-xs text-stone-400 hover:text-white"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-stone-950 rounded-xl border border-stone-800/80">
              <span className="text-sm text-white font-mono">{user.dni || "Sin DNI registrado"}</span>
              <button
                type="button"
                onClick={() => setEditingDni(true)}
                className="text-xs text-amber-400 hover:underline"
              >
                {user.dni ? "Editar DNI" : "Agregar DNI"}
              </button>
            </div>
          )}
          {dniSaved && (
            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
              <CheckCircle size={13} /> DNI actualizado correctamente
            </p>
          )}
        </div>

        {/* Change Password */}
        <div className="space-y-2 pt-2 border-t border-stone-800">
          <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider block">
            Seguridad y Contraseña
          </label>
          {!showChangePassword ? (
            <button
              type="button"
              onClick={() => setShowChangePassword(true)}
              className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl transition-colors"
            >
              Cambiar Contraseña
            </button>
          ) : (
            <div className="space-y-3 bg-stone-950 p-4 rounded-xl border border-stone-800">
              <div>
                <label className="text-xs text-stone-400 mb-1 block">Contraseña Actual</label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500"
                  >
                    {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-stone-400 mb-1 block">Nueva Contraseña</label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500"
                  >
                    {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-stone-400 mb-1 block">Confirmar Nueva Contraseña</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500"
                  >
                    {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {passwordError && <p className="text-xs text-rose-400">{passwordError}</p>}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={savingPassword}
                  className="px-4 py-2 bg-amber-500 text-black font-bold text-xs rounded-xl hover:bg-amber-400 transition-colors"
                >
                  {savingPassword ? "Actualizando..." : "Actualizar Contraseña"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowChangePassword(false)}
                  className="px-3 py-2 text-xs text-stone-400 hover:text-white"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
          {passwordSaved && (
            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
              <CheckCircle size={13} /> Contraseña cambiada con éxito
            </p>
          )}
        </div>

        {/* Logout button */}
        <div className="pt-4 border-t border-stone-800 flex justify-end">
          <button
            type="button"
            onClick={() => { logout(); router.push("/login"); }}
            className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut size={15} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
}
