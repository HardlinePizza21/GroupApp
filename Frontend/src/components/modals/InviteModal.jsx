import { useState } from "react";
import { groupsAPI } from "../../api/client";

export default function InviteModal({ groupId, onClose, onInvited }) {
  const [value,   setValue]   = useState("");
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) { setError("Ingresa un email o userId"); return; }
    setLoading(true);
    setError("");
    setSuccess("");

    // Send as userId (number) or email (string)
    const payload = /^\d+$/.test(trimmed)
      ? { userId: parseInt(trimmed, 10) }
      : { email: trimmed };

    try {
      await groupsAPI.invite(groupId, payload);
      setSuccess(`✓ Invitación enviada a "${trimmed}"`);
      setValue("");
      setTimeout(onInvited, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo invitar al usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Invitar miembro</span>
          <button className="btn-icon" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {error   && <div className="error-banner">{error}</div>}
        {success && (
          <div style={{
            padding: "10px 14px",
            background: "rgba(52,211,153,0.1)",
            border: "1px solid rgba(52,211,153,0.25)",
            borderRadius: 6,
            color: "var(--success)",
            fontSize: 13,
          }}>
            {success}
          </div>
        )}

        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Email o ID de usuario</label>
            <input
              className="input"
              type="text"
              placeholder="usuario@email.com  ·  o  ·  42"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
            />
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
              El usuario debe estar registrado en GroupsApp
            </span>
          </div>
        </form>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} type="button">Cancelar</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading || !!success}>
            {loading ? <span className="spinner" /> : "Invitar"}
          </button>
        </div>
      </div>
    </div>
  );
}
