"use client";

import { createContext, useCallback, useContext, useState } from "react";

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

  // Stable identity so consumers can list it as an effect dependency without re-running every render.
  const setBreadcrumbMeta = useCallback((incoming: Partial<BreadcrumbMeta>) => {
    setMeta((prev) => ({ ...prev, ...incoming }));
  }, []);

  return (
    <BreadcrumbContext.Provider value={{ meta, setBreadcrumbMeta }}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

export const useBreadcrumb = () => useContext(BreadcrumbContext);
