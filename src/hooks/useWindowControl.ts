import { useState, useEffect, useRef, useCallback } from "react";

export const COLLAPSED_SIZE = { width: 92, height: 92 };
export const EXPANDED_SIZE = { width: 380, height: 560 };
const DEBOUNCE_MS = 380;
const COLLAPSE_ANIMATION_MS = 240;

export function useWindowControl() {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isCollapsing, setIsCollapsing] = useState<boolean>(false);
  const [isPinned, setIsPinned] = useState<boolean>(() => {
    return localStorage.getItem("widget_pinned") === "true";
  });

  const leaveTimeoutRef = useRef<number | null>(null);
  const collapseAnimTimeoutRef = useRef<number | null>(null);
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
    if (collapseAnimTimeoutRef.current) {
      clearTimeout(collapseAnimTimeoutRef.current);
      collapseAnimTimeoutRef.current = null;
    }

    setIsCollapsing(false);

    if (isExpandedRef.current) return;
    isExpandedRef.current = true;

    // Expand towards the bottom-left by shifting X left by width difference
    const deltaX = -(EXPANDED_SIZE.width - COLLAPSED_SIZE.width); // -288px
    resizeNativeWindow(EXPANDED_SIZE.width, EXPANDED_SIZE.height, deltaX);
    setIsExpanded(true);
  }, [resizeNativeWindow]);

  const collapse = useCallback(() => {
    if (isPinned) return;
    if (!isExpandedRef.current) return;

    // Trigger visual collapse animation first
    setIsCollapsing(true);

    if (collapseAnimTimeoutRef.current) {
      clearTimeout(collapseAnimTimeoutRef.current);
    }

    collapseAnimTimeoutRef.current = window.setTimeout(() => {
      isExpandedRef.current = false;
      setIsExpanded(false);
      setIsCollapsing(false);

      // After animation completes, resize native window towards top-right
      const deltaX = EXPANDED_SIZE.width - COLLAPSED_SIZE.width; // +288px
      resizeNativeWindow(COLLAPSED_SIZE.width, COLLAPSED_SIZE.height, deltaX);
    }, COLLAPSE_ANIMATION_MS);
  }, [isPinned, resizeNativeWindow]);

  const handleMouseEnter = useCallback(() => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    if (collapseAnimTimeoutRef.current) {
      clearTimeout(collapseAnimTimeoutRef.current);
      collapseAnimTimeoutRef.current = null;
      setIsCollapsing(false);
    }
    if (!isExpandedRef.current) {
      expand();
    }
  }, [expand]);

  const handleMouseLeave = useCallback(() => {
    if (isPinned) return;
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

  const closeApp = useCallback(async () => {
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("close_widget");
    } catch {
      try {
        const { getCurrentWindow } = await import("@tauri-apps/api/window");
        await getCurrentWindow().close();
      } catch {
        window.close();
      }
    }
  }, []);

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
    isCollapsing,
    isPinned,
    togglePin,
    handleMouseEnter,
    handleMouseLeave,
    expand,
    collapse,
    closeApp,
    startDrag,
  };
}
