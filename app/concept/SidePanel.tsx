"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Switch } from "./bits";
import {
  MODELS,
  MODEL_COLOR,
  MODEL_MAP,
  PAGE,
  QUICK,
  SELECTION,
  contextLabel,
  type ContextMode,
  type ModelId,
  type PromptGroup,
  type QuickId,
  type Thread,
} from "./data";
import { EchoMark, GoogleMark, Icon, type IconName } from "./icons";
import { useEcho } from "./store";

const iconBtn =
  "grid size-8 shrink-0 place-items-center rounded-lg text-[var(--muted)] hover:bg-[var(--raised)] hover:text-[var(--text)]";

const PROMPT_GROUPS: PromptGroup[] = ["Page", "Writing", "Research", "Saved"];

const CONTEXT_COPY: Record<ContextMode, string> = {
  ask: "Page stays off until you or a page action turns it on.",
  page: "New chats include the article. You can still turn it off for one message.",
  selection: "Quote a highlight. The whole page stays off unless you attach it.",
};

export function EchoToast() {
  const { toast } = useEcho();
  if (!toast) return null;
  return (
    <div className="pointer-events-none absolute bottom-3 left-1/2 z-40 -translate-x-1/2 rounded-full bg-[var(--text)] px-3 py-1.5 text-[12px] text-[var(--bg)] shadow-[var(--shadow)]">
      {toast}
    </div>
  );
}

function ModelDot({ id }: { id: ModelId }) {
  return (
    <span
      className="inline-block size-2 shrink-0 rounded-full ring-1 ring-black/15"
      style={{ background: MODEL_COLOR[id] }}
    />
  );
}

function IconButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: IconName;
  onClick: () => void;
}) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className={iconBtn}>
      <Icon name={icon} />
    </button>
  );
}

async function copyText(text: string, notify: (message: string) => void) {
  try {
    await navigator.clipboard.writeText(text);
    notify("Copied");
  } catch {
    notify("Couldn’t copy");
  }
}

export default function SidePanel() {
  const echo = useEcho();
  const thread = echo.threads.find((item) => item.id === echo.activeThreadId) ?? null;
  const heading = !echo.signedIn
    ? "Echo"
    : echo.view === "history"
      ? "History"
      : echo.view === "prompts"
        ? "Prompts"
        : echo.view === "settings"
          ? "Settings"
          : (thread?.title ?? "Echo");

  return (
    <section
      className="echo relative flex h-full min-h-0 w-full flex-col"
      aria-label="EchoGPT side panel"
    >
      <header className="flex shrink-0 items-center gap-1.5 border-b border-[var(--line)] px-2.5 py-2">
        {echo.view === "chat" ? (
          <span className="grid size-8 place-items-center">
            <EchoMark size={22} />
          </span>
        ) : (
          <button
            type="button"
            aria-label="Back to chat"
            onClick={() => echo.setView("chat")}
            className={iconBtn}
          >
            <Icon name="back" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[13px] font-semibold tracking-tight">{heading}</h2>
          {echo.view === "chat" && echo.signedIn ? (
            <p className="truncate text-[11px] text-[var(--faint)]">
              {echo.attachedLabel} · {PAGE.host}
            </p>
          ) : null}
        </div>
        {echo.view === "chat" && echo.signedIn ? (
          <div className="flex items-center">
            <IconButton label="New chat" icon="compose" onClick={echo.newChat} />
            <IconButton label="History" icon="history" onClick={() => echo.setView("history")} />
            <IconButton label="Prompts" icon="prompts" onClick={() => echo.setView("prompts")} />
            <IconButton label="Settings" icon="settings" onClick={() => echo.setView("settings")} />
          </div>
        ) : null}
      </header>

      {!echo.signedIn ? (
        <SignIn />
      ) : (
        <div className="echo-scroll min-h-0 flex-1 overflow-y-auto">
          {echo.view === "chat" ? <Chat /> : null}
          {echo.view === "history" ? <History /> : null}
          {echo.view === "prompts" ? <Prompts /> : null}
          {echo.view === "settings" ? <Settings /> : null}
        </div>
      )}

      {echo.signedIn && echo.view === "chat" ? <Composer /> : null}
      {echo.sheet === "models" ? <ModelSheet /> : null}
      <EchoToast />
    </section>
  );
}

function SignIn() {
  const { signIn } = useEcho();
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
      <EchoMark size={36} />
      <h2 className="mt-4 text-[16px] font-semibold tracking-tight">Sign in to EchoGPT</h2>
      <p className="mt-2 text-[13px] leading-5 text-[var(--muted)]">
        Chats stay on your account. A page is sent only when you attach it.
      </p>
      <button
        type="button"
        onClick={signIn}
        className="mt-5 flex h-10 w-full max-w-[240px] items-center justify-center gap-2.5 rounded-full border border-[#747775] bg-white text-[13px] font-medium text-[#1f1f1f] hover:bg-[#f5f5f5]"
      >
        <GoogleMark size={18} />
        Continue with Google
      </button>
      <button
        type="button"
        onClick={signIn}
        className="mt-2 h-9 w-full max-w-[240px] rounded-full border border-[var(--line)] text-[13px]"
      >
        EchoGPT account
      </button>
    </div>
  );
}

function Chat() {
  const echo = useEcho();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [echo.messages, echo.pending]);

  const onPage = echo.threads.filter((thread) => thread.onThisPage);
  const selectionActions = QUICK.filter((item) => item.needs === "selection");
  const pageActions = QUICK.filter((item) => item.needs === "page");
  const actions =
    echo.scenario === "selection" ? [...selectionActions, ...pageActions] : pageActions;

  return (
    <div className="flex min-h-full flex-col px-3 py-3">
      {echo.messages.length === 0 ? (
        <div className="echo-rise">
          <div className="rounded-[14px] border border-[var(--line)] bg-[var(--raised)] p-3.5">
            <p className="flex items-center gap-2 text-[11px] text-[var(--muted)]">
              <span className="size-1.5 rounded-full bg-[var(--accent)]" />
              On this tab
            </p>
            <h3 className="mt-1.5 text-[15px] font-semibold tracking-tight">{PAGE.title}</h3>
            <p className="mt-1 text-[12px] text-[var(--muted)]">
              {PAGE.site} · {PAGE.read} · {PAGE.date}
            </p>
            <p className="mt-2 text-[12px] leading-5 text-[var(--muted)]">
              Echo reads this page only when you attach it. A highlight is quoted on its own.
            </p>
          </div>

          {echo.scenario === "selection" && echo.selectionOn ? (
            <blockquote className="mt-3 border-l-2 border-[var(--accent)] pl-3 text-[12px] leading-5 text-[var(--muted)]">
              {SELECTION}
            </blockquote>
          ) : null}

          <div className="echo-chips mt-3 flex gap-1.5 overflow-x-auto">
            {actions.map((action) => (
              <ActionChip key={action.id} id={action.id} label={action.label} />
            ))}
          </div>

          {onPage.length > 0 ? (
            <div className="mt-5">
              <p className="px-1 text-[11px] text-[var(--faint)]">Continue on this page</p>
              <div className="mt-1">
                {onPage.map((thread) => (
                  <ThreadButton key={thread.id} thread={thread} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {echo.messages.map((message) => (
            <MessageView key={message.id} message={message} />
          ))}
          {echo.pending ? <Pending /> : null}
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}

function ActionChip({ id, label }: { id: QuickId; label: string }) {
  const { runQuick, pending } = useEcho();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => runQuick(id)}
      className="h-7 shrink-0 rounded-full border border-[var(--line)] px-2.5 text-[12px] text-[var(--text)] hover:bg-[var(--raised)] disabled:opacity-40"
    >
      {label}
    </button>
  );
}

function Pending() {
  const { messages, compareIds, activeModel } = useEcho();
  const last = messages[messages.length - 1];
  const name = MODEL_MAP[compareIds.length === 1 ? (compareIds[0] ?? activeModel) : activeModel].name;
  const label =
    compareIds.length > 1
      ? `Asking ${compareIds.length} models…`
      : last?.context === "page" || last?.context === "both"
        ? `${name} is reading the page…`
        : last?.context === "selection"
          ? `${name} is reading the selection…`
          : `${name} is thinking…`;

  return (
    <div className="echo-rise flex items-center gap-2 text-[12px] text-[var(--muted)]">
      <span className="flex gap-1">
        <span className="echo-dot size-1 rounded-full bg-[var(--muted)]" />
        <span className="echo-dot size-1 rounded-full bg-[var(--muted)]" />
        <span className="echo-dot size-1 rounded-full bg-[var(--muted)]" />
      </span>
      {label}
    </div>
  );
}

function MessageView({
  message,
}: {
  message: ReturnType<typeof useEcho>["messages"][number];
}) {
  const { notify, continueWith } = useEcho();
  if (message.role === "note") {
    return (
      <p className="echo-rise py-1 text-center text-[11px] text-[var(--faint)]">{message.content}</p>
    );
  }

  if (message.role === "user") {
    const label = contextLabel(message.context);
    const showQuote = message.context === "selection" || message.context === "both";
    return (
      <div className="echo-rise ml-auto w-full max-w-[92%]">
        {label ? (
          <p className="mb-1 text-right text-[11px] text-[var(--faint)]">{label}</p>
        ) : null}
        {showQuote ? (
          <blockquote className="mb-1.5 border-l-2 border-[var(--accent)] pl-2 text-[12px] leading-5 text-[var(--muted)]">
            {SELECTION}
          </blockquote>
        ) : null}
        <div className="rounded-[14px] rounded-br-[5px] bg-[var(--user)] px-3 py-2 break-words whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    );
  }

  if (message.compare && message.compare.length > 0) {
    return (
      <div className="echo-rise">
        <p className="mb-2 flex items-center gap-1.5 text-[12px] text-[var(--muted)]">
          {message.compare.map((item) => (
            <ModelDot key={item.modelId} id={item.modelId} />
          ))}
          Same prompt, separate replies
        </p>
        <div className="flex flex-col gap-2">
          {message.compare.map((item) => (
            <article
              key={item.modelId}
              className="rounded-xl border border-[var(--line)] bg-[var(--raised)] p-3"
            >
              <div className="mb-1.5 flex items-center gap-2">
                <ModelDot id={item.modelId} />
                <span className="text-[12px] font-medium">{MODEL_MAP[item.modelId].name}</span>
                <span className="text-[11px] text-[var(--faint)]">{MODEL_MAP[item.modelId].note}</span>
                <span className="ml-auto flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => continueWith(item.modelId)}
                    className="rounded-full px-2 py-1 text-[12px] font-medium text-[var(--link)] hover:bg-[var(--accent-soft)]"
                  >
                    Continue
                  </button>
                  <button
                    type="button"
                    aria-label={`Copy ${MODEL_MAP[item.modelId].name}`}
                    onClick={() => void copyText(item.content, notify)}
                    className={iconBtn}
                  >
                    <Icon name="copy" size={14} />
                  </button>
                </span>
              </div>
              <p className="text-[13px] leading-5 break-words whitespace-pre-wrap">{item.content}</p>
            </article>
          ))}
        </div>
      </div>
    );
  }

  const model = message.modelId ? MODEL_MAP[message.modelId] : null;
  return (
    <div className="echo-rise">
      <div className="mb-1 flex items-center gap-2">
        {message.modelId ? <ModelDot id={message.modelId} /> : null}
        <span className="text-[12px] font-medium">{model?.name}</span>
        <span className="text-[11px] text-[var(--faint)]">{model?.note}</span>
        <button
          type="button"
          aria-label="Copy reply"
          onClick={() => void copyText(message.content, notify)}
          className={`${iconBtn} ml-auto`}
        >
          <Icon name="copy" size={14} />
        </button>
      </div>
      <p className="text-[13px] leading-5 break-words whitespace-pre-wrap">{message.content}</p>
    </div>
  );
}

function Composer() {
  const echo = useEcho();
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const [slashIndex, setSlashIndex] = useState(0);
  const [slashHidden, setSlashHidden] = useState(false);
  const slashQuery =
    echo.draft.startsWith("/") && !echo.draft.includes("\n")
      ? echo.draft.slice(1).toLowerCase()
      : null;

  const pool = [
    ...QUICK.map((action) => ({
      id: action.id,
      title: action.label,
      hint: action.needs === "page" ? "Page" : "Selection",
      run: () => echo.setDraft(action.prompt),
    })),
    ...echo.prompts.map((prompt) => ({
      id: prompt.id,
      title: prompt.title,
      hint: prompt.group,
      run: () => echo.applyPrompt(prompt.body),
    })),
  ];
  const items = pool
    .filter((item) => {
      if (!slashQuery) return true;
      return `${item.title} ${item.hint}`.toLowerCase().includes(slashQuery);
    })
    .slice(0, 8);
  const menuOpen = slashQuery !== null && !slashHidden;
  const clamped = items.length === 0 ? 0 : Math.min(slashIndex, items.length - 1);

  useEffect(() => {
    setSlashHidden(false);
    setSlashIndex(0);
  }, [echo.draft]);

  useEffect(() => {
    const node = areaRef.current;
    if (!node) return;
    node.style.height = "0px";
    node.style.height = `${Math.min(node.scrollHeight, 112)}px`;
  }, [echo.draft]);

  useEffect(() => {
    if (echo.view !== "chat") return;
    areaRef.current?.focus();
  }, [echo.focusComposer, echo.view]);

  const placeholder = echo.pageOn
    ? "Ask about this page, or type /"
    : echo.scenario === "selection" && echo.selectionOn
      ? "Ask about the selection, or type /"
      : "Ask, or type / for an action";

  const shownModel = echo.compareIds.length === 1 ? echo.compareIds[0] : echo.activeModel;

  return (
    <div className="shrink-0 border-t border-[var(--line)] px-3 pt-2 pb-2.5">
      {echo.messages.length > 0 && echo.showQuickActions ? (
        <div className="echo-chips mb-2 flex gap-1.5 overflow-x-auto">
          {(echo.scenario === "selection"
            ? QUICK
            : QUICK.filter((item) => item.needs === "page")
          ).map((action) => (
            <ActionChip key={action.id} id={action.id} label={action.label} />
          ))}
        </div>
      ) : null}

      {menuOpen ? (
        <div className="echo-scroll mb-2 max-h-48 overflow-y-auto rounded-xl border border-[var(--line)] bg-[var(--raised)]">
          {items.length === 0 ? (
            <p className="px-3 py-2 text-[12px] text-[var(--muted)]">No matching action</p>
          ) : (
            items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onMouseEnter={() => setSlashIndex(index)}
                onClick={item.run}
                className={`flex w-full items-baseline justify-between gap-3 px-3 py-2 text-left ${
                  index === clamped ? "bg-[var(--accent-soft)]" : ""
                }`}
              >
                <span className="truncate">{item.title}</span>
                <span className="shrink-0 text-[11px] text-[var(--faint)]">{item.hint}</span>
              </button>
            ))
          )}
        </div>
      ) : null}

      <div className="rounded-2xl border border-[var(--line)] bg-[var(--raised)] focus-within:border-[var(--link)]">
        <textarea
          ref={areaRef}
          rows={1}
          value={echo.draft}
          placeholder={placeholder}
          aria-label="Message"
          onChange={(event) => echo.setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape" && menuOpen) {
              event.preventDefault();
              setSlashHidden(true);
              return;
            }
            if (menuOpen && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
              event.preventDefault();
              setSlashIndex((current) => {
                const base = items.length === 0 ? 0 : Math.min(current, items.length - 1);
                if (event.key === "ArrowDown") return (base + 1) % Math.max(items.length, 1);
                return (base - 1 + items.length) % Math.max(items.length, 1);
              });
              return;
            }
            if (menuOpen && (event.key === "Enter" || event.key === "Tab") && !event.shiftKey) {
              event.preventDefault();
              const item = items[clamped];
              if (!item) echo.notify("No matching action");
              else item.run();
              return;
            }
            const sendWithEnter = echo.enterToSend
              ? event.key === "Enter" && !event.shiftKey
              : event.key === "Enter" && (event.metaKey || event.ctrlKey);
            if (sendWithEnter) {
              event.preventDefault();
              echo.send();
            }
          }}
          className="max-h-28 min-h-10 w-full resize-none bg-transparent px-3 pt-2.5 text-[13px] outline-none placeholder:text-[var(--faint)]"
        />
        <div className="flex items-center gap-1.5 px-2 pb-2">
          <button
            type="button"
            onClick={() => echo.setSheet("models")}
            className="inline-flex h-7 max-w-[150px] items-center gap-1.5 rounded-full border border-[var(--line)] px-2 text-[12px] hover:bg-[var(--sunken)]"
            aria-label="Choose models"
          >
            {echo.compareIds.length > 1 ? (
              <>
                <span className="flex gap-0.5">
                  {echo.compareIds.slice(0, 3).map((id) => (
                    <ModelDot key={id} id={id} />
                  ))}
                </span>
                <span className="truncate">{echo.compareIds.length} models</span>
              </>
            ) : (
              <>
                {shownModel ? <ModelDot id={shownModel} /> : null}
                <span className="truncate">
                  {shownModel ? MODEL_MAP[shownModel].name : "Model"}
                </span>
              </>
            )}
          </button>
          <ToggleChip
            on={echo.pageOn}
            label="Page"
            pressedLabel="Page attached"
            offLabel="Attach page"
            onClick={echo.togglePage}
            icon="page"
          />
          {echo.scenario === "selection" ? (
            <ToggleChip
              on={echo.selectionOn}
              label="Selection"
              pressedLabel="Selection attached"
              offLabel="Attach selection"
              onClick={echo.toggleSelection}
              icon="bookmark"
            />
          ) : null}
          <span className="flex-1" />
          {echo.draft.trim() ? (
            <button
              type="button"
              onClick={echo.saveDraft}
              className="px-1 text-[12px] text-[var(--muted)] hover:text-[var(--text)]"
            >
              Save
            </button>
          ) : null}
          <button
            type="button"
            aria-label="Send"
            disabled={!echo.draft.trim() || echo.pending}
            onClick={() => echo.send()}
            className="grid size-8 place-items-center rounded-full bg-[var(--accent)] text-[var(--accent-text)] disabled:opacity-40"
          >
            <Icon name="send" size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ToggleChip({
  on,
  label,
  pressedLabel,
  offLabel,
  onClick,
  icon,
}: {
  on: boolean;
  label: string;
  pressedLabel: string;
  offLabel: string;
  onClick: () => void;
  icon: IconName;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? pressedLabel : offLabel}
      onClick={onClick}
      className={`inline-flex h-7 items-center gap-1 rounded-full border px-2 text-[12px] ${
        on
          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--link)]"
          : "border-[var(--line)] text-[var(--muted)] hover:text-[var(--text)]"
      }`}
    >
      <Icon name={icon} size={13} />
      {label}
    </button>
  );
}

function ModelSheet() {
  const echo = useEcho();
  const ref = useRef<HTMLDivElement>(null);
  const enabledModels = MODELS.filter((model) => echo.enabled[model.id]);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-end">
      <button
        type="button"
        aria-label="Close models"
        className="absolute inset-0 bg-black/45"
        onClick={() => echo.setSheet(null)}
      />
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-label="Models"
        onKeyDown={(event) => {
          if (event.key === "Escape") echo.setSheet(null);
          const index = Number(event.key) - 1;
          const model = enabledModels[index];
          if (model) echo.setActiveModel(model.id);
        }}
        className="echo-rise relative max-h-[78%] w-full overflow-y-auto rounded-t-2xl border border-[var(--line)] bg-[var(--bg)] px-3 pt-3 pb-4 shadow-[var(--shadow)] outline-none"
      >
        <div className="mb-2 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold tracking-tight">Models</h3>
            <p className="text-[12px] text-[var(--muted)]">
              Click a name to ask one. Check more than one to compare.
            </p>
          </div>
          <button type="button" aria-label="Close" onClick={() => echo.setSheet(null)} className={iconBtn}>
            <Icon name="close" />
          </button>
        </div>
        <div className="flex flex-col">
          {enabledModels.map((model, index) => {
            const checked = echo.compareIds.includes(model.id);
            return (
              <div key={model.id} className="flex items-center gap-1 border-t border-[var(--line)] py-1">
                <button
                  type="button"
                  aria-pressed={checked}
                  aria-label={`Include ${model.name} in compare`}
                  onClick={() => echo.toggleCompare(model.id)}
                  className={`grid size-8 place-items-center ${checked ? "text-[var(--link)]" : "text-[var(--faint)]"}`}
                >
                  <span
                    className={`grid size-4 place-items-center rounded border ${
                      checked
                        ? "border-transparent bg-[var(--accent)] text-[var(--accent-text)]"
                        : "border-[var(--line)]"
                    }`}
                  >
                    {checked ? <Icon name="check" size={11} /> : null}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => echo.setActiveModel(model.id)}
                  className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1 py-2 text-left hover:bg-[var(--raised)]"
                >
                  <ModelDot id={model.id} />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{model.name}</span>
                    <span className="block text-[12px] text-[var(--muted)]">{model.note}</span>
                  </span>
                </button>
                <span className="w-4 text-center font-mono text-[11px] text-[var(--faint)]">
                  {index + 1}
                </span>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-[12px] text-[var(--muted)]">
          {echo.compareIds.length > 1
            ? `A send will ask ${echo.compareIds.length} models.`
            : `A send will ask ${MODEL_MAP[echo.compareIds[0] ?? echo.activeModel].name}.`}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              echo.setSheet(null);
              echo.setView("settings");
            }}
            className="text-[12px] text-[var(--link)]"
          >
            Manage models
          </button>
          <button
            type="button"
            onClick={() => echo.setSheet(null)}
            className="h-8 rounded-full bg-[var(--accent)] px-3 text-[12px] font-medium text-[var(--accent-text)]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function ThreadButton({ thread, dense = false }: { thread: Thread; dense?: boolean }) {
  const { openThread, togglePin } = useEcho();
  return (
    <div className="flex items-stretch">
      <button
        type="button"
        aria-label={thread.title}
        onClick={() => openThread(thread.id)}
        className="flex min-w-0 flex-1 items-start gap-2 rounded-xl px-1 py-2 text-left hover:bg-[var(--raised)]"
      >
        <span className="mt-1.5">
          <ModelDot id={thread.modelId} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-2">
            <span className="truncate font-medium">{thread.title}</span>
            <span className="shrink-0 text-[11px] text-[var(--faint)]">{thread.updated}</span>
          </span>
          {dense ? null : (
            <span className="block truncate text-[12px] text-[var(--muted)]">{thread.preview}</span>
          )}
        </span>
      </button>
      <button
        type="button"
        aria-label={thread.pinned ? `Unpin ${thread.title}` : `Pin ${thread.title}`}
        aria-pressed={thread.pinned}
        onClick={() => togglePin(thread.id)}
        className={`${iconBtn} mt-1 ${thread.pinned ? "text-[var(--link)]" : ""}`}
      >
        <Icon name="pin" size={14} />
      </button>
    </div>
  );
}

function History() {
  const { threads } = useEcho();
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const matched = q
    ? threads.filter((thread) =>
        `${thread.title} ${thread.preview} ${thread.messages.map((message) => message.content).join(" ")}`
          .toLowerCase()
          .includes(q),
      )
    : threads;
  const groups = q
    ? [{ label: "Results", items: matched }]
    : [
        { label: "On this page", items: matched.filter((thread) => thread.onThisPage) },
        {
          label: "Pinned",
          items: matched.filter((thread) => thread.pinned && !thread.onThisPage),
        },
        {
          label: "Earlier",
          items: matched.filter((thread) => !thread.onThisPage && !thread.pinned),
        },
      ].filter((group) => group.items.length > 0);

  return (
    <div className="px-3 py-3">
      <label className="flex h-9 items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--raised)] px-2.5">
        <Icon name="search" size={14} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search titles and messages"
          aria-label="Search conversations"
          className="w-full bg-transparent text-[13px] outline-none placeholder:text-[var(--faint)]"
        />
      </label>
      {groups.length === 0 ? (
        <p className="px-1 py-8 text-center text-[13px] text-[var(--muted)]">
          {q ? "No conversations match." : "No conversations yet. Ask something about this page."}
        </p>
      ) : (
        groups.map((group) => (
          <section key={group.label} className="mt-4">
            <h3 className="px-1 text-[11px] text-[var(--faint)]">{group.label}</h3>
            {group.items.map((thread) => (
              <ThreadButton key={thread.id} thread={thread} />
            ))}
          </section>
        ))
      )}
    </div>
  );
}

function Prompts() {
  const { prompts, applyPrompt, draft, saveDraft } = useEcho();
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const visible = prompts.filter((prompt) =>
    q ? `${prompt.title} ${prompt.body} ${prompt.group}`.toLowerCase().includes(q) : true,
  );

  return (
    <div className="px-3 py-3">
      <div className="flex items-center gap-2">
        <label className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--raised)] px-2.5">
          <Icon name="search" size={14} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search prompts"
            aria-label="Search prompts"
            className="w-full bg-transparent text-[13px] outline-none placeholder:text-[var(--faint)]"
          />
        </label>
        {draft.trim() ? (
          <button
            type="button"
            onClick={saveDraft}
            className="h-9 shrink-0 rounded-full border border-[var(--line)] px-3 text-[12px]"
          >
            Save draft
          </button>
        ) : null}
      </div>
      {visible.length === 0 ? (
        <p className="px-1 py-8 text-center text-[13px] text-[var(--muted)]">No prompts match.</p>
      ) : (
        PROMPT_GROUPS.map((group) => {
          const items = visible.filter((prompt) => prompt.group === group);
          if (items.length === 0) return null;
          return (
            <section key={group} className="mt-4">
              <h3 className="px-1 text-[11px] text-[var(--faint)]">{group}</h3>
              <div className="mt-1 flex flex-col gap-1.5">
                {items.map((prompt) => (
                  <button
                    key={prompt.id}
                    type="button"
                    onClick={() => applyPrompt(prompt.body)}
                    className="rounded-xl border border-[var(--line)] bg-[var(--raised)] px-3 py-2.5 text-left hover:border-[var(--link)]"
                  >
                    <span className="block font-medium">{prompt.title}</span>
                    <span className="mt-0.5 line-clamp-2 block text-[12px] leading-5 text-[var(--muted)]">
                      {prompt.body}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}

function Settings() {
  const echo = useEcho();
  const [clearArmed, setClearArmed] = useState(false);

  return (
    <div className="px-3 py-3">
      <Section title="Models">
        <p className="px-1 pb-1 text-[12px] leading-5 text-[var(--muted)]">
          Click a name to make it the default. Compare from the model chip in the composer.
        </p>
        {MODELS.map((model) => (
          <div key={model.id} className="flex items-center gap-2 border-t border-[var(--line)] py-2">
            <button
              type="button"
              onClick={() => {
                if (!echo.enabled[model.id]) {
                  echo.notify("Turn the model on first");
                  return;
                }
                echo.setActiveModel(model.id);
              }}
              className="min-w-0 flex-1 text-left"
            >
              <span className="flex items-center gap-2 font-medium">
                <ModelDot id={model.id} />
                {model.name}
                {echo.activeModel === model.id ? (
                  <span className="text-[11px] font-normal text-[var(--link)]">Default</span>
                ) : null}
              </span>
              <span className="mt-0.5 block text-[12px] text-[var(--muted)]">{model.note}</span>
            </button>
            <Switch
              on={echo.enabled[model.id]}
              label={`${echo.enabled[model.id] ? "Disable" : "Enable"} ${model.name}`}
              onClick={() => echo.toggleEnabled(model.id)}
            />
          </div>
        ))}
      </Section>

      <Section title="Page context">
        <div className="flex flex-wrap gap-1.5 py-1">
          {(
            [
              ["ask", "Ask"],
              ["page", "Always page"],
              ["selection", "Selection"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={echo.contextMode === value}
              onClick={() => echo.setContextMode(value)}
              className={`h-7 rounded-full border px-2.5 text-[12px] ${
                echo.contextMode === value
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--link)]"
                  : "border-[var(--line)] text-[var(--muted)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="px-1 pb-2 text-[12px] leading-5 text-[var(--muted)]">
          {CONTEXT_COPY[echo.contextMode]}
        </p>
      </Section>

      <Section title="Composer">
        <SettingRow
          title="Enter sends"
          body="Turn off if you want Enter to add a line. Ctrl+Enter still sends."
        >
          <Switch
            on={echo.enterToSend}
            label="Enter sends"
            onClick={() => echo.setEnterToSend(!echo.enterToSend)}
          />
        </SettingRow>
        <SettingRow title="Quick actions" body="Show Summarize, Explain, and the rest above the composer.">
          <Switch
            on={echo.showQuickActions}
            label="Show quick actions"
            onClick={() => echo.setShowQuickActions(!echo.showQuickActions)}
          />
        </SettingRow>
      </Section>

      <Section title="Appearance">
        <div className="flex items-center justify-between gap-3 py-2">
          <span>Theme</span>
          <div role="group" aria-label="Theme" className="flex gap-1">
            {(
              [
                ["light", "sun", "Light theme"],
                ["dark", "moon", "Dark theme"],
              ] as const
            ).map(([theme, icon, label]) => (
              <button
                key={theme}
                type="button"
                aria-label={label}
                title={label}
                aria-pressed={echo.theme === theme}
                onClick={() => echo.setTheme(theme)}
                className={`grid size-8 place-items-center rounded-full border ${
                  echo.theme === theme
                    ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--link)]"
                    : "border-[var(--line)] text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                <Icon name={icon} size={15} />
              </button>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Shortcuts">
        <Shortcut keys="Ctrl+Shift+E" label="Open or close the sidebar" />
        <Shortcut keys="Ctrl+Shift+K" label="Focus the composer" />
        <Shortcut keys="Ctrl+Shift+M" label="New chat" />
        <p className="px-1 py-2 text-[12px] text-[var(--muted)]">On Mac, use ⌘ instead of Ctrl.</p>
      </Section>

      <Section title="Privacy">
        <p className="px-1 py-2 text-[12px] leading-5 text-[var(--muted)]">
          A page is included only when the Page chip is on, or when you use a page action like
          Summarize. A selection is quoted only when you highlight it. Preferences stay on this
          device.
        </p>
        {clearArmed ? (
          <div className="flex items-center justify-between gap-2 border-t border-[var(--line)] py-2">
            <p className="text-[12px]">Clear conversations stored on this device?</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setClearArmed(false)} className="text-[12px] text-[var(--muted)]">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  echo.clearHistory();
                  setClearArmed(false);
                }}
                className="text-[12px] text-[var(--danger)]"
              >
                Clear
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setClearArmed(true)}
            className="flex items-center gap-2 border-t border-[var(--line)] py-2 text-[12px] text-[var(--danger)]"
          >
            <Icon name="trash" size={14} />
            Clear history
          </button>
        )}
      </Section>

      <details className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--raised)] px-3 py-2">
        <summary className="cursor-pointer list-none text-[12px] font-medium text-[var(--muted)]">
          Advanced
        </summary>
        <label className="mt-2 block text-[12px]">
          API endpoint
          <input
            value={echo.endpoint}
            onChange={(event) => echo.setEndpoint(event.target.value)}
            autoComplete="off"
            spellCheck={false}
            aria-label="API endpoint"
            className="mt-1 h-9 w-full rounded-lg border border-[var(--line)] bg-[var(--sunken)] px-2 font-mono text-[12px] outline-none focus:border-[var(--link)]"
          />
        </label>
        <p className="py-2 text-[12px] leading-5 text-[var(--muted)]">
          Stored on this device. This concept does not call the endpoint.
        </p>
      </details>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-4">
      <h3 className="px-1 text-[11px] text-[var(--faint)]">{title}</h3>
      <div className="mt-1 rounded-2xl border border-[var(--line)] bg-[var(--raised)] px-3">{children}</div>
    </section>
  );
}

function SettingRow({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-[var(--line)] py-2.5 first:border-t-0">
      <div>
        <div className="font-medium">{title}</div>
        <p className="text-[12px] leading-5 text-[var(--muted)]">{body}</p>
      </div>
      {children}
    </div>
  );
}

function Shortcut({ keys, label }: { keys: string; label: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-[var(--line)] py-2.5 first:border-t-0">
      <span>{label}</span>
      <kbd className="shrink-0 rounded border border-[var(--line)] bg-[var(--sunken)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--muted)]">
        {keys}
      </kbd>
    </div>
  );
}
