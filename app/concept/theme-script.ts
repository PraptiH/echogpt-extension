import type { Theme } from "./data";

export const THEME_KEY = "echo-theme";
export const DEFAULT_THEME: Theme = "dark";

export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;
