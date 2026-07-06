import React, { useState } from "react";
import { CreateBotInput } from "@/types/bot";
import { ColorPicker } from "../color-picker";
import {
  FormSection,
  SectionHeader,
  SectionTitle,
  Field,
  Label,
  HelperText,
  UploadContainer,
  RemoveButton,
  UploadButton,
} from "./styled";
import Image from "next/image";

interface AppearanceSectionProps {
  form: CreateBotInput;
  update: <K extends keyof CreateBotInput>(
    key: K,
    value: CreateBotInput[K]
  ) => void;
}

export const AppearanceSection = ({ form, update }: AppearanceSectionProps) => {
  const [uploading, setUploading] = useState(false);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert("File is too large. Max size is 1MB.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        update("logoUrl", data.url);
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <FormSection>
      <SectionHeader>
        <SectionTitle>Appearance</SectionTitle>
      </SectionHeader>

      <Field>
        <ColorPicker
          value={form.primaryColor || "#4f46e5"}
          onChange={(hex) => update("primaryColor", hex)}
        />
        <HelperText>
          This color will be used for buttons and accents.
        </HelperText>
      </Field>

      <Field style={{ marginTop: "20px" }}>
        <Label>Bot Avatar</Label>
        <UploadContainer>
          {form.logoUrl ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              {/* <img
                src={form.logoUrl}
                alt="Bot Avatar"
                style={{
                  width: "58px",
                  height: "58px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "1px solid #ddd",
                }}
              /> */}
              <Image
                src={form.logoUrl}
                alt="Bot Avatar"
                width={58}
                height={58}
                quality={100}
                style={{
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "1px solid #ddd",
                }}
              />
              <RemoveButton type="button" onClick={() => update("logoUrl", "")}>
                Remove
              </RemoveButton>
            </div>
          ) : (
            <UploadButton>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploading}
              />
              {uploading ? (
                "Uploading..."
              ) : (
                <>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Upload Image
                </>
              )}
            </UploadButton>
          )}
        </UploadContainer>
        <HelperText>Recommended: Square image, max 1MB.</HelperText>
      </Field>
    </FormSection>
  );
};
