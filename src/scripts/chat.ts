import { $, onDemo } from "../lib/ui";
import { m } from "../i18n/client";
import { samples } from "../data/samples";
import type { Chat, ChatMessage } from "@engine";

interface Session {
  id: string;
  title: string;
  messages: ChatMessage[];
  chat?: Chat;
}

const KEY = "luz-ai-chat-sessions";

function load(): Session[] {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "[]") as Session[];
    return saved.map(({ id, title, messages }) => ({ id, title, messages }));
  } catch {
    return [];
  }
}

onDemo("chat", ({ root, engine, runner }) => {
  const log = $(root, "#log");
  const select = $<HTMLSelectElement>(root, "#session");
  const message = $<HTMLTextAreaElement>(root, "#message");
  const usage = $<HTMLMeterElement>(root, "#usage");
  const system = samples.chatSystem(engine.language);

  let sessions = load();
  let current: Session;
  const save = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(sessions.map(({ id, title, messages }) => ({ id, title, messages }))));
    } catch {
      /* storage blocked: the history lasts until the page closes */
    }
  };
  const newSession = (messages: ChatMessage[] = [], title = m().chat.sessionTitle(sessions.length + 1)): Session => {
    const s: Session = { id: crypto.randomUUID(), title, messages };
    sessions.push(s);
    return s;
  };
  if (!sessions.length) newSession();
  current = sessions[0]!;

  const bubble = (m: ChatMessage) => {
    const el = log.appendChild(document.createElement("div"));
    el.className = "chat-msg";
    el.dataset.role = m.role;
    el.textContent = m.content;
    return el;
  };
  const renderLog = () => {
    log.replaceChildren(...[]);
    current.messages.forEach(bubble);
    log.scrollTop = log.scrollHeight;
  };
  const renderSelect = () => {
    select.replaceChildren(...sessions.map((s) => new Option(m().chat.sessionOption(s.title, s.messages.length), s.id, false, s === current)));
  };
  const renderUsage = () => {
    const u = current.chat?.usage;
    usage.max = u?.quota || 100;
    usage.value = u?.used ?? 0;
    usage.textContent = u ? m().chat.usage(u.used, u.quota) : "0";
  };
  const show = () => {
    renderSelect();
    renderLog();
    renderUsage();
  };

  /** The model session of a conversation, created on the first message (a click, so the download is allowed). */
  const chatOf = async (s: Session, signal: AbortSignal) =>
    (s.chat ??= await engine.chat({ system, history: s.messages }, signal));

  select.addEventListener("change", () => {
    current = sessions.find((s) => s.id === select.value) ?? current;
    show();
  });
  $(root, "[data-new]").addEventListener("click", () => {
    current = newSession();
    show();
    save();
  });
  $(root, "[data-fork]").addEventListener("click", () => {
    current = newSession([...current.messages], m().chat.forkOf(current.title));
    show();
    save();
  });
  $(root, "[data-delete]").addEventListener("click", () => {
    current.chat?.destroy();
    sessions = sessions.filter((s) => s !== current);
    if (!sessions.length) newSession();
    current = sessions[0]!;
    show();
    save();
  });

  $(root, "[data-form]").addEventListener("submit", (event) => {
    event.preventDefault();
    const text = message.value.trim();
    if (!text) return;
    const session = current;
    message.value = "";
    void runner.run(async (signal) => {
      const chat = await chatOf(session, signal);
      session.messages.push({ role: "user", content: text });
      if (session === current) bubble({ role: "user", content: text });
      const reply: ChatMessage = { role: "assistant", content: "" };
      session.messages.push(reply);
      const el = session === current ? bubble(reply) : null;
      try {
        for await (const chunk of chat.stream(text, { signal })) {
          reply.content += chunk;
          if (el) el.textContent = reply.content;
          if (el) log.scrollTop = log.scrollHeight;
        }
      } finally {
        if (!reply.content) session.messages.pop();
        save();
        if (session === current) {
          renderSelect();
          renderUsage();
        }
      }
    });
  });

  message.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      (root.querySelector("[data-form]") as HTMLFormElement).requestSubmit();
    }
  });

  show();
  return () => sessions.forEach((s) => s.chat?.destroy());
});
