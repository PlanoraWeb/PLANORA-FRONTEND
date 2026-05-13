import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  FiArrowUp,
  FiLink2,
  FiPaperclip,
  FiTerminal,
  FiX,
} from "react-icons/fi";
import api from "../services/authService";
import "../styles/Chat.css";

const PAGE_HINTS = {
  "/dashboard": [
    "Scan active project signals",
    "Summarize blockers from current metrics",
  ],
  "/inbox": [
    "Summarize the selected inbox thread",
    "Draft a follow-up note for the team",
  ],
  "/tasks": [
    "Re-order my focus for today",
    "Highlight urgent issues first",
  ],
  "/projects": [
    "Explain project risk and recent delivery movement",
    "Summarize roadmap implications for the selected project",
  ],
  "/board": [
    "Review drag-and-drop lane changes",
    "Suggest the next task to move forward",
  ],
};

function PlabotMark() {
  return (
    <span className="plabot-mark" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}

function ChatWidget() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const quickContext = useMemo(() => {
    return (
      PAGE_HINTS[location.pathname] || [
        "Review the current workspace context",
        "Draft the next useful step",
      ]
    );
  }, [location.pathname]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const trimmedInput = input.trim();
    const userMessage = {
      role: "user",
      text: trimmedInput,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/chat", {
        message: trimmedInput,
      });

      const botMessage = {
        role: "bot",
        text: res.data?.data?.reply || "No response",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Chat error", err);
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Error: Unable to respond.";

      setMessages((prev) => [...prev, { role: "bot", text: errorMessage }]);
    } finally {
      setLoading(false);
    }
  };

    return (
      <>
      <button className="chat-fab" type="button" onClick={() => setOpen((current) => !current)}>
        <PlabotMark />
      </button>

      {open ? (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-copy">
              <div className="chat-header-icon">
                <PlabotMark />
              </div>
              <div>
                <strong>Plabot</strong>
                <span>Context-aware workspace guide for your team</span>
              </div>
            </div>

            <button
              type="button"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
            >
              <FiX size={16} />
            </button>
          </div>

          <div className="chat-body">
            <div className="chat-system-card">
              <p>I can review the current surface and help move the next delivery step forward.</p>
              <div className="chat-system-steps">
                {quickContext.map((hint, index) => (
                  <div key={hint} className="chat-system-step">
                    <span>{index + 1}</span>
                    <div>{hint}</div>
                  </div>
                ))}
              </div>
            </div>

            {messages.length === 0 ? (
              <div className="chat-activity-log">
                <div className="chat-activity-entry">
                  <FiTerminal size={14} />
                  <span>Ready to inspect this workspace and respond inline.</span>
                </div>
                <div className="chat-activity-entry">
                  <FiLink2 size={14} />
                  <span>Ask for a summary, risk check, or next action recommendation.</span>
                </div>
              </div>
            ) : null}

            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`chat-message ${message.role}`}>
                <div className="chat-message-label">
                  {message.role === "user" ? "You" : "Planora"}
                </div>
                <div>{message.text}</div>
              </div>
            ))}

            {loading ? (
              <div className="chat-loading-card">
                <span className="chat-loading-dots">
                  <i />
                  <i />
                  <i />
                </span>
                Thinking through the current workspace...
              </div>
            ) : null}
          </div>

          <div className="chat-input">
            <button type="button" className="chat-utility-btn" aria-label="Attach context">
              <FiPaperclip size={15} />
            </button>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask Planora to review this workspace..."
              onKeyDown={(event) => event.key === "Enter" && sendMessage()}
            />
            <button type="button" className="chat-send-btn" onClick={sendMessage}>
              <FiArrowUp size={15} />
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default ChatWidget;
