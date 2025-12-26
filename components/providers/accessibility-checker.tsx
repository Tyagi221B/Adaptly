"use client";

import { useEffect } from "react";
import React from "react";
import ReactDOM from "react-dom";

export function AccessibilityChecker() {
  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    // Dynamically import axe-core to avoid bundling in production
    import("@axe-core/react").then((axe) => {
      axe.default(React, ReactDOM, 1000, {});
    }).catch(() => {
      // Silently fail if axe-core isn't available
    });
  }, []);

  return null;
}
