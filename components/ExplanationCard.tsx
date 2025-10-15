'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Share, Download, Volume2 } from 'lucide-react';
import type { ExplainResponse } from '@/types';
import { ExpandableText } from './expandable/ExpandableText';
import { SelectionChatbox } from './SelectionChatbox';
import { cn } from '@/lib/utils/cn';

interface ExplanationCardProps {
  explanation: ExplainResponse;
}

export function ExplanationCard({ explanation }: ExplanationCardProps) {
  const { topic, root, metadata } = explanation;
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (text && text.length > 0) {
      setSelectedText(text);
      // Don't clear the selection so it stays highlighted
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(root.text);
  };

  const handleShare = () => {
    const url = `${window.location.origin}?q=${encodeURIComponent(topic)}`;
    navigator.clipboard.writeText(url);
  };

  const handleDownload = () => {
    const content = `# ${topic}\n\n${root.text}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oneshot_${topic.toLowerCase().replace(/\s+/g, '_')}.md`;
    a.click();
  };

  const handleGenerateAudio = async () => {
    if (audioUrl) {
      // Audio already generated, just play it
      const audio = new Audio(audioUrl);
      audio.play();
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      return;
    }

    setIsGeneratingAudio(true);
    try {
      const response = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: root.text, voice: 'alloy' }),
      });

      if (!response.ok) throw new Error('Failed to generate audio');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      // Play the audio
      const audio = new Audio(url);
      audio.play();
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
    } catch (error) {
      console.error('Audio generation failed:', error);
      alert('Failed to generate audio. Please try again.');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-8 md:p-10">
        {/* Header - minimal */}
        <div className="mb-8 pb-6 border-b border-white/[0.06]">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-light text-gray-100 mb-2">{topic}</h2>

              {/* Audio button below title */}
              <button
                onClick={handleGenerateAudio}
                disabled={isGeneratingAudio || isPlaying}
                className={cn(
                  'flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full',
                  'text-xs text-gray-500 hover:text-gray-300',
                  'bg-white/[0.02] hover:bg-white/[0.05]',
                  'border border-white/[0.06] hover:border-white/10',
                  'transition-all duration-200',
                  (isGeneratingAudio || isPlaying) && 'opacity-50'
                )}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>
                  {isGeneratingAudio ? 'generating...' : isPlaying ? 'playing...' : 'read it'}
                </span>
              </button>
            </div>

            {/* Actions - subtle icons */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleCopy}
                className={cn(
                  'p-2 rounded-full',
                  'text-gray-500 hover:text-gray-300',
                  'hover:bg-white/[0.05]',
                  'transition-all duration-200'
                )}
                title="Copy text"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={handleShare}
                className={cn(
                  'p-2 rounded-full',
                  'text-gray-500 hover:text-gray-300',
                  'hover:bg-white/[0.05]',
                  'transition-all duration-200'
                )}
                title="Copy link"
              >
                <Share className="w-4 h-4" />
              </button>
              <button
                onClick={handleDownload}
                className={cn(
                  'p-2 rounded-full',
                  'text-gray-500 hover:text-gray-300',
                  'hover:bg-white/[0.05]',
                  'transition-all duration-200'
                )}
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Explanation Content */}
        <div
          className="prose prose-invert max-w-none relative"
          onMouseUp={handleTextSelection}
        >
          <ExpandableText node={root} topic={topic} />
        </div>

        {/* Hint - very subtle */}
        <div className="mt-8 pt-6 border-t border-white/[0.04]">
          <p className="text-xs text-gray-600 text-center">
            click words to expand · select text to ask questions
          </p>
        </div>
      </div>

      {/* Selection Chatbox */}
      <AnimatePresence>
        {selectedText && (
          <SelectionChatbox
            selectedText={selectedText}
            onClose={() => setSelectedText(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
