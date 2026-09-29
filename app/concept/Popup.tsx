"use client";

import { PAGE, QUICK } from "./data";
import { EchoMark, Icon } from "./icons";
import { EchoToast } from "./SidePanel";
import { useEcho } from "./store";

export default function Popup() {
  const echo = useEcho();
  const onPage = echo.threads.filter((thread) => thread.onThisPage).slice(0, 2);

  return (
    <section
      className={`echo absolute top-3 right-3 z-30 flex max-h-[min(540px,calc(100%-24px))] w-[336px] flex-col overflow-hidden rounded-2xl border border-[var(--line)] shadow-[var(--shadow)]`}
      aria-label="EchoGPT popup"
    >
      <header className="flex shrink-0 items-center gap-2 border-b border-[var(--line)] px-3 py-2.5">
        <EchoMark size={20} />
        <div className="min-w-0 flex-1">
          <h2 className="text-[13px] font-semibold tracking-tight">EchoGPT</h2>
          <p className="text-[11px] text-[var(--faint)]">
            {echo.signedIn ? "Signed in" : "Signed out"}
          </p>
        </div>
        <button
          type="button"
          aria-label="Close popup"
          onClick={() => echo.setSurface("idle")}
          className="grid size-8 place-items-center rounded-lg text-[var(--muted)] hover:bg-[var(--raised)] hover:text-[var(--text)]"
        >
          <Icon name="close" />
        </button>
      </header>

      {echo.signedIn ? (
        <div className="echo-scroll min-h-0 flex-1 overflow-y-auto px-3 py-3">
          <div className="rounded-[14px] border border-[var(--line)] bg-[var(--raised)] p-3">
            <p className="text-[11px] tracking-wide text-[var(--faint)] uppercase">{PAGE.site}</p>
            <p className="mt-1 font-medium">{PAGE.title}</p>
            <p className="mt-0.5 text-[12px] text-[var(--muted)]">{PAGE.host}</p>
          </div>

          <button
            type="button"
            onClick={() => echo.setSurface("sidebar")}
            className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] text-[13px] font-medium text-[var(--accent-text)]"
          >
            Open sidebar
            <Icon name="arrow" size={15} />
          </button>

          {echo.scenario === "selection" ? (
            <button
              type="button"
              onClick={() => echo.runQuick("explain")}
              className="mt-2 flex w-full items-center justify-between rounded-xl bg-[var(--accent-soft)] px-3 py-2.5 text-left text-[var(--link)]"
            >
              <span>
                <span className="block font-medium">Explain selection</span>
                <span className="block text-[12px] opacity-80">Highlighted on this page</span>
              </span>
              <Icon name="arrow" size={14} />
            </button>
          ) : null}

          <p className="mt-4 px-1 text-[11px] text-[var(--faint)]">Quick</p>
          <div className="mt-1">
            {QUICK.filter((action) => action.needs === "page").slice(0, 3).map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => echo.runQuick(action.id)}
                className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left hover:bg-[var(--raised)]"
              >
                {action.label}
                <span className="text-[var(--faint)]">
                  <Icon name="arrow" size={14} />
                </span>
              </button>
            ))}
          </div>

          {onPage.length > 0 ? (
            <>
              <p className="mt-3 px-1 text-[11px] text-[var(--faint)]">Continue</p>
              {onPage.map((thread) => (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => echo.openThread(thread.id)}
                  className="flex w-full items-baseline justify-between gap-3 rounded-lg px-2 py-2 text-left hover:bg-[var(--raised)]"
                >
                  <span className="truncate">{thread.title}</span>
                  <span className="shrink-0 text-[11px] text-[var(--faint)]">{thread.updated}</span>
                </button>
              ))}
            </>
          ) : null}
        </div>
      ) : (
        <div className="px-6 py-8 text-center">
          <p className="text-[13px] leading-5 text-[var(--muted)]">
            Sign in to summarize this page and reopen your chats.
          </p>
          <button
            type="button"
            onClick={() => {
              echo.signIn();
              echo.setSurface("sidebar");
            }}
            className="mt-4 h-9 rounded-full bg-[var(--accent)] px-4 text-[13px] font-medium text-[var(--accent-text)]"
          >
            Sign in
          </button>
        </div>
      )}

      <footer className="shrink-0 border-t border-[var(--line)] px-3 py-2 text-[11px] text-[var(--faint)]">
        Ctrl+Shift+E opens the sidebar
      </footer>
      <EchoToast />
    </section>
  );
}
