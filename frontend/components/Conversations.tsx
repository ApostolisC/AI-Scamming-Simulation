  "use client";

  import { useState, useEffect, useRef } from "react";
  import { Button } from "@/components/ui/button";
  import { Textarea } from "@/components/ui/textarea";
  import { Card } from "@/components/ui/card";
  import { Trash2, Pencil, Palette } from "lucide-react";
  import { useTheme } from "@/contexts/ThemeContext";
  import { API_CONFIG, getAuthHeaders, createApiUrl } from "@/lib/api-config";

  import { Conversation, Message, createConversation } from "@/lib/storage";

  export default function Page() {
    const { colorTheme } = useTheme();
    const [serverConnected, setServerConnected] = useState<boolean | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
    const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
    const [editedTitle, setEditedTitle] = useState<string>("");

    const [scammerText, setScammerText] = useState("");
    const [userReplyText, setUserReplyText] = useState("");

    const messageEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      /**
       * Checks the connection to the backend server by sending a health check request.
       * Updates the `serverConnected` state based on the server's response.
       * If the server responds with a successful status, sets `serverConnected` to true.
       * If the request fails or the server is unreachable, sets `serverConnected` to false.
       *
       * @async
       * @function
       * @returns {Promise<void>} A promise that resolves when the server check is complete.
       */
      const checkServer = async () => {
        try {
          const res = await fetch(createApiUrl(API_CONFIG.ENDPOINTS.HEALTH));
          setServerConnected(res.ok);
        } catch {
          setServerConnected(false);
        }
      };
      checkServer();
      const interval = setInterval(checkServer, 5000);
      return () => clearInterval(interval);
    }, []);

    useEffect(() => {
      const loadFromStorage = () => {
        const saved = localStorage.getItem("conversations");
        if (saved) setConversations(JSON.parse(saved));
      };

      loadFromStorage(); // initial load

      // Listen for changes from other pages
      const handleStorage = (e: StorageEvent) => {
        if (e.key === "conversations") {
          loadFromStorage();
        }
      };

      window.addEventListener("storage", handleStorage);
      return () => window.removeEventListener("storage", handleStorage);
    }, []);

    useEffect(() => {
      localStorage.setItem("conversations", JSON.stringify(conversations));
    }, [conversations]);

    useEffect(() => {
      if (messageEndRef.current) {
        messageEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, [conversations]);

    const writeToConsole = (message: string) => {
      const consoleOutput = document.getElementById("console-output");
      if (consoleOutput) {
        consoleOutput.innerHTML += `<p class="text-gray-600">${message}</p>`;
        consoleOutput.scrollTop = consoleOutput.scrollHeight; // scroll to bottom
      }
    };

    const createConversationFunction = () => {
      const newConv = createConversation(null, null);
      setConversations((prev) => [...prev, newConv]);
      setSelectedConvId(newConv.id);
      setEditingTitleId(newConv.id);
      setEditedTitle(newConv.title);
      
      /* write message to div with id console-output*/
      writeToConsole(`New conversation created: ${newConv.title}`);
    };

    const deleteConversation = (id: string) => {
      const confirmed = confirm("Are you sure you want to delete this conversation?");
      if (confirmed) {
        setConversations(conversations.filter((c) => c.id !== id));
        if (selectedConvId === id) setSelectedConvId(null);
      }

      writeToConsole(`Conversation deleted: ${id}`);
    };

    const renameConversation = (id: string) => {
      const newTitle = editedTitle.trim();
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: newTitle || c.title } : c))
      );
      setEditingTitleId(null);

      writeToConsole(`Conversation renamed: ${id} to ${newTitle}`);
    };

    const selectedConversation = conversations.find((c) => c.id === selectedConvId);

    const addMessage = (sender: "scammer" | "user", text: string) => {
      if (!selectedConvId || !text.trim()) return;

      const newMessage: Message = {
        id: Date.now().toString(),
        sender,
        text,
        timestamp: Date.now(),
        title: null
      };

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConvId
            ? { ...conv, messages: [...conv.messages, newMessage] }
            : conv
        )
      );

      writeToConsole(`New message added from ${sender}: ${text}`);


    };

    const handleScammerSubmit = () => {
      addMessage("scammer", scammerText);
      setScammerText("");
      setUserReplyText("");
    };

    const handleUserReplySubmit = () => {
      addMessage("user", userReplyText);
      setUserReplyText("");
    };

    const generateReply = async () => {
      writeToConsole("Generating reply...");

      if (!selectedConvId) return;

      const selected = conversations.find((c) => c.id === selectedConvId);
      if (!selected || selected.messages.length === 0) return;

      try {

        // create a big loading circle in the center of the screen
        setUserReplyText("Generating reply...");
        document.body.style.cursor = "wait";
        if (messageEndRef.current) {
          messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }

        const res = await fetch(createApiUrl(API_CONFIG.ENDPOINTS.GENERATE_REPLY), {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            conversation: selected.messages.map((msg) => ({
              role: msg.sender === "scammer" ? "scammer" : "user",
              content: msg.text,
            })),
          }),
        });

        if (!res.ok) throw new Error("Failed to generate reply");

        const data = await res.json();
        setUserReplyText(data.reply || "(No reply generated)");

        writeToConsole(`Reply generated: ${data.reply}`);

      } catch (error) {
        console.error("Error generating reply:", error);
        setUserReplyText("(Error generating reply)");

        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        writeToConsole(`Error generating reply: ${errorMessage}`);
        
      } finally {
        document.body.style.cursor = "default";
        if (messageEndRef.current) {
          messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
        
      }
    };

    const renderMessageList = () => {
      if (!selectedConversation) {
        return <p className="text-center text-gray-500 mt-[10px]">No conversation selected</p>;
      }
      
      if (selectedConversation.messages.length === 0) {
        return <p className="text-center text-gray-400 italic">No messages yet</p>;
      }
      
      return selectedConversation.messages.map((msg) => (
        <div
          key={msg.id ?? `${msg.timestamp}-${msg.title}`}
          className={`message-container ${
            msg.sender === "scammer" ? "message-left" : "message-right"
          }`}
        >
          <div
            className={`message-bubble ${
              msg.sender === "scammer"
                ? "message-bubble-scammer"
                : "message-bubble-user"
            }`}
          >
            <p className="message-text">{msg.text}</p>
            <span className={`message-timestamp ${
              msg.sender === "scammer" ? "timestamp-left" : "timestamp-right"
            }`}>
              {new Date(msg.timestamp).toLocaleString()}
            </span>
          </div>
        </div>
      ));
    };

    
    return (
      <main className="flex min-h-9/10 bg-gray-100 p-6">
        {/* Sidebar */}
        <aside className="sidebar bg-white p-4 shadow-md rounded-lg mr-6 w-80">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Conversations</h2>
          </div>
          <Button onClick={createConversationFunction} className="mb-4 w-full">
            + New Conversation
          </Button>
          <ul>
            {conversations.map((conv) => (
              <li
                key={conv.id}
                className={`group relative cursor-pointer p-2 rounded flex items-center justify-between ${
                  conv.id === selectedConvId
                    ? "bg-blue-200 font-semibold"
                    : "hover:bg-gray-200"
                }`}
              >
                {editingTitleId === conv.id ? (
                  <input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onBlur={() => renameConversation(conv.id)}
                    onKeyDown={(e) => e.key === "Enter" && renameConversation(conv.id)}
                    autoFocus
                    className="flex-1 p-1 border rounded text-sm"
                  />
                ) : (
                  <button
                    onClick={() => {
                      setSelectedConvId(conv.id);
                      setEditedTitle(conv.title);
                    }}
                    className="flex-1 truncate text-left"
                  >
                    {conv.title}
                  </button>
                )}
                <div className="flex gap-1 ml-2">
                  <Pencil
                    className="w-4 h-4 text-gray-500 hover:text-blue-600"
                    onClick={() => {
                      setEditingTitleId(conv.id);
                      setEditedTitle(conv.title);
                    }}
                  />
                  <Trash2
                    className="w-4 h-4 text-red-500 hover:text-red-700"
                    onClick={() => deleteConversation(conv.id)}
                  />
                </div>
              </li>
            ))}
          </ul>
          {conversations.length === 0 && (
            <p className="text-sm text-gray-500 text-center mt-4">No conversations yet.</p>
          )}
        </aside>

        {/* Main Content */}
        <section className="flex-1 max-w-[1200px] mx-auto flex flex-col w-full">
          <Card className="convo bg-white p-6 flex-1 flex flex-col">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold mb-2">Email Conversation</h1>
              <br />
              <p className="text-sm text-gray-500">Scammer & reply message flow</p>
              <br />
              {(() => {
                let serverStatus;
                let statusClass;
                
                if (serverConnected === null) {
                  serverStatus = "Checking...";
                  statusClass = "server-status-checking";
                } else if (serverConnected) {
                  serverStatus = "Connected";
                  statusClass = "server-status-connected";
                } else {
                  serverStatus = "Disconnected";
                  statusClass = "server-status-disconnected";
                }
                
                return (
                  <div className="flex justify-center items-center mt-2 text-sm">
                    <span className="mr-2 font-semibold">Server: </span>
                    <span className={`server-status-badge ${statusClass}`}>
                      {serverStatus}
                    </span>
                  </div>
                );
              })()}
            <br />
            </div>

            {/* Message List */}
            <div
              className="message-list-container flex-1 overflow-scroll max-h-90 border border-gray-300 p-4 mb-6 rounded bg-gray-50"
              style={{ minHeight: "200px" }}
            >
              {renderMessageList()}
              <div ref={messageEndRef} />
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <div>
                <label htmlFor="scammer-email" className="block mb-1 font-semibold">Scammer Email</label>
                <Textarea
                  id="scammer-email"
                  placeholder="Paste scammer email here..."
                  rows={4}
                  value={scammerText}
                  onChange={(e) => setScammerText(e.target.value)}
                />
                <div className="flex justify-end mt-2">
                  <Button
                    onClick={handleScammerSubmit}
                    disabled={!scammerText.trim() || !selectedConvId}
                  >
                    Add Scammer Email
                  </Button>
                </div>
              </div>

              <div>
                <label htmlFor="user-reply" className="block mb-1 font-semibold">Your Reply</label>
                <Textarea
                  id="user-reply"
                  placeholder="Write your reply here..."
                  rows={4}
                  value={userReplyText}
                  onChange={(e) => setUserReplyText(e.target.value)}
                />
                <div className="flex justify-between mt-2">
                  <Button onClick={generateReply} disabled={!selectedConvId}>
                    Generate Reply
                  </Button>
                  <Button
                    onClick={handleUserReplySubmit}
                    disabled={!userReplyText.trim() || !selectedConvId}
                  >
                    Add Your Reply
                  </Button>
                </div>
              </div>
            </div>
          </Card>
          
        </section>
    
      </main>
    );
  }
