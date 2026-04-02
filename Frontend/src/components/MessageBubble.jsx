import "./MessageBubble.css";

/* ── Status icons (chulitos) ── */
const StatusIcon = ({ status }) => {
  if (!status) return null;
  if (status === "READ") {
    return (
      <span className="msg-status read" title="Leído">
        <svg width="14" height="10" viewBox="0 0 16 10" fill="none">
          <path d="M1 5l3.5 3.5L11.5 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5 5l3.5 3.5L15.5 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    );
  }
  if (status === "DELIVERED") {
    return (
      <span className="msg-status delivered" title="Entregado">
        <svg width="14" height="10" viewBox="0 0 16 10" fill="none">
          <path d="M1 5l3.5 3.5L11.5 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5 5l3.5 3.5L15.5 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    );
  }
  return (
    <span className="msg-status sent" title="Enviado">
      <svg width="10" height="10" viewBox="0 0 12 10" fill="none">
        <path d="M1 5l3.5 3.5L11 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
  );
};

const FilePreview = ({ fileUrl, fileType }) => {
  if (!fileUrl) return null;
  const isImage = fileType?.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileUrl);
  if (isImage) {
    return (
      <div className="msg-image-wrap">
        <img
          src={fileUrl}
          alt="imagen"
          className="msg-image"
          onClick={() => window.open(fileUrl, "_blank")}
          onError={(e) => { e.target.style.display = "none"; }}
        />
      </div>
    );
  }
  const filename = fileUrl.split("/").pop() || "archivo";
  return (
    <a className="msg-file" href={fileUrl} target="_blank" rel="noopener noreferrer">
      <span className="msg-file-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
      </span>
      <span className="msg-file-name">{filename}</span>
      <span className="msg-file-dl">↓</span>
    </a>
  );
};

const fmtTime = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
};

export default function MessageBubble({ message, isOwn, grouped }) {
  const { content, fileUrl, fileType, status, sender, createdAt } = message;
  const senderName = sender?.username ?? message.senderName ?? (isOwn ? "Tú" : "Usuario");

  return (
    <div className={`msg-row ${isOwn ? "own" : "other"} ${grouped ? "grouped" : ""}`}>
      {!isOwn && !grouped && (
        <div className="msg-avatar">{senderName.slice(0, 1).toUpperCase()}</div>
      )}
      {!isOwn && grouped && <div className="msg-avatar-spacer" />}

      <div className="msg-body">
        {!isOwn && !grouped && <span className="msg-sender">{senderName}</span>}

        <div className={`msg-bubble ${isOwn ? "bubble-own" : "bubble-other"}`}>
          <FilePreview fileUrl={fileUrl} fileType={fileType} />
          {content && <p className="msg-text">{content}</p>}
          <div className="msg-meta">
            <span className="msg-time">{fmtTime(createdAt)}</span>
            {isOwn && <StatusIcon status={status} />}
          </div>
        </div>
      </div>
    </div>
  );
}
