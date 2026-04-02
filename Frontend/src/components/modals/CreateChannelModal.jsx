import { useState } from "react";
import { channelsAPI } from "../../api/client";

export default function CreateChannelModal({ groupId, onClose, onCreated }) {
  const [name,  setName]  = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim().toLowerCase().replace(/\s+/g, "-");
    if (!trimmed) { setError("El nombre es requerido"); return; }
    setLoading(true);
    setError("");
    try {
      const { data } = await channelsAPI.create(groupId, { name: trimmed });
      onCreated(data);
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo crear el canal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Nuevo canal</span>
          <button className="btn-icon" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Nombre del canal</label>
            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
                color: "var(--accent)", fontFamily: "JetBrains Mono, monospace", fontSize: 14, pointerEvents: "none"
              }}>#</span>
              <input
                className="input"
                style={{ paddingLeft: 24 }}
                type="text"
                placeholder="general"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
              />
            </div>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
              Los espacios se reemplazan por guiones
            </span>
          </div>
        </form>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} type="button">Cancelar</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="spinner" /> : "Crear canal"}
          </button>
        </div>
      </div>
    </div>
  );
}
