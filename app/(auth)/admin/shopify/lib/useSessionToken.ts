"use client";

import { useCallback } from "react";

declare global {
  interface Window {
    shopify?: {
      idToken: () => Promise<string>;
    };
  }
}

export function useSessionToken() {
  const fetchWithToken = useCallback(
    async (url: string, options: RequestInit = {}) => {
      let token = "";
      if (typeof window !== "undefined" && window.shopify) {
        try {
          token = await window.shopify.idToken();
        } catch (e) {
          console.error("Failed to retrieve Shopify App Bridge session token:", e);
        }
      } else {
        console.warn("Shopify App Bridge v4 global object 'shopify' not found on window");
      }

      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    },
    []
  );

  return { fetchWithToken };
}
