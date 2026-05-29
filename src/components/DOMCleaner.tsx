"use client";

import { useEffect } from "react";

export function DOMCleaner() {
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && (node as HTMLElement).hasAttribute('bis_skin_checked')) {
            (node as HTMLElement).removeAttribute('bis_skin_checked');
          }
        });
      });
    });
    observer.observe(document.documentElement, { attributes: true, subtree: true, childList: true });
    return () => observer.disconnect();
  }, []);
  return null;
}
