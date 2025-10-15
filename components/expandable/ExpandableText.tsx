'use client';

import type { ExplanationNode } from '@/types';
import { ExpandableWord } from './ExpandableWord';

interface ExpandableTextProps {
  node: ExplanationNode;
  topic: string;
  depth?: number;
}

export function ExpandableText({ node, topic, depth = 0 }: ExpandableTextProps) {
  const { text } = node;

  // Split text into words and punctuation
  const tokens = text.split(/(\s+|[.,!?;:()[\]{}""''—–-])/);

  const elements = tokens.map((token, idx) => {
    // If it's whitespace or punctuation, render as-is
    if (/^\s+$/.test(token) || /^[.,!?;:()[\]{}""''—–-]+$/.test(token)) {
      return <span key={`token-${idx}`}>{token}</span>;
    }

    // If it's a word, make it expandable
    if (token.trim().length > 0) {
      return (
        <ExpandableWord
          key={`word-${idx}`}
          word={token}
          topic={topic}
          parentContext={text}
          depth={depth}
        />
      );
    }

    return null;
  });

  return (
    <div className="text-gray-200 leading-relaxed">
      <div className="text-base">{elements}</div>
    </div>
  );
}
