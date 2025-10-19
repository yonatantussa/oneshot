import React from 'react';
import {
  AbsoluteFill,
  useVideoConfig,
  Sequence,
} from 'remotion';
import { AnimatedScene } from './AnimatedScene';

interface Scene {
  visual: string;
  narration: string;
  duration: number;
}

export interface ExplainerVideoProps {
  title: string;
  scenes: Scene[];
}

export const ExplainerVideo: React.FC<ExplainerVideoProps> = ({
  title,
  scenes,
}) => {
  const { fps } = useVideoConfig();

  let currentFrame = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0f' }}>
      {scenes.map((scene, index) => {
        const durationInFrames = Math.round(scene.duration * fps);
        const sequenceStart = currentFrame;
        currentFrame += durationInFrames;

        return (
          <Sequence
            key={index}
            from={sequenceStart}
            durationInFrames={durationInFrames}
          >
            <AnimatedScene scene={scene} index={index} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
