"use client";

import { cn } from "@/lib/utils";
import { useNewsStore } from "@/store/newsStore";

const sections = [
  "Breaking News",
  "Technology",
  "Business",
  "Science",
  "Politics",
  "Sports",
];

export function TopicBar() {
  const { selectedSection, setSelectedSection } = useNewsStore();

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-14 max-w-screen-2xl items-center">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {sections.map((section) => (
            <button
              key={section}
              onClick={() => setSelectedSection(section)}
              className={cn(
                "relative px-4 py-1.5 text-sm font-medium transition-colors",
                "hover:text-foreground/80",
                "border border-black",
                selectedSection === section
                  ? "text-foreground bg-gray-100"
                  : "text-foreground/60"
              )}
            >
              {section}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
