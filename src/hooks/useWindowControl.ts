import { useState, useEffect, useRef, useCallback } from "react";

const COLLAPSED_SIZE = { width: 92, height: 92 };
const EXPANDED_SIZE = { width: 380, height: 560 };
const DEBOUNCE_MS = 380;

export function useWindowControl() {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isPinned, setIsPinned] = useState<boolean>(() => {
    return localStorage.getItem("widget_pinned") === "true";
  });

  const leaveTimeoutRef = useRef<number | null>(null);

  // Resize native Tauri window if running in Tauri
  const resizeNativeWindow = useCallback(
    async (width: number, height: number, anchorTopRight: boolean = false) => {
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        await invoke("resize_widget", {
          width,
          height,
          anchorTopRight,
        });
      } catch {
        try {
          const { getCurrentWindow, LogicalSize } = await import("@tauri-apps/api/window");
          const appWindow = getCurrentWindow();
          await appWindow.setSize(new LogicalSize(width, height));
        } catch {
          // In regular browser dev mode, window resizing is not supported
        }
      }
    },
    []
  );

  const expand = useCallback(() => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    setIsExpanded(true);
    resizeNativeWindow(EXPANDED_SIZE.width, EXPANDED_SIZE.height, true);
  }, [resizeNativeWindow]);

  const collapse = useCallback(() => {
    if (isPinned) return; // Ignore collapse if pinned
    setIsExpanded(false);
    resizeNativeWindow(COLLAPSED_SIZE.width, COLLAPSED_SIZE.height, true);
  }, [isPinned, resizeNativeWindow]);

  const handleMouseEnter = useCallback(() => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    if (!isExpanded) {
      expand();
    }
  }, [isExpanded, expand]);

  const handleMouseLeave = useCallback(() => {
    if (isPinned) return; // Do not collapse if pinned
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
    }
    leaveTimeoutRef.current = window.setTimeout(() => {
      collapse();
      leaveTimeoutRef.current = null;
    }, DEBOUNCE_MS);
  }, [isPinned, collapse]);

  const togglePin = useCallback(() => {
    setIsPinned(prev => {
      const next = !prev;
      localStorage.setItem("widget_pinned", String(next));
      if (next && !isExpanded) {
        expand();
      }
      return next;
    });
  }, [isExpanded, expand]);

  // Initial window size
  useEffect(() => {
    if (isPinned) {
      setIsExpanded(true);
      resizeNativeWindow(EXPANDED_SIZE.width, EXPANDED_SIZE.height);
    } else {
      setIsExpanded(false);
      resizeNativeWindow(COLLAPSED_SIZE.width, COLLAPSED_SIZE.height);
    }
  }, [isPinned, resizeNativeWindow]);

  const startDrag = useCallback(async () => {
    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      await getCurrentWindow().startDragging();
    } catch {
      // Browser fallback
    }
  }, []);

  return {
    isExpanded,
    isPinned,
    togglePin,
    handleMouseEnter,
    handleMouseLeave,
    expand,
    collapse,
    startDrag,
  };
}
