"use client"

import { useEffect, useState } from "react"
import { Loader2, Settings, Save, KeyRound, MessageCircle, Eye, EyeOff } from "lucide-react"

export function SettingsTab() {
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPasswords, setShowPasswords] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    function loadSettings() {
      fetch("/api/admin/settings")
        .then((res) => res.json())
        .then((data) => setWhatsappNumber(data.whatsappNumber || ""))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false))
    }
    loadSettings()
    window.addEventListener("nostra-dashboard-refresh", loadSettings)
    return () => window.removeEventListener("nostra-dashboard-refresh", loadSettings)
  }, [])

  async function handleSaveWhatsapp(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaveMessage("")
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsappNumber }),
      })
      const data = await res.json()
      if (res.ok) {
        setSaveMessage("Numéro WhatsApp mis à jour avec succès.")
      } else {
        setSaveMessage(data.error || "Erreur lors de la mise à jour.")
      }
    } catch (err) {
      setSaveMessage("Une erreur est survenue.")
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMessage(""), 4000)
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPasswordMessage(null)

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Les nouveaux mots de passe ne correspondent pas." })
      return
    }

    setChangingPassword(true)
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (res.ok) {
        setPasswordMessage({ type: "success", text: "Mot de passe changé avec succès." })
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        setPasswordMessage({ type: "error", text: data.error || "Erreur lors du changement." })
      }
    } catch (err) {
      setPasswordMessage({ type: "error", text: "Une erreur est survenue." })
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-500" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-xl">
      <div className="flex items-center gap-2">
        <Settings className="w-5 h-5 text-neutral-400" />
        <h2 className="text-lg font-semibold">Paramètres du site</h2>
      </div>

      {/* WhatsApp number */}
      <form
        onSubmit={handleSaveWhatsapp}
        className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4"
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-neutral-400" />
          <h3 className="font-medium text-sm">Numéro WhatsApp des commandes</h3>
        </div>
        <p className="text-xs text-neutral-500">
          Ce numéro reçoit toutes les commandes du site (panier et achat direct). Format international sans le +,
          exemple : 212612345678
        </p>
        <input
          type="text"
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ""))}
          placeholder="212612345678"
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neutral-500"
        />
        {saveMessage && <p className="text-xs text-emerald-400">{saveMessage}</p>}
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-white text-black rounded-lg px-4 py-2 text-sm font-medium hover:bg-neutral-200 transition disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Enregistrer
        </button>
      </form>

      {/* Password change */}
      <form
        onSubmit={handleChangePassword}
        className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4"
      >
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-neutral-400" />
          <h3 className="font-medium text-sm">Changer le mot de passe administrateur</h3>
        </div>

        <div className="space-y-3">
          <input
            type={showPasswords ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Mot de passe actuel"
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neutral-500"
            required
          />
          <input
            type={showPasswords ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Nouveau mot de passe (min. 6 caractères)"
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neutral-500"
            required
            minLength={6}
          />
          <input
            type={showPasswords ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirmer le nouveau mot de passe"
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neutral-500"
            required
            minLength={6}
          />
        </div>

        <button
          type="button"
          onClick={() => setShowPasswords(!showPasswords)}
          className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-white transition"
        >
          {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {showPasswords ? "Masquer" : "Afficher"} les mots de passe
        </button>

        {passwordMessage && (
          <p className={`text-xs ${passwordMessage.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
            {passwordMessage.text}
          </p>
        )}

        <button
          type="submit"
          disabled={changingPassword}
          className="flex items-center gap-2 bg-white text-black rounded-lg px-4 py-2 text-sm font-medium hover:bg-neutral-200 transition disabled:opacity-50"
        >
          {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
          Changer le mot de passe
        </button>
      </form>
    </div>
  )
}
