// components/breadcrumbs/index.tsx
"use client";

import { usePathname } from "next/navigation";
import { CaretRightIcon } from "@phosphor-icons/react";
import {
  BreadcrumbContainer,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "./styled";
import { useBreadcrumb } from "@/context/BreadcrumbContext";

const LABEL_MAP: Record<string, string> = {
  admin: "Dashboard",
  new: "Create New Bot",
  bots: "Bots",
  bot: "Bots", // /bot/[id] parent shows as "Bots"
  leads: "Leads",
  settings: "Settings",
  ingest: "Data Ingestion",
  "edit-bot": "Edit Bot",
};

const HREF_MAP: Record<string, string> = {
  bot: "/admin/bots",
};

export const Breadcrumbs = () => {
  const pathname = usePathname();
  const { meta } = useBreadcrumb();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  const crumbs = segments.map((seg, index) => {
    const defaultHref = "/" + segments.slice(0, index + 1).join("/");
    const href = HREF_MAP[seg] ?? defaultHref; // ✅ use override if exists
    const isLast = index === segments.length - 1;

    // Use custom label (e.g. bot name) or fall back to LABEL_MAP or capitalize
    const label =
      meta.customLabels[seg] ??
      LABEL_MAP[seg] ??
      seg.charAt(0).toUpperCase() + seg.slice(1);

    // Non-linkable: last segment OR explicitly marked (e.g. bot ID with no detail page)
    const isLinkable = !isLast && !meta.nonLinkable.includes(seg);

    return { label, href, isLast, isLinkable };
  });

  return (
    <BreadcrumbContainer>
      {crumbs.map((crumb) => (
        <BreadcrumbItem key={crumb.href}>
          {crumb.isLinkable ? (
            <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
          ) : (
            <span>{crumb.label}</span>
          )}
          {!crumb.isLast && (
            <BreadcrumbSeparator>
              <CaretRightIcon size={18} weight="bold" />
            </BreadcrumbSeparator>
          )}
        </BreadcrumbItem>
      ))}
    </BreadcrumbContainer>
  );
};
