"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  INITIAL_PROMPTS,
  INITIAL_THREADS,
  MODEL_MAP,
  MODELS,
  QUICK,
  attachmentLabel,
  composeReply,
  previewFrom,
  titleFrom,
  type ChatMessage,
  type ContextMode,
  type ContextTag,
  type ModelId,
  type PanelView,
  type PromptItem,
  type QuickId,
  type Scenario,
  type Sheet,
  type Surface,
  type Theme,
  type Thread,
} from "./data";
import { setTheme, useTheme } from "./theme";

type SendOptions = {
  page?: boolean;
  selection?: boolean;
};

export type EchoStore = {
  surface: Surface;
  setSurface: (surface: Surface) => void;
  scenario: Scenario;
  setScenario: (scenario: Scenario) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  view: PanelView;
  setView: (view: PanelView) => void;
  sheet: Sheet;
  setSheet: (sheet: Sheet) => void;
  signedIn: boolean;
  signIn: () => void;
  draft: string;
  setDraft: (draft: string) => void;
  messages: ChatMessage[];
  threads: Thread[];
  activeThreadId: string | null;
  openThread: (id: string) => void;
  newChat: () => void;
  togglePin: (id: string) => void;
  send: (text?: string, options?: SendOptions) => void;
  pending: boolean;
  enabled: Record<ModelId, boolean>;
  toggleEnabled: (id: ModelId) => void;
  activeModel: ModelId;
  setActiveModel: (id: ModelId) => void;
  compareIds: ModelId[];
  toggleCompare: (id: ModelId) => void;
  continueWith: (id: ModelId) => void;
  contextMode: ContextMode;
  setContextMode: (mode: ContextMode) => void;
  pageOn: boolean;
  togglePage: () => void;
  selectionOn: boolean;
  toggleSelection: () => void;
  attachedLabel: string;
  enterToSend: boolean;
  setEnterToSend: (value: boolean) => void;
  showQuickActions: boolean;
  setShowQuickActions: (value: boolean) => void;
  endpoint: string;
  setEndpoint: (value: string) => void;
  clearHistory: () => void;
  toast: string | null;
  notify: (message: string) => void;
  runQuick: (id: QuickId) => void;
  applyPrompt: (body: string) => void;
  saveDraft: () => void;
  prompts: PromptItem[];
  focusComposer: number;
};

const EchoContext = createContext<EchoStore | null>(null);

function contextTag(page: boolean, selection: boolean): ContextTag {
  if (page && selection) return "both";
  if (page) return "page";
  if (selection) return "selection";
  return "none";
}

export function EchoProvider({ children }: { children: ReactNode }) {
  const [surface, setSurface] = useState<Surface>("sidebar");
  const [scenario, setScenarioState] = useState<Scenario>("reading");
  const theme = useTheme();
  const [view, setView] = useState<PanelView>("chat");
  const [sheet, setSheet] = useState<Sheet>(null);
  const [signedIn, setSignedIn] = useState(true);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [threads, setThreads] = useState<Thread[]>(INITIAL_THREADS);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [enabled, setEnabled] = useState<Record<ModelId, boolean>>({
    claude: true,
    gpt: true,
    gemini: true,
    grok: true,
  });
  const [activeModelState, setActiveModelState] = useState<ModelId>("claude");
  const [compareIds, setCompareIds] = useState<ModelId[]>(["claude"]);
  const [contextMode, setContextModeState] = useState<ContextMode>("ask");
  const [pageOn, setPageOn] = useState(false);
  const [selectionOn, setSelectionOn] = useState(false);
  const [enterToSend, setEnterToSend] = useState(true);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [endpoint, setEndpoint] = useState("https://api.echogpt.live");
  const [toast, setToast] = useState<string | null>(null);
  const [prompts, setPrompts] = useState<PromptItem[]>(INITIAL_PROMPTS);
  const [focusComposer, setFocusComposer] = useState(0);

  const messagesRef = useRef<ChatMessage[]>([]);
  const activeIdRef = useRef<string | null>(null);
  const timer = useRef<number | null>(null);
  const toastTimer = useRef<number | null>(null);
  const threadsRef = useRef(threads);
  threadsRef.current = threads;

  const activeModel = enabled[activeModelState]
    ? activeModelState
    : (MODELS.find((model) => enabled[model.id])?.id ?? "claude");
  const visibleCompare = compareIds.filter((id) => enabled[id]);

  function notify(message: string) {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  }

  function setLive(next: ChatMessage[]) {
    messagesRef.current = next;
    setMessages(next);
  }

  function stopPending() {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
    setPending(false);
  }

  function writeThread(
    id: string,
    nextMessages: ChatMessage[],
    seed: string,
    preview: string,
    modelId: ModelId,
  ) {
    setThreads((prev) => {
      const existing = prev.find((thread) => thread.id === id);
      const thread: Thread = {
        id,
        title: existing?.title ?? titleFrom(seed),
        preview,
        modelId,
        updated: "Now",
        onThisPage: true,
        pinned: existing?.pinned ?? false,
        messages: nextMessages,
      };
      return [thread, ...prev.filter((item) => item.id !== id)];
    });
  }

  function setScenario(next: Scenario) {
    setScenarioState(next);
    setSelectionOn(next === "selection");
  }

  function setContextMode(mode: ContextMode) {
    setContextModeState(mode);
    setPageOn(mode === "page");
  }

  function setActiveModel(id: ModelId) {
    if (!enabled[id]) return;
    setActiveModelState(id);
    setCompareIds([id]);
    setSheet(null);
  }

  function toggleCompare(id: ModelId) {
    if (!enabled[id]) return;
    setCompareIds((prev) => {
      const current = prev.filter((item) => enabled[item]);
      if (current.includes(id)) {
        if (current.length === 1) return current;
        return current.filter((item) => item !== id);
      }
      return [...current, id];
    });
  }

  function toggleEnabled(id: ModelId) {
    const turningOff = enabled[id];
    const onCount = MODELS.filter((model) => enabled[model.id]).length;
    if (turningOff && onCount === 1) {
      notify("Keep at least one model on");
      return;
    }
    const next = { ...enabled, [id]: !enabled[id] };
    setEnabled(next);
    if (!turningOff) return;
    setCompareIds((prev) => {
      const filtered = prev.filter((item) => next[item]);
      if (filtered.length > 0) return filtered;
      const fallback = MODELS.find((model) => next[model.id]);
      return fallback ? [fallback.id] : prev;
    });
    if (activeModelState === id) {
      const fallback = MODELS.find((model) => model.id !== id && next[model.id]);
      if (fallback) setActiveModelState(fallback.id);
    }
  }

  function send(raw?: string, options?: SendOptions) {
    const text = (raw ?? draft).trim();
    if (!text || pending) return;
    if (!signedIn) {
      setSurface("sidebar");
      setView("chat");
      return;
    }
    const page = options?.page ?? pageOn;
    const selection =
      options?.selection ?? (scenario === "selection" && selectionOn);
    const context = contextTag(page, selection);
    const targets = visibleCompare.length > 0 ? visibleCompare : [activeModel];
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      context,
    };
    const withUser = [...messagesRef.current, userMessage];
    setLive(withUser);
    setDraft("");
    setPending(true);
    setSurface("sidebar");
    setView("chat");
    setSheet(null);

    const threadId = activeIdRef.current ?? crypto.randomUUID();
    activeIdRef.current = threadId;
    setActiveThreadId(threadId);

    timer.current = window.setTimeout(() => {
      const assistant: ChatMessage =
        targets.length > 1
          ? {
              id: crypto.randomUUID(),
              role: "assistant",
              content: "",
              compare: targets.map((modelId) => ({
                modelId,
                content: composeReply({ modelId, prompt: text, context }),
              })),
            }
          : {
              id: crypto.randomUUID(),
              role: "assistant",
              modelId: targets[0],
              content: composeReply({
                modelId: targets[0],
                prompt: text,
                context,
              }),
            };
      const next = [...withUser, assistant];
      setLive(next);
      setPending(false);
      writeThread(
        threadId,
        next,
        text,
        previewFrom(assistant),
        targets[0] ?? activeModel,
      );
    }, 680);
  }

  function runQuick(id: QuickId) {
    const action = QUICK.find((item) => item.id === id);
    if (!action || pending) return;
    if (action.needs === "selection" && scenario !== "selection") {
      setSurface("sidebar");
      setView("chat");
      notify("Highlight a passage on the page first");
      return;
    }
    if (action.needs === "page") setPageOn(true);
    if (action.needs === "selection") setSelectionOn(true);
    send(action.prompt, {
      page: action.needs === "page" ? true : pageOn,
      selection: action.needs === "selection" ? true : selectionOn && scenario === "selection",
    });
  }

  function applyPrompt(body: string) {
    setDraft(body);
    setSurface("sidebar");
    setView("chat");
    setSheet(null);
    if (/this page/i.test(body)) setPageOn(true);
    if (/selection/i.test(body)) {
      if (scenario === "selection") setSelectionOn(true);
      else notify("Highlight a passage to give this prompt a selection");
    }
    setFocusComposer((count) => count + 1);
  }

  function saveDraft() {
    const body = draft.trim();
    if (!body) return;
    setPrompts((prev) => [
      {
        id: crypto.randomUUID(),
        title: titleFrom(body),
        body,
        group: "Saved",
      },
      ...prev,
    ]);
    notify("Saved to prompts");
  }

  function openThread(id: string) {
    const thread = threadsRef.current.find((item) => item.id === id);
    if (!thread) return;
    stopPending();
    activeIdRef.current = id;
    setActiveThreadId(id);
    setLive(thread.messages);
    setActiveModelState(thread.modelId);
    setCompareIds([thread.modelId]);
    setView("chat");
    setSurface("sidebar");
    setSheet(null);
    setFocusComposer((count) => count + 1);
  }

  function newChat() {
    stopPending();
    activeIdRef.current = null;
    setActiveThreadId(null);
    setLive([]);
    setDraft("");
    setView("chat");
    setSurface("sidebar");
    setSheet(null);
    setCompareIds([activeModel]);
    setPageOn(contextMode === "page");
    setSelectionOn(scenario === "selection");
    setFocusComposer((count) => count + 1);
  }

  function continueWith(id: ModelId) {
    setActiveModelState(id);
    setCompareIds([id]);
    const note: ChatMessage = {
      id: crypto.randomUUID(),
      role: "note",
      content: `Continued with ${MODEL_MAP[id].name}`,
    };
    const next = [...messagesRef.current, note];
    setLive(next);
    const threadId = activeIdRef.current;
    if (threadId) {
      setThreads((prev) =>
        prev.map((thread) =>
          thread.id === threadId
            ? { ...thread, messages: next, modelId: id, updated: "Now" }
            : thread,
        ),
      );
    }
    notify(`Continuing with ${MODEL_MAP[id].name}`);
  }

  function clearHistory() {
    stopPending();
    setThreads([]);
    activeIdRef.current = null;
    setActiveThreadId(null);
    setLive([]);
    notify("History cleared on this device");
  }

  function signIn() {
    setSignedIn(true);
    setView("chat");
    notify("Signed in");
  }

  const apiRef = useRef({ newChat, setSurface, setView, setFocusComposer });
  apiRef.current = { newChat, setSurface, setView, setFocusComposer };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((!event.ctrlKey && !event.metaKey) || !event.shiftKey || event.repeat) return;
      const key = event.key.toLowerCase();
      if (key === "e") {
        event.preventDefault();
        apiRef.current.setSurface(surface === "sidebar" ? "idle" : "sidebar");
      } else if (key === "k") {
        event.preventDefault();
        apiRef.current.setSurface("sidebar");
        apiRef.current.setView("chat");
        apiRef.current.setFocusComposer((count) => count + 1);
      } else if (key === "m") {
        event.preventDefault();
        apiRef.current.newChat();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [surface]);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const value: EchoStore = {
    surface,
    setSurface,
    scenario,
    setScenario,
    theme,
    setTheme,
    view,
    setView,
    sheet,
    setSheet,
    signedIn,
    signIn,
    draft,
    setDraft,
    messages,
    threads,
    activeThreadId,
    openThread,
    newChat,
    togglePin: (id) =>
      setThreads((prev) =>
        prev.map((thread) =>
          thread.id === id ? { ...thread, pinned: !thread.pinned } : thread,
        ),
      ),
    send,
    pending,
    enabled,
    toggleEnabled,
    activeModel,
    setActiveModel,
    compareIds: visibleCompare.length > 0 ? visibleCompare : [activeModel],
    toggleCompare,
    continueWith,
    contextMode,
    setContextMode,
    pageOn,
    togglePage: () => setPageOn((value) => !value),
    selectionOn,
    toggleSelection: () => setSelectionOn((value) => !value),
    attachedLabel: attachmentLabel(
      pageOn,
      scenario === "selection" && selectionOn,
    ),
    enterToSend,
    setEnterToSend,
    showQuickActions,
    setShowQuickActions,
    endpoint,
    setEndpoint,
    clearHistory,
    toast,
    notify,
    runQuick,
    applyPrompt,
    saveDraft,
    prompts,
    focusComposer,
  };

  return <EchoContext.Provider value={value}>{children}</EchoContext.Provider>;
}

export function useEcho(): EchoStore {
  const value = useContext(EchoContext);
  if (!value) throw new Error("useEcho must be used within EchoProvider");
  return value;
}
