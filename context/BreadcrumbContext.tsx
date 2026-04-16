"use client";

import { createContext, useContext, useState } from "react";

type BreadcrumbMeta = {
  customLabels: Record<string, string>; 
  nonLinkable: string[];
};

const BreadcrumbContext = createContext<{
  meta: BreadcrumbMeta;
  setBreadcrumbMeta: (meta: Partial<BreadcrumbMeta>) => void;
}>({
  meta: { customLabels: {}, nonLinkable: [] },
  setBreadcrumbMeta: () => {},
});

export const BreadcrumbProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [meta, setMeta] = useState<BreadcrumbMeta>({
    customLabels: {},
    nonLinkable: [],
  });

  const setBreadcrumbMeta = (incoming: Partial<BreadcrumbMeta>) => {
    setMeta((prev) => ({ ...prev, ...incoming }));
  };

  return (
    <BreadcrumbContext.Provider value={{ meta, setBreadcrumbMeta }}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

export const useBreadcrumb = () => useContext(BreadcrumbContext);
