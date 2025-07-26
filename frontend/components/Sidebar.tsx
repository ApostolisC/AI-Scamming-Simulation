"use client";

import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";

export type ConversationMeta = {
  id: string;
  title: string;
};

export default function Sidebar({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [conversations, setConversations] = useState<ConversationMeta[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("conversations");
    if (stored) setConversations(JSON.parse(stored));
  }, []);

  const createConversation = () => {
    const newConv: ConversationMeta = {
      id: uuidv4(),
      title: `Conversation ${conversations.length + 1}`,
    };
    const updated = [...conversations, newConv];
    setConversations(updated);
    localStorage.setItem("conversations", JSON.stringify(updated));
    onSelect(newConv.id);
  };

  return (
    <aside className={'sidebar'}>
      <h2>Conversations</h2>
      <Button onClick={createConversation}>
        + New Conversation
      </Button>
      <ul>
        {conversations.map((conv) => (
          <li
            key={conv.id}
            className={selectedId === conv.id ? "active" : ""}
            onClick={() => onSelect(conv.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onSelect(conv.id);
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`Select conversation ${conv.title}`}
          >
            {conv.title}
          </li>
          
        ))}
      </ul>
      {conversations.length === 0 && (
        <p>No conversations yet.</p>
      )}
    </aside>
  );
}