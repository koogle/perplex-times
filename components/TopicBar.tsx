"use client";

import { Button } from "@/components/ui/button";
import { useNewsStore } from "@/store/newsStore";

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

  return (
    <div className="sticky top-14 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-12 items-center justify-between">
        <div className="flex items-center space-x-4">
          {sections.map((section) => (
            <Button
              key={section}
              variant={selectedSection === section ? "default" : "ghost"}
              onClick={() => setSelectedSection(section)}
              className={`h-8 ${
                section === "Breaking News"
                  ? "font-semibold text-[#1A1A1A] hover:text-black"
                  : ""
              }`}
            >
              {section}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
