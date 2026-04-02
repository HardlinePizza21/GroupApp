import { useState, useRef, useCallback } from "react";
import "./MessageInput.css";

export default function MessageInput({ channelName, onSend }) {
  const [text,    setText]    = useState("");
  const [file,    setFile]    = useState(null);
  const [preview, setPreview] = useState(null);
  const [sending, setSending] = useState(false);
  const fileRef = useRef(null);
  const textRef = useRef(null);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSend = useCallback(async () => {
    if (sending) return;
    if (!text.trim() && !file) return;
    setSending(true);
    try {
      await onSend(text.trim(), file);
      setText("");
      clearFile();
      textRef.current?.focus();
    } finally {
      setSending(false);
    }
  }, [text, file, onSend, sending]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="mi-root">
      {/* File preview strip */}
      {file && (
        <div className="mi-preview">
          {preview
            ? <img src={preview} alt="preview" className="mi-preview-img" />
            : (
              <div className="mi-preview-file">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <span>{file.name}</span>
                <span className="mi-preview-size">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            )
          }
          <button className="mi-preview-clear" onClick={clearFile} title="Quitar archivo">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}

      {/* Input row */}
      <div className="mi-bar">
        {/* Attach button */}
        <button
          className="btn-icon mi-attach"
          onClick={() => fileRef.current?.click()}
          title="Adjuntar archivo"
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
          </svg>
        </button>
        <input ref={fileRef} type="file" hidden onChange={handleFile} accept="image/*,.pdf,.doc,.docx,.txt,.zip" />

        {/* Text input */}
        <textarea
          ref={textRef}
          className="mi-input"
          placeholder={`Mensaje en #${channelName}`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />

        {/* Send button */}
        <button
          className={`btn mi-send ${(text.trim() || file) && !sending ? "active" : ""}`}
          onClick={handleSend}
          disabled={(!text.trim() && !file) || sending}
          type="button"
        >
          {sending
            ? <span className="spinner" style={{ width: 14, height: 14 }} />
            : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            )
          }
        </button>
      </div>
    </div>
  );
}
