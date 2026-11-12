import { useState, useEffect, useRef, useCallback } from "react";
import { AppCustomization, CollapseDirection } from "../types";
import { DEFAULT_CUSTOMIZATION } from "./useCustomization";

export const COLLAPSED_SIZE = { width: 92, height: 92 };
export const DEFAULT_EXPANDED_SIZE = { width: 380, height: 560 };
export const EXPANDED_SIZE = DEFAULT_EXPANDED_SIZE;

function getCollapseDeltas(
  direction: CollapseDirection,
  expWidth: number = DEFAULT_EXPANDED_SIZE.width,
  expHeight: number = DEFAULT_EXPANDED_SIZE.height
) {
  const diffX = expWidth - COLLAPSED_SIZE.width;
  const diffY = expHeight - COLLAPSED_SIZE.height;

  switch (direction) {
    case "top-right":
      return { collapse: { dx: diffX, dy: 0 }, expand: { dx: -diffX, dy: 0 } };
    case "top-left":
      return { collapse: { dx: 0, dy: 0 }, expand: { dx: 0, dy: 0 } };
    case "bottom-right":
      return { collapse: { dx: diffX, dy: diffY }, expand: { dx: -diffX, dy: -diffY } };
    case "bottom-left":
      return { collapse: { dx: 0, dy: diffY }, expand: { dx: 0, dy: -diffY } };
    case "center":
      return {
        collapse: { dx: Math.round(diffX / 2), dy: Math.round(diffY / 2) },
        expand: { dx: -Math.round(diffX / 2), dy: -Math.round(diffY / 2) },
      };
    default:
      return { collapse: { dx: diffX, dy: 0 }, expand: { dx: -diffX, dy: 0 } };
  }
}

export function useWindowControl(
  customization: AppCustomization = DEFAULT_CUSTOMIZATION,
  preventCollapse: boolean = false
) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isCollapsing, setIsCollapsing] = useState<boolean>(false);
  const [isPinned, setIsPinned] = useState<boolean>(() => {
    return localStorage.getItem("widget_pinned") === "true";
  });

  // Track dynamic user-resized dimensions
  const [expandedDimensions, setExpandedDimensions] = useState<{ width: number; height: number }>(() => {
    try {
      const saved = localStorage.getItem("widget_expanded_size");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.width >= 200 && parsed.height >= 200) return parsed;
      }
    } catch {}
    return DEFAULT_EXPANDED_SIZE;
  });

  const expandedDimensionsRef = useRef(expandedDimensions);
  useEffect(() => {
    expandedDimensionsRef.current = expandedDimensions;
  }, [expandedDimensions]);

  // Listen to window resize events so user resizing is tracked and remembered
  useEffect(() => {
    const handleWindowResize = () => {
      if (isExpandedRef.current && !isCollapsing) {
        const w = window.innerWidth;
        const h = window.innerHeight;
        if (w >= 200 && h >= 200) {
          const newSize = { width: w, height: h };
          setExpandedDimensions(newSize);
          try {
            localStorage.setItem("widget_expanded_size", JSON.stringify(newSize));
          } catch {}
        }
      }
    };

    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, [isCollapsing]);

  const leaveTimeoutRef = useRef<number | null>(null);
  const collapseAnimTimeoutRef = useRef<number | null>(null);
  const isExpandedRef = useRef<boolean>(false);

  // Keep refs to avoid stale closures
  const customizationRef = useRef(customization);
  useEffect(() => {
    customizationRef.current = customization;
  }, [customization]);

  const preventCollapseRef = useRef(preventCollapse);
  useEffect(() => {
    preventCollapseRef.current = preventCollapse;
    if (preventCollapse && leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
  }, [preventCollapse]);

  // Resize native Tauri window if running in Tauri with exact deltaX and deltaY
  const resizeNativeWindow = useCallback(
    async (width: number, height: number, deltaX: number = 0, deltaY: number = 0) => {
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        await invoke("resize_widget", {
          width,
          height,
          deltaX,
          deltaY,
        });
      } catch {
        try {
          const { getCurrentWindow, LogicalSize } = await import("@tauri-apps/api/window");
          const appWindow = getCurrentWindow();
          await appWindow.setSize(new LogicalSize(width, height));
        } catch {
          // Browser dev mode
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

    const targetSize = expandedDimensionsRef.current;
    const deltas = getCollapseDeltas(
      customizationRef.current.collapseDirection,
      targetSize.width,
      targetSize.height
    );
    resizeNativeWindow(targetSize.width, targetSize.height, deltas.expand.dx, deltas.expand.dy);
    setIsExpanded(true);
  }, [resizeNativeWindow]);

  const collapse = useCallback(() => {
    // DO NOT collapse if pinned OR if settings/modal is currently open!
    if (isPinned || preventCollapseRef.current) return;
    if (!isExpandedRef.current) return;

    // Trigger visual collapse animation first
    setIsCollapsing(true);

    if (collapseAnimTimeoutRef.current) {
      clearTimeout(collapseAnimTimeoutRef.current);
    }

    const duration = customizationRef.current.animationSpeedMs || 420;

    collapseAnimTimeoutRef.current = window.setTimeout(() => {
      // Re-check preventCollapse in case settings modal opened during animation
      if (preventCollapseRef.current) {
        setIsCollapsing(false);
        return;
      }

      isExpandedRef.current = false;
      setIsExpanded(false);
      setIsCollapsing(false);

      const targetSize = expandedDimensionsRef.current;
      const deltas = getCollapseDeltas(
        customizationRef.current.collapseDirection,
        targetSize.width,
        targetSize.height
      );
      resizeNativeWindow(
        COLLAPSED_SIZE.width,
        COLLAPSED_SIZE.height,
        deltas.collapse.dx,
        deltas.collapse.dy
      );
    }, duration);
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

    // Only auto-expand on hover if expandTrigger is 'hover'!
    if (customizationRef.current.expandTrigger !== "click") {
      if (!isExpandedRef.current) {
        expand();
      }
    }
  }, [expand]);

  const handleMouseLeave = useCallback(() => {
    // If pinned or settings panel is open, do NOT initiate collapse
    if (isPinned || preventCollapseRef.current) return;

    // If trigger is 'click', do NOT auto-collapse on hover leave! User wants click control.
    if (customizationRef.current.expandTrigger === "click") return;

    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
    }
    const delay = customizationRef.current.collapseDelayMs || 450;
    leaveTimeoutRef.current = window.setTimeout(() => {
      collapse();
      leaveTimeoutRef.current = null;
    }, delay);
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

  // Initial window size ONLY ONCE on mount
  useEffect(() => {
    const initiallyPinned = localStorage.getItem("widget_pinned") === "true";
    if (initiallyPinned) {
      isExpandedRef.current = true;
      setIsExpanded(true);
      const targetSize = expandedDimensionsRef.current;
      resizeNativeWindow(targetSize.width, targetSize.height, 0, 0);
    } else {
      isExpandedRef.current = false;
      setIsExpanded(false);
      resizeNativeWindow(COLLAPSED_SIZE.width, COLLAPSED_SIZE.height, 0, 0);
    }
  }, [resizeNativeWindow]);

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
