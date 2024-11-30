'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useNewsStore } from "@/store/newsStore";
import { RefreshCw } from "lucide-react";

const sections = [
  "Breaking News",
  "Technology",
  "Business",
  "Science",
  "Health",
  "Politics",
  "Entertainment",
];

export function TopicBar() {
  const { selectedSection, setSelectedSection } = useNewsStore();
  const [isReloading, setIsReloading] = useState(false);

  const handleReload = async () => {
    setIsReloading(true);
    // Force a reload by changing the key of the main content
    setSelectedSection(selectedSection);
    setTimeout(() => setIsReloading(false), 500);
  };

  return (
    <div className="sticky top-14 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-12 items-center justify-between">
        <div className="flex items-center space-x-4">
          {sections.map((section) => (
            <Button
              key={section}
              variant={selectedSection === section ? "default" : "ghost"}
              onClick={() => setSelectedSection(section)}
              className={`h-8 ${section === "Breaking News" ? "font-semibold text-red-500 hover:text-red-600" : ""}`}
            >
              {section}
            </Button>
          ))}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleReload}
          className={`h-8 w-8 ${isReloading ? "animate-spin" : ""}`}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
