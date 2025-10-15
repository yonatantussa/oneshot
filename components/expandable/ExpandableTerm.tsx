'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Loader2 } from 'lucide-react';
import type { ExpandableTerm as ExpandableTermType, ExplanationNode } from '@/types';
import { cn } from '@/lib/utils/cn';
import { ExpandableText } from './ExpandableText';

interface ExpandableTermProps {
  term: ExpandableTermType;
  topic: string;
  parentContext: string;
  depth: number;
  onExpand?: (termId: string) => void;
}

export function ExpandableTerm({
  term,
  topic,
  parentContext,
  depth,
  onExpand,
}: ExpandableTermProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedContent, setExpandedContent] = useState<ExplanationNode | null>(
    term.expandedContent || null
  );
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async () => {
    if (isExpanded) {
      setIsExpanded(false);
      return;
    }

    // If already loaded, just expand
    if (expandedContent) {
      setIsExpanded(true);
      onExpand?.(term.id);
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
          termId: term.id,
          term: term.term,
          parentContext,
          depth,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to expand term');
      }

      const data = await response.json();
      setExpandedContent(data.node);
      setIsExpanded(true);
      onExpand?.(term.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setIsLoading(false);
    }
  };

  const depthColors = [
    'border-gray-400/20 bg-gray-500/[0.03] hover:bg-gray-500/[0.08]',
    'border-gray-400/15 bg-gray-500/[0.02] hover:bg-gray-500/[0.06]',
    'border-gray-400/12 bg-gray-500/[0.02] hover:bg-gray-500/[0.05]',
    'border-gray-400/10 bg-gray-500/[0.01] hover:bg-gray-500/[0.04]',
  ];

  const colorClass = depthColors[depth % depthColors.length];

  return (
    <>
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={cn(
          'inline px-1.5 py-0.5 -mx-1.5 rounded',
          'border-b-2 border-gray-400/30',
          'transition-all duration-200',
          'font-normal',
          'hover:bg-white/[0.05] hover:border-gray-300/50',
          'cursor-pointer',
          isLoading && 'cursor-wait opacity-70 animate-pulse',
          isExpanded && 'bg-white/[0.08] border-gray-300/60'
        )}
        title={term.summary || 'Click to expand'}
      >
        {term.term}
      </button>

      <AnimatePresence>
        {isExpanded && expandedContent && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div
              className={cn(
                'ml-4 pl-4 py-3 rounded-lg',
                'border-l',
                'bg-gradient-to-r from-white/[0.02] to-transparent',
                'border-l-white/10'
              )}
            >
              <ExpandableText
                node={expandedContent}
                topic={topic}
                depth={depth + 1}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="text-xs text-red-400 mt-1">
          {error}
        </div>
      )}
    </>
  );
}
