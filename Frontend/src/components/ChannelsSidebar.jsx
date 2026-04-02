import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import CreateChannelModal from "./modals/CreateChannelModal";
import InviteModal from "./modals/InviteModal";
import "./ChannelsSidebar.css";

export default function ChannelsSidebar({
  group,
  channels,
  selectedChannel,
  onSelectChannel,
  onChannelCreated,
  onGroupsRefresh,
}) {
  const { user } = useAuth();
  const [showCreateCh, setShowCreateCh] = useState(false);
  const [showInvite,   setShowInvite]   = useState(false);

  const isAdmin = group?.ownerId === user?.id || group?.role === "ADMIN";

  return (
    <aside className="ch-sidebar">
      {/* Group header */}
      <div className="ch-header">
        <div className="ch-group-name">{group.name}</div>
        {group.description && (
          <p className="ch-group-desc">{group.description}</p>
        )}
        <div className="ch-header-actions">
          {isAdmin && (
            <button
              className="btn btn-ghost ch-invite-btn"
              onClick={() => setShowInvite(true)}
            >
              + Invitar
            </button>
          )}
        </div>
      </div>

      {/* Channels section */}
      <div className="ch-section-label">
        <span>Canales</span>
        <button
          className="btn-icon ch-add-ch"
          title="Nuevo canal"
          onClick={() => setShowCreateCh(true)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>

      <nav className="ch-list">
        {channels.length === 0 && (
          <div className="ch-empty">
            No hay canales aún.{" "}
            <button className="ch-empty-btn" onClick={() => setShowCreateCh(true)}>
              Crear uno
            </button>
          </div>
        )}

        {channels.map((ch) => (
          <div
            key={ch.id}
            className={`ch-item ${selectedChannel?.id === ch.id ? "active" : ""}`}
            onClick={() => onSelectChannel(ch)}
          >
            <span className="ch-hash">#</span>
            <span className="ch-name">{ch.name}</span>
          </div>
        ))}
      </nav>

      {showCreateCh && (
        <CreateChannelModal
          groupId={group.id}
          onClose={() => setShowCreateCh(false)}
          onCreated={(ch) => { onChannelCreated(ch); setShowCreateCh(false); }}
        />
      )}

      {showInvite && (
        <InviteModal
          groupId={group.id}
          onClose={() => setShowInvite(false)}
          onInvited={() => { onGroupsRefresh(); setShowInvite(false); }}
        />
      )}
    </aside>
  );
}
