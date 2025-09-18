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


export function BreadcrumbsSetter({ items }: { items: Crumb[] }) {
  const { setItems } = useBreadcrumbs();

  useEffect(() => {
    setItems(items || []);
    return () => setItems([]);
    
  }, [JSON.stringify(items)]);

  return null;
}


export { Breadcrumbs };
