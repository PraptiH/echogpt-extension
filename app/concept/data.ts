export const MODEL_MAP = {
  claude: { id: "claude", name: "Claude Sonnet", note: "Careful writing" },
  gpt: { id: "gpt", name: "GPT-4o", note: "Direct answers" },
  gemini: { id: "gemini", name: "Gemini", note: "Long pages" },
  grok: { id: "grok", name: "Grok", note: "Short takes" },
} as const;

export type ModelId = keyof typeof MODEL_MAP;
export type Model = (typeof MODEL_MAP)[ModelId];
export const MODELS: Model[] = [
  MODEL_MAP.claude,
  MODEL_MAP.gpt,
  MODEL_MAP.gemini,
  MODEL_MAP.grok,
];

export const MODEL_COLOR: Record<ModelId, string> = {
  claude: "#d97757",
  gpt: "#19a37a",
  gemini: "#4c7cf5",
  grok: "#c8c2b8",
};

export const PAGE = {
  title: "Shade is infrastructure",
  site: "Northline",
  host: "northline.press",
  path: "/shade-is-infrastructure",
  read: "6 min read",
  date: "Sept 18, 2026",
  kicker: "Cities",
};

export const SELECTION =
  "shade trees can drop surface temperatures by 20 to 45 degrees Fahrenheit";

export type Surface = "sidebar" | "popup" | "idle";
export type Scenario = "reading" | "selection";
export type Theme = "dark" | "light";
export type PanelView = "chat" | "history" | "prompts" | "settings";
export type Sheet = "models" | null;
export type ContextMode = "ask" | "page" | "selection";
export type ContextTag = "page" | "selection" | "both" | "none";
export type PromptGroup = "Page" | "Writing" | "Research" | "Saved";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "note";
  content: string;
  modelId?: ModelId;
  context?: ContextTag;
  compare?: { modelId: ModelId; content: string }[];
};

export type Thread = {
  id: string;
  title: string;
  preview: string;
  modelId: ModelId;
  updated: string;
  onThisPage: boolean;
  pinned: boolean;
  messages: ChatMessage[];
};

export type PromptItem = {
  id: string;
  title: string;
  body: string;
  group: PromptGroup;
};

export const QUICK = [
  {
    id: "summarize",
    label: "Summarize",
    prompt: "Summarize this page.",
    needs: "page",
  },
  {
    id: "points",
    label: "Key points",
    prompt: "Pull out the key points.",
    needs: "page",
  },
  {
    id: "questions",
    label: "Questions",
    prompt: "What questions should I ask after reading this?",
    needs: "page",
  },
  {
    id: "outline",
    label: "Outline",
    prompt: "Outline this page.",
    needs: "page",
  },
  {
    id: "explain",
    label: "Explain",
    prompt: "Explain this selection.",
    needs: "selection",
  },
  {
    id: "simplify",
    label: "Simplify",
    prompt: "Simplify this selection.",
    needs: "selection",
  },
  {
    id: "rewrite",
    label: "Rewrite",
    prompt: "Rewrite this selection so it’s tighter.",
    needs: "selection",
  },
  {
    id: "translate",
    label: "Translate",
    prompt: "Translate this selection into Spanish.",
    needs: "selection",
  },
] as const;

export type QuickId = (typeof QUICK)[number]["id"];

export const INITIAL_PROMPTS: PromptItem[] = [
  {
    id: "p1",
    group: "Page",
    title: "Meeting summary",
    body: "Summarize this page in 5 bullets a colleague can read in a minute. Mark any number I should double-check.",
  },
  {
    id: "p2",
    group: "Page",
    title: "Skeptical read",
    body: "What does this page claim, and what would a skeptical editor ask before publishing a line from it?",
  },
  {
    id: "p3",
    group: "Writing",
    title: "Tighten",
    body: "Rewrite this selection so it’s tighter. Keep the meaning and the numbers.",
  },
  {
    id: "p4",
    group: "Writing",
    title: "Neutral tone",
    body: "Rewrite this selection in a neutral tone. Don’t add claims.",
  },
  {
    id: "p5",
    group: "Research",
    title: "Counterargument",
    body: "Give the strongest counterargument to this page, using only what the page itself concedes or leaves out.",
  },
  {
    id: "p6",
    group: "Research",
    title: "Follow-ups",
    body: "List follow-up questions a reporter should ask after this page.",
  },
  {
    id: "p7",
    group: "Saved",
    title: "Monday brief",
    body: "From this page, draft 5 bullets I can paste into a Monday brief. Flag anything uncertain.",
  },
];

export const INITIAL_THREADS: Thread[] = [
  {
    id: "t1",
    title: "Air versus surface",
    preview: "Yes. The 2°C figure is neighborhood air temperature.",
    modelId: "claude",
    updated: "2h",
    onThisPage: true,
    pinned: true,
    messages: [
      {
        id: "t1u",
        role: "user",
        content: "Is the 2°C figure air temperature?",
        context: "page",
      },
      {
        id: "t1a",
        role: "assistant",
        modelId: "claude",
        content:
          "Yes. Medellín’s green corridors lowered neighborhood air temperatures by about 2°C. The 20–45°F number later in the piece is surface temperature under shade, not the air.",
      },
    ],
  },
  {
    id: "t2",
    title: "Check the 45°F line",
    preview: "It’s a surface claim. Air temperature barely moves.",
    modelId: "gpt",
    updated: "Yesterday",
    onThisPage: true,
    pinned: false,
    messages: [
      {
        id: "t2u",
        role: "user",
        content: "Check the surface temperature claim.",
        context: "selection",
      },
      {
        id: "t2a",
        role: "assistant",
        modelId: "gpt",
        content:
          "The piece states it as research, not as a citywide forecast: shade trees can drop surface temperatures 20–45°F. Air temperature barely moves. Safe paraphrase: shade cools what you touch, not the weather.",
      },
    ],
  },
  {
    id: "t3",
    title: "Monday brief",
    preview: "Five bullets, with the surface figure flagged.",
    modelId: "gemini",
    updated: "Mon",
    onThisPage: false,
    pinned: true,
    messages: [
      {
        id: "t3u",
        role: "user",
        content: "Draft 5 bullets for a Monday brief.",
        context: "page",
      },
      {
        id: "t3a",
        role: "assistant",
        modelId: "gemini",
        content:
          "– Heat is being treated as street design, not only as a forecast.\n– Medellín’s corridors: about 2°C cooler air along planted roads and streams.\n– Phoenix is planting the walks people already take, hottest blocks first.\n– Uncertain to quote cold: 20–45°F is surface heat, and the piece doesn’t name the study.\n– Shade is framed as work due before next summer, not as an emissions plan.",
      },
    ],
  },
  {
    id: "t4",
    title: "Neutral rewrite",
    preview: "Shade trees can make surfaces 20–45°F cooler.",
    modelId: "claude",
    updated: "Sep 12",
    onThisPage: false,
    pinned: false,
    messages: [
      {
        id: "t4u",
        role: "user",
        content: "Rewrite this in a neutral tone.",
        context: "selection",
      },
      {
        id: "t4a",
        role: "assistant",
        modelId: "claude",
        content:
          "Shade trees can lower surface temperatures by 20 to 45 degrees Fahrenheit.",
      },
    ],
  },
];

export function clip(text: string, max = 72): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max).trimEnd()}…` : clean;
}

export function titleFrom(text: string): string {
  const known = QUICK.find((item) => item.prompt === text);
  if (known) return known.label;
  return clip(text.replace(/[.?!]+$/, ""), 42);
}

export function previewFrom(message: ChatMessage): string {
  const raw =
    message.compare?.map((item) => item.content).join(" ") || message.content;
  return clip(raw.replace(/\s+/g, " "), 88);
}

export function attachmentLabel(page: boolean, selection: boolean): string {
  if (page && selection) return "Page and selection attached";
  if (page) return "Page attached";
  if (selection) return "Selection attached";
  return "Nothing attached";
}

export function contextLabel(tag: ContextTag | undefined): string | null {
  if (!tag || tag === "none") return null;
  if (tag === "page") return "With page";
  if (tag === "selection") return "With selection";
  return "With page + selection";
}

type Intent =
  | "summarize"
  | "points"
  | "questions"
  | "outline"
  | "explain"
  | "simplify"
  | "rewrite"
  | "translate"
  | "counter"
  | "brief"
  | "general";

const PAGE_INTENTS = new Set<Intent>([
  "summarize",
  "points",
  "questions",
  "outline",
  "counter",
  "brief",
]);

const SELECTION_INTENTS = new Set<Intent>([
  "explain",
  "simplify",
  "rewrite",
  "translate",
]);

function detectIntent(text: string): Intent {
  const t = text.toLowerCase();
  if (t.includes("summar")) return "summarize";
  if (t.includes("key point")) return "points";
  if (t.includes("outline")) return "outline";
  if (t.includes("explain")) return "explain";
  if (t.includes("simplif")) return "simplify";
  if (t.includes("rewrite") || t.includes("tighten") || t.includes("neutral tone"))
    return "rewrite";
  if (t.includes("translat")) return "translate";
  if (t.includes("counter")) return "counter";
  if (t.includes("brief") || t.includes("monday")) return "brief";
  if (t.includes("what questions") || t.includes("follow-up") || t.includes("follow up"))
    return "questions";
  return "general";
}

const NO_PAGE: Record<ModelId, string> = {
  claude:
    "The page isn’t attached, so I won’t summarize it from the mere fact that the tab is open. Turn on Page, or use Summarize — that attaches it.",
  gpt: "Page is off, so there’s nothing solid to summarize. Turn on the Page chip, or click Summarize.",
  gemini:
    "I don’t have the article attached. I won’t guess the full piece just because the tab is open. Attach Page, then ask again.",
  grok: "No page attached. I won’t fake a summary. Turn on Page, or hit Summarize.",
};

const NO_SELECTION: Record<ModelId, string> = {
  claude:
    "There’s no selection to work from. Highlight a passage on the page, or paste the sentence here.",
  gpt: "Nothing is highlighted. Select a passage, or paste the line you want rewritten.",
  gemini:
    "I don’t have a selection attached. Highlight the sentence on the page and ask again.",
  grok: "No selection. Highlight the line, or paste it.",
};

const SUMMARIZE: Record<ModelId, string> = {
  claude:
    "Shade is being treated as infrastructure, not decoration. Medellín’s green corridors lowered neighborhood air temperatures by about 2°C. Phoenix is planting along walks people already take, hottest blocks first. The striking 20–45°F figure is surface temperature under trees, not the air. The piece is explicit that this does not replace cutting emissions — it is work a city can finish before next summer.",
  gpt: "Three ideas.\n\nHeat is a design problem, not only a forecast.\nMedellín put trees along roads and streams and got about 2°C cooler air.\nPhoenix plants where people already walk, not where a rendering looks good.\n\nDon’t mix the numbers: 20–45°F is how much cooler pavement and benches are in shade, not the weather.",
  gemini:
    "Across the piece: the opening sets up heat-as-design. The Medellín section gives the 2°C air-temperature result and a cost comparison with rail. Phoenix introduces trip-based planting and the arborist’s line about renderings. Then the research claim separates surface heat (20–45°F) from air temperature. The close limits it — shade is not an emissions plan.",
  grok: "Cities are planting trees where people actually melt, not where it flatters a skyline. Medellín bought about 2°C of air cooling with corridors. The 45°F number is pavement, not the forecast. Useful, near-term, and not a climate strategy. That’s the piece.",
};

const POINTS: Record<ModelId, string> = {
  claude:
    "The piece makes five moves.\n\n– Heat is a design problem, not only a forecast.\n– Medellín’s corridors cut about 2°C off neighborhood air temperatures.\n– Phoenix maps real trips — school, the bus, a 2 p.m. shift — and plants those blocks first.\n– 20–45°F is surface temperature. Air temperature barely moves.\n– Shade is what you can finish before next summer. It is not a substitute for cutting emissions.",
  gpt: "1. Design, not just a forecast.\n2. Medellín: about 2°C cooler air along planted roads and streams.\n3. Phoenix: trees on walks people already take.\n4. 20–45°F = surfaces, not air.\n5. Not an emissions strategy.",
  gemini:
    "Key points, in the order the page builds them:\n\n– Lede: planners who are cooling streets treat heat as design.\n– Medellín: 30 roads and streams, about 2°C, modest next to a train line.\n– Phoenix: hottest walks first. The arborist rejects planting for renderings.\n– Research claim: shade trees, surface temperatures, 20–45°F.\n– Limit: none of this replaces cutting emissions.",
  grok: "– Shade is infrastructure.\n– Medellín: ~2°C air.\n– Phoenix: plant the hot walk, not the pretty one.\n– 20–45°F is the sidewalk, not the sky.\n– Do it before next summer. Don’t call it a climate plan.",
};

const QUESTIONS: Record<ModelId, string> = {
  claude:
    "I’d ask these before quoting the piece:\n\n– Is the 2°C result air temperature, and over what season?\n– Which walks in Phoenix were mapped, and who was left off?\n– If surfaces cool 20–45°F and the air barely moves, which number should a mayor publish?\n– What does a corridor cost next to a cooling center or a reflective coating?\n– The close says this isn’t an emissions strategy. What decision changes if a city only does shade?",
  gpt: "Ask:\n\n1. Air or surface — which  number, and where was it measured?\n2. Who uses the walks Phoenix didn’t map?\n3. What got cut to pay for the trees?\n4. What would falsify the “before next summer” claim?\n5. Are they reporting shade, or selling it as climate action?",
  gemini:
    "Follow-ups tied to gaps in the page:\n\n– The Medellín section doesn’t say how long the 2°C drop lasted.\n– Phoenix names the trips (school, bus, 2 p.m. shift) but not the streets left out.\n– The 20–45°F sentence doesn’t name the study.\n– Cost is “modest next to a new train line,” with no figure.\n– The last paragraph draws a line at emissions, then stops.",
  grok: "Five questions, no softballs:\n\n– 2°C of what, for whom, for how long?\n– Whose walk didn’t make Phoenix’s map?\n– Why is there no study name on the 45°F line?\n– Cheaper than rail — cheaper than what they’d actually fund?\n– If this isn’t climate policy, stop letting the headline imply it is.",
};

const OUTLINE: Record<ModelId, string> = {
  claude:
    "1. Heat as a design problem, not only a forecast.\n2. Medellín’s corridors and the 2°C air-temperature result.\n3. Phoenix planting along trips people already take.\n4. Surface temperature versus air temperature.\n5. Shade as near-term work, not a substitute for cutting emissions.",
  gpt: "Outline\n\n– Problem: cities treated heat as a forecast\n– Case: Medellín corridors, ~2°C air\n– Method: Phoenix, plant the real walk\n– Caution: 20–45°F is surface heat\n– Limit: not an emissions plan",
  gemini:
    "Page outline\n\nOpening — heat is design.\nCase 1 — Medellín, 30 corridors, ~2°C, cost set against rail.\nCase 2 — Phoenix trip map, arborist quote on renderings.\nResearch claim — surface temperatures, 20–45°F, air barely moves.\nClose — finishable before next summer, not a stand-in for cutting emissions.",
  grok: "Forecast → trees → Medellín 2°C → Phoenix walks → don’t misquote 45°F → not a climate plan.",
};

const EXPLAIN: Record<ModelId, string> = {
  claude:
    "“Surface temperature” is the heat of the pavement, a bench, or a bus stop — not the air. Shade blocks sunlight before it soaks into asphalt, so those surfaces stay much cooler. The range 20–45°F is a comparison of shaded versus full sun. It is a real effect, and it is easy to misquote as if the whole city got 45 degrees cooler. The piece keeps that line separate from Medellín’s 2°C air result on purpose.",
  gpt: "The sentence is about the ground, not the forecast.\n\nShade stops sun from baking the street. The street surface can run 20–45°F cooler. The air around you does not drop by that much. Don’t use this number as “the city is 45°F cooler.”",
  gemini:
    "In context, this sentence comes after the Medellín and Phoenix sections and changes the metric. Corridors were about air temperature (~2°C). This claim is surface temperature under a canopy versus open sun (20–45°F). The next sentence in the piece says air temperature barely moves, while skin, asphalt, and bus stops do.",
  grok: "It’s the sidewalk, not the weather app. Shade can knock 20–45°F off the surface you touch. Anyone who drops the word “surface” is inflating it.",
};

const SIMPLIFY: Record<ModelId, string> = {
  claude:
    "Trees that cast shade can make streets and benches much cooler to the touch — by 20 to 45°F. The air itself does not cool by that much.",
  gpt: "Shade can make the pavement 20–45°F cooler. The air barely changes.",
  gemini:
    "A shaded surface — sidewalk, bench, bus stop — can be 20–45°F cooler than the same surface in full sun. That is not the same as the air temperature falling 20–45°F.",
  grok: "The ground gets a lot cooler in the shade. The air doesn’t.",
};

const REWRITE: Record<ModelId, string> = {
  claude:
    "Shade trees can lower surface temperatures by 20 to 45 degrees Fahrenheit.",
  gpt: "Under shade, surfaces run 20–45°F cooler.",
  gemini:
    "Trees that shade a street can leave its surface 20–45°F cooler than full sun.",
  grok: "Shade can knock 20–45°F off surface heat. The surface — not the air.",
};

const TRANSLATE: Record<ModelId, string> = {
  claude:
    "Los árboles de sombra pueden reducir la temperatura de la superficie entre 20 y 45 grados Fahrenheit.\n\nThis is the highlighted sentence only, not the article. “Surface temperatures” is temperatura de la superficie — not the air.",
  gpt: "Los árboles de sombra pueden bajar la temperatura de la superficie entre 20 y 45 °F.\n\nHighlighted line only. Don’t translate it as if the air dropped 45 degrees.",
  gemini:
    "Los árboles de sombra pueden disminuir la temperatura de la superficie entre 20 y 45 grados Fahrenheit.\n\nScope: the selection, not the Medellín or Phoenix sections. Superficie ≠ aire.",
  grok: "Los árboles de sombra pueden bajar la temperatura de la superficie entre 20 y 45 °F.\n\nThat’s the line. Surface, not air.",
};

const COUNTER: Record<ModelId, string> = {
  claude:
    "The strongest objection the page itself leaves open: the 2°C result is local, the Phoenix map only covers trips the city chose to count, and cooler pavement can be announced as climate action even though the last paragraph admits it isn’t. Shade can still be worth doing. It is not evidence the heat problem is being solved.",
  gpt: "Counterpoint, using only the piece’s own limits: local air cooling isn’t a regional result, unmapped walks don’t get trees, and the author already says this doesn’t cut emissions. A city can hide behind shade.",
  gemini:
    "What the page concedes or omits: no duration on the 2°C drop, no study name on 20–45°F, no cost figure beyond “modest next to rail,” and an explicit line that shade is not an emissions strategy. The counterargument is that a finishable project is being asked to stand in for a harder one.",
  grok: "The piece talks itself out of the grand claim. Local trees, unnamed study, and a last line that says this isn’t climate policy. Quote that, not the corridor photos.",
};

const BRIEF: Record<ModelId, string> = {
  claude:
    "– Shade is being funded like infrastructure: trees on streets people already use.\n– Medellín’s corridors: about 2°C cooler neighborhood air.\n– Phoenix is prioritizing the hottest real walks, including trips to a 2 p.m. shift.\n– Flag before you quote: 20–45°F is surface temperature. The piece doesn’t name the study.\n– The author does not treat this as a substitute for cutting emissions.",
  gpt: "Monday brief\n\n– Plant the hot walk, not the pretty one.\n– Medellín: ~2°C air along corridors.\n– Phoenix: school, bus, afternoon shift.\n– Do not brief 20–45°F without the word “surface.” Study not named.\n– Not an emissions plan. Say that out loud.",
  gemini:
    "– Frame: heat as street design.\n– Evidence in the piece: Medellín, ~2°C air; Phoenix, trip-based planting.\n– Quote that is safe: shade is cheaper to describe than rail, and aimed at existing routes.\n– Quote that needs a check: surface temperatures, 20–45°F, no citation on the page.\n– Limit to keep in the brief: shade does not replace cutting emissions.",
  grok: "– Trees where people already fry.\n– ~2°C air in Medellín’s corridors.\n– Phoenix: map the walk, then plant.\n– 45°F is pavement. Uncited here. Don’t brief it clean.\n– Not a climate strategy. A summer project.",
};

const FOCUS: Record<ModelId, string> = {
  claude:
    "the useful split is air versus surface. Medellín’s corridors are about 2°C of air cooling; 20–45°F is what shade does to pavement and benches.",
  gpt: "treat shade as a mapped project — Phoenix walks, Medellín corridors — and don’t publish the 2°C figure and the 20–45°F figure as the same kind of number.",
  gemini:
    "the page places Medellín (air, about 2°C) next to a later research claim (surface, 20–45°F). The close says shade doesn’t replace cutting emissions.",
  grok: "trees on real walking routes. 2°C means air. 20–45°F means the sidewalk.",
};

const NO_CONTEXT: Record<ModelId, (question: string) => string> = {
  claude: (question) =>
    `I don’t have this page attached, so I won’t pretend “${question}” was answered from the article. Turn on Page to tie the reply to what you’re reading.`,
  gpt: (question) =>
    `“${question}” — the Page chip is off, so this isn’t grounded in the article. Attach the page if that’s what you meant.`,
  gemini: (question) =>
    `I can take “${question}” as a standalone note, but the open article was not attached. Turn on Page if you want the reply tied to it.`,
  grok: (question) =>
    `On “${question}”: no page attached. If this is about the article, turn on Page. I won’t guess from an open tab.`,
};

function generalReply(modelId: ModelId, prompt: string, context: ContextTag): string {
  const question = clip(prompt, 64);
  if (context === "none") return NO_CONTEXT[modelId](question);
  const scope =
    context === "both"
      ? "From the page and the highlight:"
      : context === "selection"
        ? "From the highlight, not the whole page:"
        : "From this page:";
  return `On “${question}”. ${scope} ${FOCUS[modelId]}`;
}

const STATIC: Record<Exclude<Intent, "general">, Record<ModelId, string>> = {
  summarize: SUMMARIZE,
  points: POINTS,
  questions: QUESTIONS,
  outline: OUTLINE,
  explain: EXPLAIN,
  simplify: SIMPLIFY,
  rewrite: REWRITE,
  translate: TRANSLATE,
  counter: COUNTER,
  brief: BRIEF,
};

export function composeReply(input: {
  modelId: ModelId;
  prompt: string;
  context: ContextTag;
}): string {
  const intent = detectIntent(input.prompt);
  if (
    PAGE_INTENTS.has(intent) &&
    input.context !== "page" &&
    input.context !== "both"
  ) {
    return NO_PAGE[input.modelId];
  }
  if (
    SELECTION_INTENTS.has(intent) &&
    input.context !== "selection" &&
    input.context !== "both"
  ) {
    return NO_SELECTION[input.modelId];
  }
  if (intent === "general") {
    return generalReply(input.modelId, input.prompt, input.context);
  }
  return STATIC[intent][input.modelId];
}
