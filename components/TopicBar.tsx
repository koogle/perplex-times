'use client';

import { useState } from 'react';

interface TopicBarProps {
  sections: string[];
  customTopics: string[];
  onSectionSelect: (section: string) => void;
  onCustomTopicAdd?: (topic: string) => void;
  onCustomTopicRemove?: (topic: string) => void;
  selectedSection: string;
}

export function TopicBar({
  sections,
  customTopics,
  onSectionSelect,
  onCustomTopicAdd,
  onCustomTopicRemove,
  selectedSection,
}: TopicBarProps) {
  const [newTopic, setNewTopic] = useState('');

  const handleTopicAdd = () => {
    if (newTopic.trim() && onCustomTopicAdd) {
      onCustomTopicAdd(newTopic.trim());
      setNewTopic('');
    }
  };

  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-4">
        {/* Default Sections */}
        {sections.map((section) => (
          <button
            key={section}
            onClick={() => onSectionSelect(section)}
            className={`rounded-full px-4 py-2 ${
              selectedSection === section
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {section}
          </button>
        ))}

        {/* Custom Topics */}
        {customTopics.map((topic) => (
          <div key={topic} className="flex items-center">
            <button
              onClick={() => onSectionSelect(topic)}
              className={`rounded-l-full px-4 py-2 ${
                selectedSection === topic
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {topic}
            </button>
            {onCustomTopicRemove && (
              <button
                onClick={() => onCustomTopicRemove(topic)}
                className="rounded-r-full bg-gray-100 px-3 py-2 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add Custom Topic */}
      {onCustomTopicAdd && (
        <div className="mt-4 flex items-center gap-2">
          <input
            type="text"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            placeholder="Add custom topic"
            className="rounded-md border px-3 py-1"
            onKeyPress={(e) => e.key === 'Enter' && handleTopicAdd()}
          />
          <button
            onClick={handleTopicAdd}
            className="rounded-md bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
          >
            Add Topic
          </button>
        </div>
      )}
    </div>
  );
}
