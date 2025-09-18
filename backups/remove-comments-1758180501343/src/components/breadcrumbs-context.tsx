"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Breadcrumbs from "./breadcrumbs";

export type Crumb = {
  label: string;
  href?: string;
  icon?: React.ReactNode;
};

type ContextShape = {
  items: Crumb[];
  setItems: (items: Crumb[]) => void;
};

const BreadcrumbsContext = createContext<ContextShape>({
  items: [],
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setItems: () => {},
});

export function BreadcrumbsProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Crumb[]>([]);

  return (
    <BreadcrumbsContext.Provider value={{ items, setItems }}>
      {children}
    </BreadcrumbsContext.Provider>
  );
}

export function useBreadcrumbs() {
  return useContext(BreadcrumbsContext);
}

/**
 * Client helper for server pages to set breadcrumbs declaratively.
 * Render this in a server component and it will update the layout via context.
 */
export function BreadcrumbsSetter({ items }: { items: Crumb[] }) {
  const { setItems } = useBreadcrumbs();

  useEffect(() => {
    setItems(items || []);
    return () => setItems([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(items)]);

  return null;
}

/** Expose the visual Breadcrumbs component for use in places that need direct rendering */
export { Breadcrumbs };
