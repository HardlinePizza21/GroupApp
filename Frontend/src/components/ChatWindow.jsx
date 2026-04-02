import { useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import "./ChatWindow.css";

export default function ChatWindow({ channel, group, messages, loading, onSend }) {
  const { user } = useAuth();
  const bottomRef = useRef(null);

  /* Auto-scroll to latest message */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="cw-root">
      {/* Header */}
      <header className="cw-header">
        <div className="cw-header-left">
          <span className="cw-hash">#</span>
          <span className="cw-channel-name">{channel.name}</span>
        </div>
        <div className="cw-header-right">
          <span className="tag tag-muted mono">{group.name}</span>
        </div>
      </header>

      {/* Messages */}
      <div className="cw-messages">
        {loading && (
          <div className="cw-loading">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="cw-skeleton-msg" style={{ width: `${40 + i * 10}%` }} />
            ))}
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="cw-empty">
            <div className="cw-empty-icon">#</div>
            <p>Este es el inicio de <strong>#{channel.name}</strong></p>
            <span>¡Envía el primer mensaje!</span>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isOwn = msg.senderId === user?.id;
          const prevMsg = messages[idx - 1];
          const grouped = prevMsg &&
            prevMsg.senderId === msg.senderId &&
            (new Date(msg.createdAt) - new Date(prevMsg.createdAt)) < 5 * 60 * 1000;

          return (
            <MessageBubble
              key={msg.id ?? idx}
              message={msg}
              isOwn={isOwn}
              grouped={grouped}
            />
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <MessageInput channelName={channel.name} onSend={onSend} />
    </div>
  );
}
