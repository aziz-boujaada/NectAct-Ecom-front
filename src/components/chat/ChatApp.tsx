import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Bot,
  X,
  MessageSquare,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Info,
} from "lucide-react";
import "./ChatApp.css";
import NextaImg from "../../assets/nextaAi.png";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

interface ParsedSection {
  label: string;
  content: string;
  key: string;
}

const SECTION_KEYS = [
  "summary",
  "insights",
  "mistakes",
  "recommendations",
  "conclusion",
] as const;

const SECTION_KEY_SET = new Set(SECTION_KEYS);
const SECTION_HEADER_PATTERN = /^(?:\[(SUMMARY|INSIGHTS|MISTAKES|RECOMMENDATIONS|CONCLUSION)\]|(SUMMARY|INSIGHTS|MISTAKES|RECOMMENDATIONS|CONCLUSION))\s*:?(.*)$/i;

const RESPONSE_FIELDS = ["answer", "response", "message", "content", "text", "result"];

const stripMarkdownArtifacts = (text: string) =>
  text
    .replace(/```+/g, "")
    .replace(/\*\*/g, "")
    .replace(/^\s*###\s*/gm, "")
    .replace(/^\s*[-_*]{3,}\s*$/gm, "")
    .replace(/[ \t]+$/gm, "");

const collapseWhitespace = (text: string) =>
  text.replace(/\r\n?/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

const unwrapQuotedText = (text: string) => {
  const trimmed = text.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
};

function extractTextValue(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => extractTextValue(item))
      .filter(Boolean)
      .join("\n");
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;

    for (const field of RESPONSE_FIELDS) {
      if (field in record) {
        const extracted = extractTextValue(record[field]);
        if (extracted) {
          return extracted;
        }
      }
    }

    const firstString = Object.values(record).find((item) => typeof item === "string");
    if (typeof firstString === "string") {
      return firstString;
    }
  }

  return "";
}

const tryParseJsonText = (text: string): string | null => {
  try {
    const parsed = JSON.parse(text);
    return extractTextValue(parsed);
  } catch {
    return null;
  }
};

const sanitizeResponse = (rawResponse: unknown): string => {
  let text = extractTextValue(rawResponse);

  if (!text) {
    return "";
  }

  const jsonParsed = tryParseJsonText(text.trim());
  if (jsonParsed) {
    text = jsonParsed;
  }

  text = text
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\n")
    .replace(/\\t/g, " ")
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, "\\");

  const malformedWrapperMatch = text.match(
    /^\s*\{\s*(?:answer|response|message|content|text|result)\s*:\s*([\s\S]*)\s*\}\s*$/i,
  );

  if (malformedWrapperMatch) {
    text = malformedWrapperMatch[1];
  }

  text = unwrapQuotedText(text)
    .replace(/^\s*\{+\s*/, "")
    .replace(/\s*\}+\s*$/, "")
    .replace(/^\s*\[+\s*/, "")
    .replace(/\s*\]+\s*$/, "")
    .replace(/\s*"\s*$/, "")
    .replace(/^\s*"\s*/, "");

  text = stripMarkdownArtifacts(text);

  return collapseWhitespace(text);
};

const normalizeSectionKey = (label: string) => label.toLowerCase();

const isSectionKey = (value: string): value is (typeof SECTION_KEYS)[number] =>
  SECTION_KEY_SET.has(value as (typeof SECTION_KEYS)[number]);

const renderInlineText = (text: string) =>
  text.split("\n").map((line, lineIndex, lines) => (
    <React.Fragment key={`${lineIndex}-${line}`}>
      {line}
      {lineIndex < lines.length - 1 && <br />}
    </React.Fragment>
  ));

const splitSectionItems = (content: string, sectionKey: string) => {
  const normalized = sanitizeResponse(content);

  if (!normalized) {
    return [];
  }

  const lines = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (sectionKey === "summary" || sectionKey === "conclusion") {
    return [lines.join(" ") || normalized];
  }

  const bulletLines = lines.filter((line) => /^[•\-–—*]/.test(line));
  if (bulletLines.length > 0) {
    return bulletLines.map((line) => line.replace(/^[•\-–—*]\s*/, "").trim()).filter(Boolean);
  }

  if (lines.length > 1) {
    return lines;
  }

  return normalized
    .split(/(?<=[.!?])\s+(?=[A-Z0-9❌✅•\[])/)
    .map((item) => item.trim())
    .filter(Boolean);
};

export const ChatApp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isLoading, isOpen, showDetails]);

  const parseAIResponse = (text: string): ParsedSection[] => {
    const sections: ParsedSection[] = [];
    const processedText = sanitizeResponse(text);

    if (!processedText) {
      return [];
    }

    const lines = processedText.split("\n");
    let currentSection: ParsedSection | null = null;

    const pushCurrentSection = () => {
      if (!currentSection) {
        return;
      }

      const content = currentSection.content.trim();
      if (content) {
        sections.push({ ...currentSection, content });
      }
    };

    for (const rawLine of lines) {
      const line = rawLine.trim();

      if (!line) {
        if (currentSection) {
          currentSection.content += "\n";
        }
        continue;
      }

      const headerMatch = line.match(SECTION_HEADER_PATTERN);

      if (headerMatch) {
        const label = (headerMatch[1] || headerMatch[2] || "").toUpperCase();
        const remainder = (headerMatch[3] || "").trim();
        const key = normalizeSectionKey(label);

        if (isSectionKey(key)) {
          pushCurrentSection();
          currentSection = {
            label,
            content: remainder,
            key,
          };
          continue;
        }
      }

      if (!currentSection) {
        currentSection = {
          label: "RESPONSE",
          content: line,
          key: "response",
        };
        continue;
      }

      currentSection.content += (currentSection.content ? "\n" : "") + line;
    }

    pushCurrentSection();

    return sections.length > 0 ? sections : [{ label: "RESPONSE", content: processedText, key: "response" }];
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content }),
      });

      if (!response.ok) {
        throw new Error("API Error");
      }

      const data = await response.json();
      const aiText = sanitizeResponse(data);

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content: aiText,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content:
            "[MISTAKES]\nI failed to connect to the ERP backend.\nPlease ensure the service is running at http://127.0.0.1:8000.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderAISection = (section: ParsedSection) => {
    const isMistake = section.key === "mistakes";
    const isRecommendation = section.key === "recommendations";
    const isSummary = section.key === "summary";
    const isConclusion = section.key === "conclusion";
    const isInsights = section.key === "insights";

    if (isSummary || isConclusion) {
      const summaryText = splitSectionItems(section.content, section.key)[0] || section.content;

      return (
        <section key={section.key} className={`ai-section section-${section.key}`}>
          <span className="section-label">{section.label}</span>
          <div className={`section-panel ${isConclusion ? "section-panel-conclusion" : "section-panel-summary"}`}>
            <div className="section-text">{renderInlineText(summaryText)}</div>
          </div>
        </section>
      );
    }

    if (isInsights) {
      const items = splitSectionItems(section.content, section.key);

      return (
        <section key={section.key} className={`ai-section section-${section.key}`}>
          <span className="section-label">{section.label}</span>
          <ul className="section-list section-list-insights">
            {items.map((item, index) => (
              <li key={`${section.key}-${index}`} className="section-list-item">
                {renderInlineText(item)}
              </li>
            ))}
          </ul>
        </section>
      );
    }

    if (isMistake || isRecommendation) {
      const lines = splitSectionItems(section.content, section.key);
      return (
        <section key={section.key} className={`ai-section section-${section.key}`}>
          <span className="section-label">{section.label}</span>
          <div className="section-items-container">
            {lines.map((line, i) => (
              <div
                key={i}
                className={isMistake ? "mistake-item" : "recommendation-item"}
              >
                {isMistake ? (
                  <AlertCircle size={14} />
                ) : (
                  <CheckCircle2 size={14} />
                )}
                <span>{renderInlineText(line)}</span>
              </div>
            ))}
          </div>
        </section>
      );
    }

    return (
      <section key={section.key} className={`ai-section section-${section.key}`}>
        <span className="section-label">{section.label}</span>
        <div className="section-panel section-panel-generic">{renderInlineText(section.content)}</div>
      </section>
    );
  };

  return (
    <>
      <button
        className={`floating-chat-btn ${isOpen ? "active" : ""}`}
        onClick={() => {
          setIsOpen(!isOpen);
          if (isOpen) setShowDetails(false);
        }}
        title="ERP AI Assistant"
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </button>

      {isOpen && (
        <div className="chat-modal-overlay" onClick={() => {
          setIsOpen(false);
          setShowDetails(false);
        }}>
          <div
            className="chat-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="chat-header">
              <div className="header-main">
                <div className="header-info">
                  <img 
                    src={NextaImg} 
                    alt="nexta ai image" 
                    className={`nexta-logo clickable ${showDetails ? "active" : ""}`}
                    onClick={() => setShowDetails(!showDetails)}
                    title={showDetails ? "Return to Chat" : "View AI Details"}
                  />
                  <div className="header-text">
                    <h2>Nexta AI</h2>
                    {showDetails && <span className="details-badge">Details</span>}
                  </div>
                </div>
                <button className="close-btn" onClick={() => {
                  setIsOpen(false);
                  setShowDetails(false);
                }}>
                  <X size={18} />
                </button>
              </div>
              {!showDetails && (
                <div className="header-helper">
                  <Info size={12} />
                  <p>
                    Use exact keywords like <span>sales</span>,{" "}
                    <span>inventory</span>, <span>financial</span>,{" "}
                    <span>purchasing</span>, or <span>devis</span> to get more
                    accurate results.
                  </p>
                </div>
              )}
            </div>

            {showDetails ? (
              <div className="nexta-details-view">
                <div className="details-content">
                  <div className="details-hero">
                    <img src={NextaImg} alt="Nexta AI Large" className="details-logo-large" />
                    <h1>Nexta AI Assistant</h1>
                    <p className="details-tagline">The future of ERP Intelligence</p>
                  </div>

                  <div className="details-mission">
                    <p>
                      Nexta AI is designed to bridge the gap between complex business data and 
                      human decision-making. By leveraging advanced LLMs, we transform raw ERP 
                      entries into meaningful narratives.
                    </p>
                  </div>
                  
                  <div className="details-features">
                    <h3>Capabilities</h3>
                    <div className="feature-grid">
                      <div className="feature-card">
                        <div className="feature-icon-wrapper">
                          <MessageSquare size={24} />
                        </div>
                        <div className="feature-info">
                          <h4>Natural Interaction</h4>
                          <p>Communicate with your ERP using natural language queries. No complex filters required.</p>
                        </div>
                      </div>
                      <div className="feature-card">
                        <div className="feature-icon-wrapper">
                          <CheckCircle2 size={24} />
                        </div>
                        <div className="feature-info">
                          <h4>Actionable Insights</h4>
                          <p>Receive strategic recommendations based on your real-time business performance.</p>
                        </div>
                      </div>
                      <div className="feature-card">
                        <div className="feature-icon-wrapper">
                          <AlertCircle size={24} />
                        </div>
                        <div className="feature-info">
                          <h4>Anomaly Detection</h4>
                          <p>Automatically identify inconsistencies, stock-outs, and financial outliers.</p>
                        </div>
                      </div>
                      <div className="feature-card">
                        <div className="feature-icon-wrapper">
                          <Bot size={24} />
                        </div>
                        <div className="feature-info">
                          <h4>Module Expertise</h4>
                          <p>Deep vertical knowledge across Sales, Inventory, Purchasing, and Financials.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="details-footer">
                    <button className="back-to-chat-btn" onClick={() => setShowDetails(false)}>
                      <Bot size={20} />
                      Return to Chat
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="chat-messages">
                  {messages.length === 0 && (
                    <div className="empty-chat">
                      <Bot size={48} className="empty-icon" />
                      <h3>Welcome to ERP Assistant</h3>
                      <p>
                        Ask me about your business data, analytics, or stock levels.
                      </p>
                      <p>the messages will be removed after a session .</p>
                    </div>
                  )}
                  {messages.map((msg) => (
                    <div key={msg.id} className={`message ${msg.role}`}>
                      {msg.role === "user" ? (
                        <div className="user-text">{renderInlineText(msg.content)}</div>
                      ) : (
                        <div className="ai-message-body">
                          {parseAIResponse(msg.content).map((section) => renderAISection(section))}
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="typing">
                      <div className="dot"></div>
                      <div className="dot"></div>
                      <div className="dot"></div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="chat-input-area">
                  <textarea
                    className="chat-input"
                    placeholder="Type your ERP query..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    rows={1}
                  />
                  <button
                    className="send-btn"
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <Send size={20} />
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
