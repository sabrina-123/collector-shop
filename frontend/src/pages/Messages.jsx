import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import api from "../api/api";
import { useAuth } from "../context/AuthContext";

function initials(name = "?") {
  return name.slice(0, 2).toUpperCase();
}

function Messages() {
  const location = useLocation();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadConversations(preferredId) {
    const response = await api.get("conversations/");
    setConversations(response.data);
    const queryId = new URLSearchParams(location.search).get("conversation");
    const wantedId = preferredId || queryId;
    const preferred = response.data.find((item) => String(item.id) === String(wantedId));
    setSelectedConversation(preferred || response.data[0] || null);
  }

  useEffect(() => {
    loadConversations().catch(() => setError("Impossible de charger vos conversations."))
      .finally(() => setLoading(false));
  }, [location.search]);

  async function selectConversation(conversation) {
    setSelectedConversation(conversation);
    try {
      const response = await api.get(`conversations/${conversation.id}/`);
      setSelectedConversation(response.data);
    } catch {
      setError("Impossible d'ouvrir cette conversation.");
    }
  }

  async function sendMessage(event) {
    event.preventDefault();
    if (!selectedConversation || !content.trim()) return;

    try {
      await api.post("messages/", { conversation: selectedConversation.id, content: content.trim() });
      setContent("");
      await loadConversations(selectedConversation.id);
    } catch (requestError) {
      setError(requestError.response?.data?.content?.[0] || "Impossible d'envoyer le message.");
    }
  }

  if (loading) return <p className="page-loading">Ouverture de la messagerie...</p>;

  return (
    <section className="messages-page">
      <aside className="conversation-list">
        <div className="messages-sidebar-header">
          <div><p className="eyebrow">Espace privé</p><h1>Messages</h1></div>
          <span className="message-count">{conversations.length}</span>
        </div>
        <div className="conversation-items">
          {conversations.length ? conversations.map((conversation) => {
            const lastMessage = conversation.messages?.at(-1);
            const isActive = selectedConversation?.id === conversation.id;
            return <button className={isActive ? "conversation-item active" : "conversation-item"} key={conversation.id} onClick={() => selectConversation(conversation)}>
              <span className="conversation-avatar">{initials(conversation.product_title)}</span>
              <span className="conversation-copy"><strong>{conversation.product_title}</strong><small>{lastMessage?.content || "Nouvelle conversation"}</small></span>
              <span className="conversation-arrow">→</span>
            </button>;
          }) : <div className="messages-empty-sidebar">Vos conversations avec les collectionneurs apparaîtront ici.</div>}
        </div>
      </aside>

      <section className="chat">
        {!selectedConversation ? <div className="chat-empty"><span className="chat-empty-mark">✦</span><h2>Votre messagerie</h2><p>Choisissez une conversation pour échanger autour d'une pièce.</p></div> : <>
          <header className="chat-header"><div className="chat-product-mark">{initials(selectedConversation.product_title)}</div><div><p className="eyebrow">Conversation autour de</p><h2>{selectedConversation.product_title}</h2><span>Échange avec un collectionneur</span></div></header>
          {error && <p className="message-error">{error}</p>}
          <div className="messages">
            {selectedConversation.messages?.length ? selectedConversation.messages.map((message) => {
              const isMine = message.sender_username === user?.username;
              return <div className={isMine ? "message-row mine" : "message-row"} key={message.id}><div className="message"><strong>{isMine ? "Vous" : message.sender_username}</strong><p>{message.content}</p><time>{new Date(message.created_at).toLocaleDateString("fr-FR")}</time></div></div>;
            }) : <p className="conversation-placeholder">Commencez la conversation à propos de cette pièce.</p>}
          </div>
          <form className="message-composer" onSubmit={sendMessage}><textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Écrire un message..." rows="1" aria-label="Votre message" /><button type="submit" aria-label="Envoyer le message">↑</button></form>
        </>}
      </section>
    </section>
  );
}

export default Messages;
