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

      // Let the browser set multipart boundaries for FormData bodies.
      const isFormData =
        typeof FormData !== "undefined" && options.body instanceof FormData;

      return fetch(url, {
        ...options,
        headers: {
          ...(isFormData ? {} : { "Content-Type": "application/json" }),
          ...options.headers,
          Authorization: `Bearer ${token}`,
        },
      });
    },
    []
  );

  return { fetchWithToken };
}
