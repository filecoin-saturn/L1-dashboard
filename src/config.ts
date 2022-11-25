const websiteDomain = `dashboard.${import.meta.env.VITE_ROOT_DOMAIN}`;

// Is the webui running on the website or inside filecoin station?
const IS_WEBSITE = window.location.hostname === websiteDomain;

// Is there a better way to toggle modes?
export const MODE_WEBSITE = IS_WEBSITE || window.location.search.includes("mode=website");
export const MODE_EMBED = !MODE_WEBSITE || window.location.search.includes("mode=embed");

export const ROUTER_BASE_PATH = IS_WEBSITE ? "/" : "/webui/";
