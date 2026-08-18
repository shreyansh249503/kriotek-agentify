"use client";

import { useState, useCallback } from "react";
import { BotConfig } from "./type";

interface UseLogoUploadProps {
  update: <K extends keyof BotConfig>(field: K, value: BotConfig[K]) => void;
  setBanner: (
    banner: { tone: "success" | "critical"; message: string } | null,
  ) => void;
}

export function useLogoUpload({ update, setBanner }: UseLogoUploadProps) {
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const handleLogoUpload = useCallback(
    async (
      _dropFiles: File[],
      acceptedFiles: File[],
      _rejectedFiles: File[],
    ) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (file.size > 1024 * 1024) {
        setBanner({
          tone: "critical",
          message: "File is too large. Max size is 1MB.",
        });
        return;
      }

      setUploadingLogo(true);
      setBanner(null);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (res.ok && data.url) {
          update("logo_url", data.url);
          setBanner({
            tone: "success",
            message: "Logo uploaded successfully.",
          });
        } else {
          setBanner({
            tone: "critical",
            message: data.error || "Upload failed. Try again.",
          });
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        setBanner({ tone: "critical", message: `Upload error: ${message}` });
      } finally {
        setUploadingLogo(false);
      }
    },
    [update, setBanner],
  );

  return {
    uploadingLogo,
    handleLogoUpload,
  };
}
