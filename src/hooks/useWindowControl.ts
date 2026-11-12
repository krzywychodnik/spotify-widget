import { useState, useEffect, useRef, useCallback } from "react";

export const COLLAPSED_SIZE = { width: 92, height: 92 };
export const EXPANDED_SIZE = { width: 380, height: 560 };
const DEBOUNCE_MS = 380;

export function useWindowControl() {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isPinned, setIsPinned] = useState<boolean>(() => {
    return localStorage.getItem("widget_pinned") === "true";
  });

  const leaveTimeoutRef = useRef<number | null>(null);
  const isExpandedRef = useRef<boolean>(false);

  // Resize native Tauri window if running in Tauri with exact deltaX
  const resizeNativeWindow = useCallback(
    async (width: number, height: number, deltaX: number = 0) => {
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        await invoke("resize_widget", {
          width,
          height,
          deltaX,
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
    if (isExpandedRef.current) return;

    isExpandedRef.current = true;
    setIsExpanded(true);

    // Expand towards the bottom-left by shifting X to the left by the width difference
    const deltaX = -(EXPANDED_SIZE.width - COLLAPSED_SIZE.width); // -288px
    resizeNativeWindow(EXPANDED_SIZE.width, EXPANDED_SIZE.height, deltaX);
  }, [resizeNativeWindow]);

  const collapse = useCallback(() => {
    if (isPinned) return; // Ignore collapse if pinned
    if (!isExpandedRef.current) return;

    isExpandedRef.current = false;
    setIsExpanded(false);

    // Collapse into the top-right corner by shifting X to the right by the width difference
    const deltaX = EXPANDED_SIZE.width - COLLAPSED_SIZE.width; // +288px
    resizeNativeWindow(COLLAPSED_SIZE.width, COLLAPSED_SIZE.height, deltaX);
  }, [isPinned, resizeNativeWindow]);

  const handleMouseEnter = useCallback(() => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    if (!isExpandedRef.current) {
      expand();
    }
  }, [expand]);

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
    setIsPinned((prev) => {
      const next = !prev;
      localStorage.setItem("widget_pinned", String(next));
      if (next && !isExpandedRef.current) {
        expand();
      }
      return next;
    });
  }, [expand]);

  // Initial window size
  useEffect(() => {
    if (isPinned) {
      isExpandedRef.current = true;
      setIsExpanded(true);
      resizeNativeWindow(EXPANDED_SIZE.width, EXPANDED_SIZE.height, 0);
    } else {
      isExpandedRef.current = false;
      setIsExpanded(false);
      resizeNativeWindow(COLLAPSED_SIZE.width, COLLAPSED_SIZE.height, 0);
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
