const MAC_REGEX = /Mac|iPhone|iPad|iPod/;

export function useOsShortcut() {
  const isMac =
    typeof window !== "undefined" &&
    MAC_REGEX.test(navigator.userAgent);

  return isMac ? "⌘K" : "Ctrl+K";
}