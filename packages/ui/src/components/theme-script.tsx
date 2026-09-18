import { THEME_COOKIE } from "@/lib/theme"

const themeScript = `(() => {
  const match = document.cookie.match(/(?:^|; )${THEME_COOKIE}=([^;]+)/);
  const preference = match ? decodeURIComponent(match[1]) : "system";
  const dark = preference === "dark" || (preference !== "light" && matchMedia("(prefers-color-scheme: dark)").matches);
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(dark ? "dark" : "light");
  root.dataset.themePreference = preference;
})();`

export function ThemeScript({ nonce }: { nonce?: string }) {
  return <script nonce={nonce} dangerouslySetInnerHTML={{ __html: themeScript }} />
}
