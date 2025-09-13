import Link from "next/link";
import React from "react";
import { ChevronRight } from "lucide-react";

interface Crumb {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items: Crumb[];
  separator?: React.ReactNode;
  className?: string;
}

export default function Breadcrumbs({ items, separator, className }: BreadcrumbsProps) {
  if (!items || items.length === 0) return null;

  const sep = separator ?? <ChevronRight className="h-4 w-4 text-muted-foreground" />;

  return (
    <nav className={`flex items-center gap-2 text-sm text-muted-foreground ${className || ""}`} aria-label="Breadcrumb">
      <ol className="flex items-center gap-2 overflow-x-auto">
        {items.map((it, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx} className="flex items-center gap-2">
              {it.icon && <span className="mr-1">{it.icon}</span>}
              {!isLast && it.href ? (
                <Link href={it.href} className="text-muted-foreground hover:text-foreground">
                  {it.label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined} className={isLast ? "text-foreground font-medium" : ""}>
                  {it.label}
                </span>
              )}
              {!isLast && <span className="mx-2">{sep}</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
