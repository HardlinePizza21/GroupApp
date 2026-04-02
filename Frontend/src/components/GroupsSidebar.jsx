import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import CreateGroupModal from "./modals/CreateGroupModal";
import "./GroupsSidebar.css";

/* Generates initials avatar color from group id */
const hues = [195, 160, 220, 280, 30, 340, 130];
const avatarColor = (id) => `hsl(${hues[id % hues.length]}, 55%, 45%)`;

export default function GroupsSidebar({
  groups,
  selectedGroup,
  onSelectGroup,
  onGroupCreated,
  loading,
  connected,
}) {
  const { user, logout } = useAuth();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <aside className="groups-sidebar">
      {/* Brand */}
      <div className="gs-brand">
        <div className="gs-logo">G</div>
      </div>

      <div className="gs-divider" />

      {/* Groups list */}
      <nav className="gs-groups">
        {loading && (
          <div className="gs-loading">
            {[1, 2, 3].map((i) => (
              <div key={i} className="gs-avatar gs-skeleton" />
            ))}
          </div>
        )}

        {!loading && groups.map((g) => (
          <div
            key={g.id}
            className={`tooltip-wrap gs-group-item ${selectedGroup?.id === g.id ? "active" : ""}`}
            onClick={() => onSelectGroup(g)}
          >
            <div
              className="gs-avatar"
              style={{ background: avatarColor(g.id) }}
              title={g.name}
            >
              {g.name.slice(0, 2).toUpperCase()}
            </div>
            <span className="tooltip">{g.name}</span>
            {selectedGroup?.id === g.id && <div className="gs-active-bar" />}
          </div>
        ))}

        {/* Add group button */}
        <div className="tooltip-wrap gs-group-item gs-add" onClick={() => setShowCreate(true)}>
          <div className="gs-avatar gs-avatar-add">+</div>
          <span className="tooltip">Crear grupo</span>
        </div>
      </nav>

      {/* Bottom: connection indicator + user avatar + logout */}
      <div className="gs-bottom">
        <div className="tooltip-wrap">
          <div className={`gs-status ${connected ? "online" : "offline"}`} />
          <span className="tooltip">{connected ? "Conectado" : "Desconectado"}</span>
        </div>

        <div className="gs-divider" />

        <div className="tooltip-wrap gs-user">
          <div className="gs-avatar gs-avatar-user">
            {user?.username?.slice(0, 1).toUpperCase() || "?"}
          </div>
          <span className="tooltip">{user?.username}</span>
        </div>

        <div
          className="tooltip-wrap gs-group-item gs-logout"
          onClick={logout}
          title="Cerrar sesión"
        >
          <div className="gs-avatar gs-avatar-logout">↩</div>
          <span className="tooltip">Cerrar sesión</span>
        </div>
      </div>

      {showCreate && (
        <CreateGroupModal
          onClose={() => setShowCreate(false)}
          onCreated={(g) => { onGroupCreated(g); setShowCreate(false); }}
        />
      )}
    </aside>
  );
}
