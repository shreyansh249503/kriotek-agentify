"use client";

import { useState, useEffect } from "react";
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
  bot: "Bots",
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1080);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  const crumbs = segments.map((seg, index) => {
    const defaultHref = "/" + segments.slice(0, index + 1).join("/");
    const href = HREF_MAP[seg] ?? defaultHref;
    const isLast = index === segments.length - 1;

    const label =
      meta.customLabels[seg] ??
      LABEL_MAP[seg] ??
      seg.charAt(0).toUpperCase() + seg.slice(1);

    const isLinkable = !isLast && !meta.nonLinkable.includes(seg);

    return { label, href, isLast, isLinkable };
  });

  const getVisibleCrumbs = () => {
    if (!isMobile || crumbs.length <= 3) return crumbs;

    const first = crumbs[0];
    const last = crumbs[crumbs.length - 1];
    
    return [
      { ...first, isLast: false },
      { label: "...", href: "#", isLast: false, isLinkable: false, isSeparator: true },
      { ...last, isLast: true },
    ];
  };

  const visibleCrumbs = getVisibleCrumbs();

  return (
    <BreadcrumbContainer>
      {visibleCrumbs.map((crumb, index) => (
        <BreadcrumbItem key={`${crumb.href}-${index}`}>
          {crumb.isLinkable ? (
            <BreadcrumbLink href={crumb.href} title={crumb.label}>
              {crumb.label}
            </BreadcrumbLink>
          ) : (
            <span title={crumb.label}>{crumb.label}</span>
          )}
          {!crumb.isLast && (
            <BreadcrumbSeparator>
              <CaretRightIcon size={14} weight="bold" />
            </BreadcrumbSeparator>
          )}
        </BreadcrumbItem>
      ))}
    </BreadcrumbContainer>
  );
};
