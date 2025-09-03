"use client";

import { ExpandableCardDemo } from "@/components/ui/expandable-card";

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          Expandable Card Test
        </h1>
        <ExpandableCardDemo />
      </div>
    </div>
  );
}
