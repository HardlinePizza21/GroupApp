import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";
import { groupsAPI, channelsAPI, messagesAPI } from "../api/client";
import GroupsSidebar from "../components/GroupsSidebar";
import ChannelsSidebar from "../components/ChannelsSidebar";
import ChatWindow from "../components/ChatWindow";
import "./ChatPage.css";

export default function ChatPage() {
  const { token } = useAuth();

  /* ── State ── */
  const [groups,         setGroups]         = useState([]);
  const [selectedGroup,  setSelectedGroup]  = useState(null);
  const [channels,       setChannels]       = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [messages,       setMessages]       = useState([]);
  const [connected,      setConnected]      = useState(false);
  const [loadingGroups,  setLoadingGroups]  = useState(true);
  const [loadingMsgs,    setLoadingMsgs]    = useState(false);

  /* Track which channels we've already joined via socket */
  const joinedChannels = useRef(new Set());

  /* ── Socket ── */
  const { joinChannel, sendMessage } = useSocket({
    token,
    onConnect:    () => setConnected(true),
    onDisconnect: () => setConnected(false),
    onMessage: useCallback((msg) => {
      setMessages((prev) => {
        // Avoid duplicates (if also loaded via REST)
        if (prev.find((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    }, []),
  });

  /* ── Load groups on mount ── */
  useEffect(() => {
    groupsAPI
      .list()
      .then(({ data }) => setGroups(data))
      .catch(console.error)
      .finally(() => setLoadingGroups(false));
  }, []);

  /* ── Load channels when group changes ── */
  useEffect(() => {
    if (!selectedGroup) return;
    setChannels([]);
    setSelectedChannel(null);
    setMessages([]);
    channelsAPI
      .list(selectedGroup.id)
      .then(({ data }) => {
        setChannels(data);
        if (data.length > 0) setSelectedChannel(data[0]);
      })
      .catch(console.error);
  }, [selectedGroup]);

  /* ── Load messages + join socket room when channel changes ── */
  useEffect(() => {
    if (!selectedChannel) return;
    setLoadingMsgs(true);
    setMessages([]);

    // Join socket room (only once per channel)
    if (!joinedChannels.current.has(selectedChannel.id)) {
      joinChannel(selectedChannel.id);
      joinedChannels.current.add(selectedChannel.id);
    }

    // Load history from REST
    messagesAPI
      .list(selectedChannel.id)
      .then(({ data }) => setMessages(Array.isArray(data) ? data : data.messages || []))
      .catch(() => setMessages([]))   // Endpoint may not exist yet — fail gracefully
      .finally(() => setLoadingMsgs(false));
  }, [selectedChannel, joinChannel]);

  /* ── Callbacks ── */
  const handleGroupCreated = (group) => setGroups((g) => [...g, group]);
  const handleChannelCreated = (ch)  => {
    setChannels((c) => [...c, ch]);
    setSelectedChannel(ch);
  };

  const handleSend = useCallback(async (content, file) => {
    if (!selectedChannel) return;

    if (file) {
      // File → REST (so it gets stored with S3/local URL)
      const fd = new FormData();
      if (content) fd.append("content", content);
      fd.append("file", file);
      try {
        const { data } = await messagesAPI.send(selectedChannel.id, fd);
        setMessages((prev) => [...prev, data]);
      } catch (err) {
        console.error("Error sending file:", err);
      }
    } else if (content.trim()) {
      // Text → Socket.IO for real-time delivery
      sendMessage(selectedChannel.id, content);
    }
  }, [selectedChannel, sendMessage]);

  return (
    <div className="chat-root">
      <GroupsSidebar
        groups={groups}
        selectedGroup={selectedGroup}
        onSelectGroup={setSelectedGroup}
        onGroupCreated={handleGroupCreated}
        loading={loadingGroups}
        connected={connected}
      />

      {selectedGroup ? (
        <ChannelsSidebar
          group={selectedGroup}
          channels={channels}
          selectedChannel={selectedChannel}
          onSelectChannel={setSelectedChannel}
          onChannelCreated={handleChannelCreated}
          onGroupsRefresh={() =>
            groupsAPI.list().then(({ data }) => setGroups(data)).catch(console.error)
          }
        />
      ) : (
        <div className="chat-empty-sidebar">
          <span>Selecciona un grupo</span>
        </div>
      )}

      {selectedChannel ? (
        <ChatWindow
          channel={selectedChannel}
          group={selectedGroup}
          messages={messages}
          loading={loadingMsgs}
          onSend={handleSend}
        />
      ) : (
        <div className="chat-empty-main">
          <div className="chat-empty-icon">💬</div>
          <h2>Selecciona un canal</h2>
          <p>Elige un grupo y un canal para empezar a chatear</p>
        </div>
      )}
    </div>
  );
}
