"use client";

import React, { useRef } from "react";
import { StepProps } from "../types";
import {
  StepTitle,
  SectionBlock,
  SectionLabel,
  UrlInputGroup,
  UrlPrefix,
  UrlInputField,
  InfoSubtext,
  OtherSourcesGrid,
  SourceCard,
  SourceIconBox,
  SourceCardTitle,
  SubSourceDrawer,
  SourceInputArea,
} from "../styled";
import { FileText, Type, HelpCircle, Info, Upload, Plus, Trash2 } from "lucide-react";

export const StepTrainingSource: React.FC<StepProps> = ({
  formData,
  updateFormData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({
      websiteUrl: e.target.value,
      trainingMethod: "website",
    });
  };

  const handleSelectMethod = (method: "website" | "files" | "text" | "qna") => {
    updateFormData({ trainingMethod: method });
    if (method === "files" && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      updateFormData({
        files: [...formData.files, ...selectedFiles],
        trainingMethod: "files",
      });
    }
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = formData.files.filter((_, i) => i !== index);
    updateFormData({ files: updatedFiles });
  };

  const handleAddQnA = () => {
    const newQnA = {
      id: Date.now().toString(),
      question: "",
      answer: "",
    };
    updateFormData({
      qnaList: [...formData.qnaList, newQnA],
      trainingMethod: "qna",
    });
  };

  const handleUpdateQnA = (
    id: string,
    field: "question" | "answer",
    value: string
  ) => {
    const updated = formData.qnaList.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    updateFormData({ qnaList: updated });
  };

  const handleRemoveQnA = (id: string) => {
    updateFormData({
      qnaList: formData.qnaList.filter((item) => item.id !== id),
    });
  };

  return (
    <div data-testid="step-training-source">
      <StepTitle>How would you like to train AI Agent?</StepTitle>

      <SectionBlock>
        <SectionLabel htmlFor="website-url-input">
          Your website (recommended)
        </SectionLabel>
        <UrlInputGroup>
          <UrlPrefix>https://</UrlPrefix>
          <UrlInputField
            id="website-url-input"
            type="text"
            placeholder="www.example.com"
            value={formData.websiteUrl}
            onChange={handleUrlChange}
            data-testid="website-url-input"
          />
        </UrlInputGroup>
        <InfoSubtext>
          <Info size={14} />
          <span>
            We&apos;ll extract info from all pages in this domain to train your
            AI Agent.
          </span>
        </InfoSubtext>
      </SectionBlock>

      <SectionBlock>
        <SectionLabel>Other Sources</SectionLabel>
        <OtherSourcesGrid data-testid="other-sources-grid">
          <SourceCard
            type="button"
            $isSelected={formData.trainingMethod === "files"}
            onClick={() => handleSelectMethod("files")}
            data-testid="source-card-files"
          >
            <SourceIconBox>
              <FileText size={16} />
            </SourceIconBox>
            <SourceCardTitle>Add files</SourceCardTitle>
          </SourceCard>

          <SourceCard
            type="button"
            $isSelected={formData.trainingMethod === "text"}
            onClick={() => handleSelectMethod("text")}
            data-testid="source-card-text"
          >
            <SourceIconBox>
              <Type size={16} />
            </SourceIconBox>
            <SourceCardTitle>Add text snippet</SourceCardTitle>
          </SourceCard>

          <SourceCard
            type="button"
            $isSelected={formData.trainingMethod === "qna"}
            onClick={() => handleSelectMethod("qna")}
            data-testid="source-card-qna"
          >
            <SourceIconBox>
              <HelpCircle size={16} />
            </SourceIconBox>
            <SourceCardTitle>Add Q&amp;A&apos;s</SourceCardTitle>
          </SourceCard>
        </OtherSourcesGrid>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt"
          style={{ display: "none" }}
          onChange={handleFileChange}
          data-testid="hidden-file-input"
        />

        {formData.trainingMethod === "text" && (
          <SubSourceDrawer data-testid="text-snippet-drawer">
            <SectionLabel style={{ fontSize: 13, marginBottom: 6 }}>
              Paste or type knowledge text
            </SectionLabel>
            <SourceInputArea
              placeholder="Paste company FAQs, instructions, guidelines, or product information..."
              value={formData.textSnippet}
              onChange={(e) => updateFormData({ textSnippet: e.target.value })}
              data-testid="text-snippet-input"
            />
          </SubSourceDrawer>
        )}

        {formData.trainingMethod === "files" && formData.files.length > 0 && (
          <SubSourceDrawer data-testid="files-drawer">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <SectionLabel style={{ fontSize: 13, margin: 0 }}>
                Selected Files ({formData.files.length})
              </SectionLabel>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  background: "none",
                  border: "none",
                  color: "#18181b",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Upload size={12} /> Add more
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {formData.files.map((file, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "6px 10px",
                    background: "#ffffff",
                    borderRadius: 6,
                    border: "1px solid #e4e4e7",
                    fontSize: 12.5,
                  }}
                >
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "80%",
                    }}
                  >
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(idx)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ef4444",
                      cursor: "pointer",
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </SubSourceDrawer>
        )}

        {formData.trainingMethod === "qna" && (
          <SubSourceDrawer data-testid="qna-drawer">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <SectionLabel style={{ fontSize: 13, margin: 0 }}>
                Questions &amp; Answers
              </SectionLabel>
              <button
                type="button"
                onClick={handleAddQnA}
                style={{
                  background: "none",
                  border: "none",
                  color: "#18181b",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
                data-testid="add-qna-btn"
              >
                <Plus size={12} /> Add Q&amp;A pair
              </button>
            </div>
            {formData.qnaList.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 12,
                  color: "#71717a",
                  fontSize: 12.5,
                }}
              >
                Click &quot;Add Q&amp;A pair&quot; to define custom question &amp;
                answer responses for your agent.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {formData.qnaList.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    style={{
                      padding: 10,
                      background: "#ffffff",
                      borderRadius: 6,
                      border: "1px solid #e4e4e7",
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ fontSize: 12, fontWeight: 600 }}>
                        Q&amp;A #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveQnA(item.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ef4444",
                          cursor: "pointer",
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Question..."
                      value={item.question}
                      onChange={(e) =>
                        handleUpdateQnA(item.id, "question", e.target.value)
                      }
                      style={{
                        padding: "6px 10px",
                        fontSize: 12.5,
                        borderRadius: 4,
                        border: "1px solid #e4e4e7",
                        outline: "none",
                      }}
                    />
                    <textarea
                      placeholder="Answer..."
                      rows={2}
                      value={item.answer}
                      onChange={(e) =>
                        handleUpdateQnA(item.id, "answer", e.target.value)
                      }
                      style={{
                        padding: "6px 10px",
                        fontSize: 12.5,
                        borderRadius: 4,
                        border: "1px solid #e4e4e7",
                        outline: "none",
                        resize: "vertical",
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </SubSourceDrawer>
        )}
      </SectionBlock>
    </div>
  );
};
