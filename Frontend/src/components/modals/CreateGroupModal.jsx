import { useState } from "react";
import { groupsAPI } from "../../api/client";

export default function CreateGroupModal({ onClose, onCreated }) {
  const [form,  setForm]  = useState({ name: "", description: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("El nombre es requerido"); return; }
    setLoading(true);
    setError("");
    try {
      const { data } = await groupsAPI.create(form);
      onCreated(data);
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo crear el grupo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Crear grupo</span>
          <button className="btn-icon" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Nombre del grupo</label>
            <input
              className="input"
              type="text"
              placeholder="Mi grupo"
              value={form.name}
              onChange={set("name")}
              autoFocus
              required
            />
          </div>
          <div className="input-group">
            <label className="input-label">Descripción <span style={{color:"var(--text-muted)"}}>· opcional</span></label>
            <input
              className="input"
              type="text"
              placeholder="¿De qué trata este grupo?"
              value={form.description}
              onChange={set("description")}
            />
          </div>
        </form>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} type="button">Cancelar</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="spinner" /> : "Crear grupo"}
          </button>
        </div>
      </div>
    </div>
  );
}
