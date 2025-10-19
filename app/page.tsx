'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown } from 'lucide-react';
import type { ExplainResponse } from '@/types';
import { ExplanationCard } from '@/components/ExplanationCard';
import { cn } from '@/lib/utils/cn';

export default function HomePage() {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState<ExplainResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Options
  const [tone, setTone] = useState<'concise' | 'balanced' | 'detailed'>('balanced');

  // Load topic from URL query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      setTopic(q);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setError(null);
    setExplanation(null);

    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          options: {
            tone,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to generate explanation');
      }

      const data = await response.json();
      setExplanation(data);

      // Update URL without reload
      const url = new URL(window.location.href);
      url.searchParams.set('q', topic.trim());
      window.history.pushState({}, '', url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        {/* Unified header with smooth transitions */}
        <motion.div
          className="text-center mb-8"
          initial={{
            paddingTop: '8rem',
            marginBottom: '4rem',
          }}
          animate={{
            paddingTop: explanation ? '2rem' : '8rem',
            marginBottom: explanation ? '2rem' : '4rem',
          }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.h1
            className="font-light tracking-tight text-gray-100"
            initial={{
              fontSize: '3.75rem',
              color: 'rgb(243, 244, 246)',
            }}
            animate={{
              fontSize: explanation ? '1.5rem' : '3.75rem',
              color: explanation ? 'rgb(209, 213, 219)' : 'rgb(243, 244, 246)',
            }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            oneshot
          </motion.h1>
          <AnimatePresence>
            {!explanation && (
              <motion.p
                className="text-gray-500 text-sm mt-3"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                understand anything
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: 0,
            marginBottom: explanation ? '2rem' : '3rem'
          }}
          transition={{
            opacity: { delay: 0.1, duration: 0.3 },
            y: { delay: 0.1, duration: 0.3 },
            marginBottom: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Main Input - Minimal Design */}
            <div className="relative">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={isFocused ? '' : 'ask anything...'}
                className={cn(
                  'w-full px-6 py-4',
                  'bg-white/[0.03] border border-white/[0.08]',
                  'rounded-full',
                  'text-gray-200 placeholder:text-gray-600',
                  'focus:outline-none focus:border-white/20',
                  'transition-all duration-300',
                  'text-center',
                  isLoading && 'animate-pulse'
                )}
                disabled={isLoading}
                autoFocus={!explanation}
              />

              {/* Subtle options toggle */}
              {!explanation && (
                <button
                  type="button"
                  onClick={() => setShowOptions(!showOptions)}
                  className={cn(
                    'absolute right-4 top-1/2 -translate-y-1/2',
                    'text-gray-500 hover:text-gray-300',
                    'transition-all duration-200',
                    'p-1.5 rounded-full hover:bg-white/5'
                  )}
                >
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 transition-transform duration-200',
                      showOptions && 'rotate-180'
                    )}
                  />
                </button>
              )}
            </div>

            {/* Tone Selector - Minimalist pill buttons */}
            <AnimatePresence>
              {showOptions && !explanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 pb-2 flex gap-2 justify-center">
                    {(['concise', 'balanced', 'detailed'] as const).map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setTone(option)}
                        className={cn(
                          'px-4 py-1.5 rounded-full text-xs transition-all duration-200',
                          tone === option
                            ? 'bg-white/10 text-gray-200 border border-white/20'
                            : 'bg-white/[0.02] text-gray-500 border border-white/[0.06] hover:border-white/10 hover:text-gray-300'
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Status indicator - subtle */}
            {isLoading && (
              <div className="text-center">
                <span className="text-xs text-gray-600 animate-pulse">
                  thinking...
                </span>
              </div>
            )}
          </form>
        </motion.div>

        {/* Error - minimal */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 text-center text-sm text-red-400/80"
          >
            {error}
          </motion.div>
        )}

        {/* Result */}
        <AnimatePresence mode="wait">
          {explanation && (
            <motion.div
              key={explanation.topic}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              <ExplanationCard explanation={explanation} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Example Topics - subtle */}
        {!explanation && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center space-y-3"
          >
            {/* <p className="text-gray-600 text-xs">try</p> */}
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                'transformer attention',
                'quantum entanglement',
                'merkle trees',
              ].map((example) => (
                <button
                  key={example}
                  onClick={() => setTopic(example)}
                  className="px-3 py-1.5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/10 rounded-full text-xs text-gray-500 hover:text-gray-300 transition-all duration-200"
                >
                  {example}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-auto pt-12 pb-8 text-center"
      >
        <p className="text-xs text-gray-600">
          built by{' '}
          <span className="text-gray-500 hover:text-gray-400 transition-colors">
            yonatan tussa
          </span>
        </p>
      </motion.footer>
    </main>
  );
}
