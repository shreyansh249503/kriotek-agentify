"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DotsThree,
  PencilSimple,
  Brain,
  Copy,
  Check,
  Trash,
} from "@phosphor-icons/react";
import { BotCardProps } from "./type";
import {
  CardWrapper,
  CardBanner,
  BannerLeft,
  LogoCircle,
  LogoImg,
  BotNameLabel,
  MiniChatWindow,
  MiniChatHeader,
  MiniAvatarCircle,
  MiniLogoImg,
  MiniChatTitle,
  MiniChatBody,
  MiniBotBubble,
  MiniUserBubble,
  MiniBotResponseBubble,
  CardFooter,
  FooterLeft,
  CompanyName,
  TrainedTimeText,
  MenuWrapper,
  MenuButton,
  DropdownMenu,
  DropdownItem,
  ModalBackdrop,
  ModalCard,
  ModalTitle,
  ModalDescription,
  ModalBotName,
  ModalActions,
  ModalCancelButton,
  ModalDeleteButton,
  ModalSpinner,
} from "./styled";
import { useDeleteBot } from "@/hooks/useBot";

export function formatTrainedTime(
  dateInput?: string | Date | number | null,
  fallback = "--",
): string {
  if (!dateInput) return fallback;

  // If already formatted relative string or contains prefix
  if (typeof dateInput === "string") {
    const trimmed = dateInput.trim();
    const cleanStr = trimmed.replace(/^last trained\s+/i, "");
    if (/\b(ago|just now|yesterday|today|now)\b/i.test(cleanStr)) {
      return cleanStr;
    }
  }

  // Handle timestamp strings e.g. "1723456789000"
  let parsedInput: string | Date | number = dateInput;
  if (typeof dateInput === "string" && /^\d+$/.test(dateInput.trim())) {
    parsedInput = Number(dateInput.trim());
  }

  const date = new Date(parsedInput);
  if (isNaN(date.getTime())) return fallback;
  const diffInSeconds = Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 1000),
  );

  if (diffInSeconds < 60) return "just now";
  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ${days === 1 ? "day" : "days"} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} ${months === 1 ? "month" : "months"} ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Fallback Robot Icon
const AgentifyLogo = ({ size = 36 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Agentify Logo"
  >
    <rect width="40" height="40" rx="20" fill="#F3F4F6" />
    <path
      d="M20 12C15.5817 12 12 15.5817 12 20C12 24.4183 15.5817 28 20 28C24.4183 28 28 24.4183 28 20C28 15.5817 24.4183 12 20 12Z"
      fill="#10B981"
    />
    <circle cx="17" cy="19" r="1.5" fill="#FFFFFF" />
    <circle cx="23" cy="19" r="1.5" fill="#FFFFFF" />
    <path
      d="M17 23C18 24 22 24 23 23"
      stroke="#FFFFFF"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const MiniAgentifyLogo = ({ size = 14 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20 10C14.5 10 10 14.5 10 20C10 25.5 14.5 30 20 30C25.5 30 30 25.5 30 20C30 14.5 25.5 10 20 10Z"
      fill="#FFFFFF"
    />
    <path
      d="M20.5 17C23.5 20.5 26.5 24 28 28C25.5 28 22.5 28 22.5 28C22 23 21 19.5 20.5 17Z"
      fill="#111111"
    />
  </svg>
);

export const BotCard = ({
  bot,
  companyName,
  lastTrained,
  onEdit,
  onIngest,
  onDelete,
  onClick,
}: BotCardProps) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const deleteBotMutation = useDeleteBot();

  const botName = bot?.name || "Agentify's Bot";
  const displayCompanyName =
    companyName || bot?.company_name || "Agentify Pvt Ltd";
  const primaryColor = bot?.primary_color || "#111111";

  const rawTrainedDate = lastTrained || bot?.last_trained_at;

  const trainedTimeFormatted = formatTrainedTime(
    rawTrainedDate,
    "Not trained yet",
  );
  const displayTrainedText =
    !rawTrainedDate ||
    trainedTimeFormatted === "Not trained yet" ||
    trainedTimeFormatted === "--"
      ? "Not trained yet"
      : trainedTimeFormatted.toLowerCase().startsWith("last trained")
        ? trainedTimeFormatted
        : `Last trained ${trainedTimeFormatted}`;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDeleteModalOpen && !isDeleting) {
        setIsDeleteModalOpen(false);
      }
    };

    if (isDeleteModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDeleteModalOpen, isDeleting]);

  const handleCopyKey = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (bot?.public_key) {
      try {
        await navigator.clipboard.writeText(bot.public_key);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
      }
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    if (onEdit) {
      onEdit(bot);
    } else {
      router.push(`/admin/bot/${bot.id}/edit-bot`);
    }
  };

  const handleIngestClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    if (onIngest) {
      onIngest(bot);
    } else {
      router.push(`/admin/bots/${bot.public_key}/ingest`);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    setIsDeleteModalOpen(true);
  };

  const handleCancelDelete = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isDeleting) {
      setIsDeleteModalOpen(false);
    }
  };

  const handleConfirmDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    try {
      if (onDelete) {
        await onDelete(bot);
      } else if (bot?.id) {
        await deleteBotMutation.mutateAsync(bot.id);
      }
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error("Failed to delete bot:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(bot);
    }
  };

  return (
    <>
      <CardWrapper onClick={handleCardClick}>
        <CardBanner $primaryColor={primaryColor}>
          <BannerLeft>
            <LogoCircle>
              {bot?.logo_url ? (
                <LogoImg src={bot.logo_url} alt={botName} />
              ) : (
                <AgentifyLogo size={36} />
              )}
            </LogoCircle>
            <BotNameLabel title={botName}>{botName}</BotNameLabel>
          </BannerLeft>

          <MiniChatWindow>
            <MiniChatHeader $color={primaryColor}>
              <MiniAvatarCircle>
                {bot?.logo_url ? (
                  <MiniLogoImg src={bot.logo_url} alt={botName} />
                ) : (
                  <MiniAgentifyLogo size={12} />
                )}
              </MiniAvatarCircle>
              <MiniChatTitle>{botName}</MiniChatTitle>
            </MiniChatHeader>

            <MiniChatBody>
              <MiniBotBubble />
              <MiniUserBubble $color={primaryColor} />
              <MiniBotResponseBubble />
            </MiniChatBody>
          </MiniChatWindow>
        </CardBanner>

        <CardFooter>
          <FooterLeft>
            <CompanyName title={displayCompanyName}>
              {displayCompanyName}
            </CompanyName>
            <TrainedTimeText>{displayTrainedText}</TrainedTimeText>
          </FooterLeft>

          <MenuWrapper ref={menuRef}>
            <MenuButton
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen((prev) => !prev);
              }}
              aria-label="More options"
              aria-expanded={isMenuOpen}
            >
              <DotsThree size={20} weight="bold" />
            </MenuButton>

            {isMenuOpen && (
              <DropdownMenu role="menu" onMouseDown={(e) => e.stopPropagation()}>
                <DropdownItem
                  type="button"
                  role="button"
                  aria-label="Edit"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={handleEditClick}
                >
                  <PencilSimple size={15} weight="bold" />
                  <span>Edit</span>
                </DropdownItem>

                <DropdownItem
                  type="button"
                  role="button"
                  aria-label="Ingest"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={handleIngestClick}
                >
                  <Brain size={15} weight="bold" />
                  <span>Ingest</span>
                </DropdownItem>

                <DropdownItem
                  type="button"
                  role="button"
                  aria-label="Copy Key"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={handleCopyKey}
                >
                  {copied ? (
                    <Check size={15} weight="bold" color="#10B981" />
                  ) : (
                    <Copy size={15} weight="bold" />
                  )}
                  <span>{copied ? "Copied Key!" : "Copy Key"}</span>
                </DropdownItem>

                <DropdownItem
                  type="button"
                  role="button"
                  aria-label="Delete"
                  $danger
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={handleDeleteClick}
                >
                  <Trash size={15} weight="bold" />
                  <span>Delete</span>
                </DropdownItem>
              </DropdownMenu>
            )}
          </MenuWrapper>
        </CardFooter>
      </CardWrapper>

      {isDeleteModalOpen && (
        <ModalBackdrop
          onClick={handleCancelDelete}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <ModalCard onClick={(e) => e.stopPropagation()}>
            <ModalTitle id="delete-dialog-title">Delete Bot</ModalTitle>
            <ModalDescription>
              Are you sure you want to delete{" "}
              <ModalBotName>{botName}</ModalBotName>? This will permanently
              delete this bot, its ingested knowledge documents, and all
              conversation history. This action cannot be undone.
            </ModalDescription>
            <ModalActions>
              <ModalCancelButton
                type="button"
                onClick={handleCancelDelete}
                disabled={isDeleting}
              >
                Cancel
              </ModalCancelButton>
              <ModalDeleteButton
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                aria-label="Confirm Delete"
              >
                {isDeleting ? (
                  <>
                    <ModalSpinner />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash size={15} weight="bold" />
                    <span>Delete</span>
                  </>
                )}
              </ModalDeleteButton>
            </ModalActions>
          </ModalCard>
        </ModalBackdrop>
      )}
    </>
  );
};
