# EchoGPT: Chrome extension redesign concept

An interactive redesign of the [EchoGPT: Multi-AI Chat Sidebar](https://chromewebstore.google.com/detail/echogpt-multi-ai-chat-sid/negimdcamohmoheiifgecbjgjepkcfhj) Chrome extension, built as a clickable prototype that runs in the browser.

## Live Site : https://dynamic-alfajores-055c12.netlify.app/

## Project overview

The page simulates a Chrome window showing a news article. The redesigned extension runs on top of that article, so you can see how it behaves on a real page.

The header has controls for exploring the concept:

- **Redesign / Current:** switch between the new design and screenshots of the version on the Chrome Web Store today (1.0.5). The Current view lists what the redesign changes.
- **Surface:** show the extension as the **Sidebar** (Chrome side panel), the toolbar **Popup**, or **Closed**.
- **Scenario:** **Reading** shows the page with nothing selected. **Text selected** highlights a sentence in the article, which unlocks the selection actions.
- **Theme:** a sun/moon button switches between light and dark.

The redesign covers the areas in the brief:

| Area | What changed |
| --- | --- |
| Popup UI | The popup is a launcher: page card, Open sidebar, Explain selection, three quick actions, and chats to continue on this page. All the work happens in the sidebar. |
| Navigation | One sidebar with a header for New chat, History, Prompts, and Settings. The Back button always returns to the chat. |
| Prompt input | One composer handles chat, writing, and page actions. It has a slash menu, Page and Selection context chips, a model chip, and saving the draft as a prompt. |
| AI model selection | A model sheet for picking the default model or several at once, to compare replies side by side and then continue with one. |
| Conversation history | Searchable history, grouped into On this page, Pinned, and Earlier, with pinning. |
| Quick actions | Page actions (Summarize, Key points, Questions, Outline) and selection actions (Explain, Simplify, Rewrite, Translate). |
| Settings | Models, Page context, Composer, Appearance, Shortcuts, Privacy, and an Advanced API endpoint field. |
| Visual consistency | One set of color tokens for the side panel and popup, in light and dark, using the EchoGPT logo and violet accent. |

## Setup instructions

Requirements: Node.js 20.9 or newer, and npm.

```bash
npm install
npm run dev
```

Open the URL printed in the terminal (usually [http://localhost:3000](http://localhost:3000)).

Other scripts:

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # ESLint
npx tsc --noEmit  # type check
```

## Technologies used

- [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- [React 19](https://react.dev)
- [TypeScript 5](https://www.typescriptlang.org) in strict mode
- [Tailwind CSS 4](https://tailwindcss.com), with CSS custom properties for theming
- `next/image` for the logo, preview screenshots, and article photo
- `next/font` for the Geist and Geist Mono fonts
- ESLint 9 with `eslint-config-next`

The project has no other runtime dependencies. There is no backend.

## Project structure

```
app/
  layout.tsx          Root layout, metadata, inline theme script
  page.tsx            Renders the concept
  globals.css         Theme tokens for the page (.studio) and extension (.echo)
  concept/
    Studio.tsx        Header controls, browser frame, Current-version gallery
    SidePanel.tsx     Sidebar: sign-in, chat, composer, models, history, prompts, settings
    Popup.tsx         Toolbar popup
    Article.tsx       Sample article the extension reads
    store.tsx         State and actions shared by every surface (React context)
    data.ts           Models, quick actions, prompts, sample threads, canned replies
    theme.ts          Theme state saved to localStorage
    theme-script.ts   Theme constants and the pre-hydration script
    icons.tsx         Icons, EchoGPT logo, Google mark
    bits.tsx          Segment and Switch controls
public/assets/Images/ Logo, current-version screenshots, article photo
```

## Assumptions

- **Prototype, not a packaged extension.** It runs as a Next.js page with a simulated browser frame. There is no `manifest.json`, and it can't be loaded into Chrome as an extension.
- **Replies are canned.** No AI model is called. `data.ts` builds a reply per model and intent. When the page or selection isn't attached, the reply says so instead of pretending to have read it.
- **Sign-in is simulated.** The demo starts signed in. The Google and EchoGPT account buttons flip a local flag and don't contact any server.
- **One sample page.** The article about city shade (Northline) stands in for whatever tab the user has open. "Text selected" stands in for a real highlight.
- **The four models are illustrative.** Claude, GPT, Gemini, and Grok stand in for the providers EchoGPT offers.
- **Only the theme persists.** It's saved in `localStorage`. Chats, prompts, and other settings reset when you reload.
- **Chrome side panel width.** The sidebar is 392px wide on screens 960px and wider, to match a typical Chrome side panel. On narrower screens it fills the frame.
- **The API endpoint field is for show.** It's editable, but nothing is sent to it.

## Additional features implemented

Beyond the brief:

- **Compare models, then continue.** Send one prompt to several models, read the replies side by side, and continue the chat with the one you prefer. A note records the switch in the conversation.
- **Visible page context.** The page is attached only when the Page chip is on or a page action runs, never silently. The Page context setting chooses Ask, Always page, or Selection.
- **Slash menu.** Type `/` in the composer to search quick actions and saved prompts, then pick one with the arrow keys and Enter.
- **Prompt library.** Search prompts by group, insert one into the composer, or save the current draft as a new prompt.
- **Keyboard shortcuts.** Ctrl+Shift+E opens or closes the sidebar, Ctrl+Shift+K focuses the composer, and Ctrl+Shift+M starts a new chat. Use ⌘ on Mac.
- **Enter-to-send toggle.** When it's off, Enter adds a line and Ctrl+Enter sends.
- **Quick actions toggle.** Hide the quick action chips above the composer.
- **Per-model on/off.** Turn models off in Settings. At least one always stays on.
- **Clear history with confirmation.** Settings → Privacy asks before clearing conversations.
- **Theme persistence without a flash.** An inline script in `<head>` applies the saved theme before React loads, so reloading never flashes the wrong theme.
- **Current vs. redesign comparison.** Screenshots of the version on the Chrome Web Store sit next to a summary of what the redesign changes.
- **Accessibility.** Icon buttons have labels, toggles use `aria-pressed`, the article photo has alt text, and animations respect `prefers-reduced-motion`.
