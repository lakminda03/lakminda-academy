import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const STORAGE_KEY = "lakminda_assistant_messages_v2";
const WELCOME_ID = "welcome";

const quickActions = [
  { label: "Browse Courses", type: "navigate", value: "/courses" },
  { label: "Open Dashboard", type: "navigate", value: "/dashboard" },
  { label: "Reset Password", type: "navigate", value: "/forgot-password" },
];

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const defaultMessages = [
  {
    id: WELCOME_ID,
    from: "bot",
    text:
      "Lakminda Assistant online. Ask me about courses, progress, account issues, or type /help for commands.",
    actions: quickActions,
  },
];

const scoreIntent = (text, words) => words.reduce((score, word) => score + (text.includes(word) ? 1 : 0), 0);

const detectIntent = (text) => {
  const intents = [
    { id: "greeting", words: ["hello", "hi", "hey", "good morning", "good evening"] },
    { id: "courses", words: ["course", "courses", "learn", "subject", "track"] },
    { id: "certificate", words: ["certificate", "badge", "achievement"] },
    { id: "auth", words: ["login", "sign in", "signup", "sign up", "register"] },
    { id: "forgot_password", words: ["forgot", "reset", "password"] },
    { id: "dashboard", words: ["dashboard", "progress", "lesson"] },
    { id: "contact", words: ["contact", "support", "email", "phone"] },
    { id: "thanks", words: ["thanks", "thank you"] },
  ];

  let winner = { id: "general", score: 0 };
  for (const intent of intents) {
    const score = scoreIntent(text, intent.words);
    if (score > winner.score) {
      winner = { id: intent.id, score };
    }
  }
  return winner.id;
};

const extractGoal = (text) => {
  const match = text.match(/learn\s+([a-z0-9\s+-]{3,30})/i) || text.match(/study\s+([a-z0-9\s+-]{3,30})/i);
  return match ? match[1].trim() : "";
};

const buildResponse = ({ intent, goal, route }) => {
  if (intent === "greeting") {
    return {
      text: "Ready to help. Tell me your goal and weekly study time, and I will suggest a realistic learning plan.",
      actions: quickActions,
    };
  }
  if (intent === "courses") {
    const focus = goal || "your target skill";
    return {
      text: `Recommended next step: shortlist 1-2 courses aligned with ${focus}, then start with the first module this week.`,
      actions: [
        { label: "Open Courses", type: "navigate", value: "/courses" },
        { label: "Build Study Plan", type: "ask", value: "Create a 4-week study plan" },
      ],
    };
  }
  if (intent === "certificate") {
    return {
      text: "To unlock achievements, complete lessons in sequence and keep progress consistent every week.",
      actions: [{ label: "Go to Dashboard", type: "navigate", value: "/dashboard" }],
    };
  }
  if (intent === "auth") {
    return {
      text: "Use Sign In / Sign Up from the login page. Passwords require at least 8 characters.",
      actions: [{ label: "Open Login", type: "navigate", value: "/login" }],
    };
  }
  if (intent === "forgot_password") {
    return {
      text: "Use Forgot Password to receive a reset link. Then set a new password on the reset page.",
      actions: [{ label: "Forgot Password", type: "navigate", value: "/forgot-password" }],
    };
  }
  if (intent === "dashboard") {
    return {
      text: "Track your progress in Dashboard. Complete pending lessons first to keep your momentum strong.",
      actions: [{ label: "Open Dashboard", type: "navigate", value: "/dashboard" }],
    };
  }
  if (intent === "contact") {
    return {
      text: "For direct help, use the Contact page and include your account email plus a short issue summary.",
      actions: [{ label: "Open Contact", type: "navigate", value: "/contact" }],
    };
  }
  if (intent === "thanks") {
    return {
      text: "Anytime. If you want, I can propose a 4-week plan based on your goal.",
      actions: [{ label: "Create a 4-week plan", type: "ask", value: "Create a 4-week study plan" }],
    };
  }
  return {
    text: `I can help with courses, progress, and account issues. You are currently on ${route}.`,
    actions: quickActions,
  };
};

export default function BotWidget() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [goal, setGoal] = useState("");
  const [messages, setMessages] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultMessages;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length ? parsed : defaultMessages;
    } catch {
      return defaultMessages;
    }
  });
  const listRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const capped = messages.slice(-40);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(capped));
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => () => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  }, []);

  const prompt = useMemo(() => (open ? "Assistant" : "Need help?"), [open]);

  const pushBot = (payload) => {
    setIsTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setMessages((prev) => [...prev, { id: makeId(), from: "bot", ...payload }]);
      setIsTyping(false);
    }, 320);
  };

  const runAssistant = (userText) => {
    const lower = userText.toLowerCase().trim();

    if (lower === "/clear") {
      setMessages(defaultMessages);
      return;
    }
    if (lower === "/help") {
      pushBot({
        text: "Commands: /help, /clear. You can also ask for courses, reset password, or dashboard help.",
        actions: quickActions,
      });
      return;
    }

    const foundGoal = extractGoal(userText);
    const nextGoal = foundGoal || goal;
    if (foundGoal) setGoal(foundGoal);

    const intent = detectIntent(lower);
    const response = buildResponse({ intent, goal: nextGoal, route: location.pathname });
    pushBot(response);
  };

  const send = () => {
    const userText = input.trim();
    if (!userText) return;
    setMessages((prev) => [...prev, { id: makeId(), from: "user", text: userText }]);
    setInput("");
    runAssistant(userText);
  };

  const onAction = (action) => {
    if (!action) return;
    if (action.type === "navigate") {
      navigate(action.value);
      setOpen(false);
      return;
    }
    if (action.type === "ask") {
      setInput(action.value);
    }
  };

  return (
    <div className={`bot ${open ? "bot--open" : ""}`}>
      <button className="bot__toggle" onClick={() => setOpen((s) => !s)} type="button">
        {prompt}
      </button>
      {open && (
        <div className="bot__panel">
          <div className="bot__head">Lakminda Assistant</div>
          <div className="bot__messages" ref={listRef}>
            {messages.map((m) => (
              <div key={m.id} className={`bot__message bot__message--${m.from}`}>
                {m.text}
                {m.actions?.length ? (
                  <div className="bot__chips">
                    {m.actions.map((action) => (
                      <button
                        key={`${m.id}-${action.label}`}
                        className="bot__chip"
                        type="button"
                        onClick={() => onAction(action)}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            {isTyping && <div className="bot__typing">Assistant is typing...</div>}
          </div>
          <div className="bot__input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about courses, dashboard, or /help"
              onKeyDown={(e) => (e.key === "Enter" ? send() : null)}
            />
            <button onClick={send} type="button">
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
