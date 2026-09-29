"use client";

import Image, { type StaticImageData } from "next/image";
import { useState } from "react";
import preview1 from "@/public/assets/Images/preview1.png";
import preview2 from "@/public/assets/Images/preview2.png";
import preview3 from "@/public/assets/Images/preview3.png";
import Article from "./Article";
import { Segment } from "./bits";
import { PAGE, type Scenario, type Surface } from "./data";
import { EchoMark, Icon } from "./icons";
import Popup from "./Popup";
import SidePanel from "./SidePanel";
import { EchoProvider, useEcho } from "./store";

type Mode = "redesign" | "current";

const CURRENT_SHOTS: { src: StaticImageData; alt: string }[] = [
  {
    src: preview3,
    alt: "Current EchoGPT store image: Chat and Write sidebars with GPT-4o, Claude, and Gemini",
  },
  {
    src: preview1,
    alt: "Current EchoGPT store image: sign-in, Chat, Write, and Translate sidebars on a light background",
  },
  {
    src: preview2,
    alt: "Current EchoGPT store image: sign-in, Chat, Write, and Translate sidebars on a violet background",
  },
];

const CHANGES = [
  "The popup launches and resumes. All the work happens in the sidebar.",
  "The page is attached with a visible chip, never silently.",
  "One composer handles chat, writing, and page actions, so there's no separate tab for each.",
  "Ask several models at once, then continue with the reply you want.",
];

export default function Studio() {
  return (
    <EchoProvider>
      <StudioFrame />
    </EchoProvider>
  );
}

function StudioFrame() {
  const echo = useEcho();
  const [mode, setMode] = useState<Mode>("redesign");
  const panelOpen = echo.surface === "sidebar";

  return (
    <div
      className="studio flex h-full min-h-0 flex-col transition-colors"
    >
      <header className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
        <div className="mr-auto flex items-center gap-2.5">
          <EchoMark size={28} />
          <div>
            <h1 className="text-[14px] font-semibold tracking-tight">EchoGPT</h1>
            {mode === "current" && (
              <p className="text-[12px] text-[var(--s-muted)]">
                The version on the Chrome Web Store today (1.0.5).
              </p>
            )}
          </div>
        </div>
        <Segment<Mode>
          label="Version"
          tone="paper"
          value={mode}
          onChange={setMode}
          options={[
            { value: "redesign", label: "Redesign" },
            { value: "current", label: "Current" },
          ]}
        />
        {mode === "redesign" ? (
          <>
            <Segment<Surface>
              label="Surface"
              tone="paper"
              value={echo.surface}
              onChange={echo.setSurface}
              options={[
                { value: "sidebar", label: "Sidebar" },
                { value: "popup", label: "Popup" },
                { value: "idle", label: "Closed" },
              ]}
            />
            <Segment<Scenario>
              label="On the page"
              tone="paper"
              value={echo.scenario}
              onChange={echo.setScenario}
              options={[
                { value: "reading", label: "Reading" },
                { value: "selection", label: "Text selected" },
              ]}
            />
          </>
        ) : null}
        <button
          type="button"
          aria-label={echo.theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          title={echo.theme === "dark" ? "Light theme" : "Dark theme"}
          onClick={() => echo.setTheme(echo.theme === "dark" ? "light" : "dark")}
          className="grid size-8 place-items-center rounded-lg bg-[var(--s-seg)] text-[var(--s-seg-text)] hover:text-[var(--s-text)]"
        >
          <Icon name={echo.theme === "dark" ? "sun" : "moon"} size={16} />
        </button>
      </header>

      <div className="min-h-0 flex-1 px-3 pb-3 sm:px-5 sm:pb-5">
        {mode === "current" ? (
          <CurrentVersion onOpenRedesign={() => setMode("redesign")} />
        ) : (
          <div className="mx-auto flex h-full min-h-0 max-w-[1180px] flex-col overflow-hidden rounded-[20px] border border-[var(--s-line)] bg-[var(--paper)] shadow-[var(--s-shadow)]">
            <div className="flex h-11 shrink-0 items-center gap-2 border-b border-[var(--s-line)] bg-[var(--s-bar)] px-3">
              <div className="flex gap-1.5" aria-hidden>
                <span className="size-2.5 rounded-full bg-[#e3b2a8]" />
                <span className="size-2.5 rounded-full bg-[#ead29a]" />
                <span className="size-2.5 rounded-full bg-[#b7cba8]" />
              </div>
              <div className="flex h-7 min-w-0 flex-1 items-center gap-1.5 rounded-md border border-[var(--s-line)] bg-[var(--s-url)] px-2 text-[12px] text-[var(--s-url-text)]">
                <Icon name="lock" size={12} />
                <span className="truncate">
                  {PAGE.host}
                  {PAGE.path}
                </span>
              </div>
              <button
                type="button"
                aria-label={echo.surface === "popup" ? "Close EchoGPT" : "Open EchoGPT"}
                aria-pressed={echo.surface === "popup"}
                title="EchoGPT"
                onClick={() => echo.setSurface(echo.surface === "popup" ? "idle" : "popup")}
                className={`grid size-7 place-items-center rounded-md ${
                  echo.surface === "idle"
                    ? "opacity-80 hover:bg-[var(--s-seg)]"
                    : "bg-[var(--s-seg-on)] shadow-sm"
                }`}
              >
                <EchoMark size={18} />
              </button>
            </div>

            <div className="relative flex min-h-0 flex-1">
              <div
                className={
                  panelOpen
                    ? "hidden h-full min-h-0 min-w-0 min-[960px]:flex min-[960px]:flex-1 min-[960px]:flex-col"
                    : "flex h-full min-h-0 min-w-0 flex-1 flex-col"
                }
              >
                <Article />
              </div>
              {panelOpen ? (
                <div className="flex h-full min-h-0 w-full shrink-0 flex-col border-[var(--s-line)] min-[960px]:w-[392px] min-[960px]:border-l">
                  <SidePanel />
                </div>
              ) : null}
              {echo.surface === "popup" ? <Popup /> : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CurrentVersion({ onOpenRedesign }: { onOpenRedesign: () => void }) {
  const [index, setIndex] = useState(0);
  const shot = CURRENT_SHOTS[index] ?? CURRENT_SHOTS[0];

  return (
    <div className="mx-auto h-full max-w-[1180px] overflow-y-auto rounded-[20px] border border-[var(--s-line)] bg-[var(--s-card)] p-4 shadow-[var(--s-shadow)] sm:p-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0">
          <div className="overflow-hidden rounded-2xl border border-[var(--s-line)]">
            <Image
              src={shot.src}
              alt={shot.alt}
              placeholder="blur"
              sizes="(min-width: 1024px) 820px, 100vw"
              className="h-auto w-full"
              preload
            />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
            {CURRENT_SHOTS.map((item, i) => (
              <button
                key={item.alt}
                type="button"
                aria-label={`Show store image ${i + 1}`}
                aria-pressed={i === index}
                onClick={() => setIndex(i)}
                className={`overflow-hidden rounded-xl border-2 transition ${
                  i === index
                    ? "border-[var(--s-accent)]"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={item.src}
                  alt=""
                  placeholder="blur"
                  sizes="(min-width: 1024px) 270px, 33vw"
                  className="h-auto w-full"
                />
              </button>
            ))}
          </div>
        </div>

        <aside className="lg:pt-1">
          <h2 className="text-[15px] font-semibold tracking-tight">What the redesign changes</h2>
          <ul className="mt-3 space-y-3">
            {CHANGES.map((line) => (
              <li key={line} className="flex gap-2.5 text-[13px] leading-5 text-[var(--s-body)]">
                <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-[var(--s-accent)]" />
                {line}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={onOpenRedesign}
            className="mt-5 inline-flex h-9 items-center gap-2 rounded-full bg-[var(--s-accent)] px-4 text-[13px] font-medium text-white hover:opacity-90"
          >
            Open the redesign
            <Icon name="arrow" size={15} />
          </button>
        </aside>
      </div>
    </div>
  );
}
