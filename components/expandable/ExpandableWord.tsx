'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import type { ExplanationNode } from '@/types';
import { cn } from '@/lib/utils/cn';
import { ExpandableText } from './ExpandableText';

interface ExpandableWordProps {
  word: string;
  topic: string;
  parentContext: string;
  depth: number;
}

export function ExpandableWord({
  word,
  topic,
  parentContext,
  depth,
}: ExpandableWordProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedContent, setExpandedContent] = useState<ExplanationNode | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent text selection when clicking

    if (isExpanded) {
      setIsExpanded(false);
      return;
    }

    // If already loaded, just expand
    if (expandedContent) {
      setIsExpanded(true);
      return;
    }

    // Load content on-demand
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/expand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          termId: `word-${word}-${depth}`,
          term: word,
          parentContext,
          depth,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to expand word');
      }

      const data = await response.json();
      setExpandedContent(data.node);
      setIsExpanded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
      // Don't show error UI, just silently fail for better UX
      console.error('Expansion error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={cn(
          'inline px-0.5 rounded',
          'transition-all duration-150',
          'hover:bg-white/[0.08] hover:text-gray-100',
          'cursor-pointer',
          'relative z-0',
          isLoading && 'animate-pulse opacity-70',
          isExpanded && 'bg-white/[0.06] text-gray-100'
        )}
        title="Click to expand"
      >
        {word}
      </button>

      <AnimatePresence>
        {isExpanded && expandedContent && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="block w-full overflow-hidden"
          >
            <div
              className={cn(
                'ml-4 pl-4 py-3 rounded-lg',
                'border-l border-l-white/10',
                'bg-gradient-to-r from-white/[0.02] to-transparent'
              )}
            >
              <div className="text-xs text-gray-500 mb-2">→ {word}</div>
              <ExpandableText
                node={expandedContent}
                topic={topic}
                depth={depth + 1}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
