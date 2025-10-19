import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';

interface AnimatedSceneProps {
  scene: {
    visual: string;
    narration: string;
    duration: number;
  };
  index: number;
}

export const AnimatedScene: React.FC<AnimatedSceneProps> = ({ scene, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Text animation
  const textOpacity = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  const textY = interpolate(frame, [0, 30], [50, 0], {
    extrapolateRight: 'clamp',
  });

  // Circle animation (grows from center)
  const circleScale = spring({
    frame: frame - 10,
    fps,
    from: 0,
    to: 1,
    config: { damping: 100, stiffness: 200 },
  });

  // Lines animation (draw from left to right)
  const lineProgress = interpolate(frame, [20, 50], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Background gradient rotation
  const gradientRotation = interpolate(frame, [0, 180], [0, 360]);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${gradientRotation}deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)`,
      }}
    >
      {/* Animated geometric shapes */}
      <svg
        width="100%"
        height="100%"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {/* Grid lines */}
        {[...Array(10)].map((_, i) => (
          <line
            key={`h-${i}`}
            x1="0"
            y1={i * 108}
            x2={1920 * lineProgress}
            y2={i * 108}
            stroke="rgba(96, 165, 250, 0.1)"
            strokeWidth="1"
          />
        ))}
        {[...Array(17)].map((_, i) => (
          <line
            key={`v-${i}`}
            x1={i * 120}
            y1="0"
            x2={i * 120}
            y2={1080 * lineProgress}
            stroke="rgba(96, 165, 250, 0.1)"
            strokeWidth="1"
          />
        ))}

        {/* Animated circles */}
        <circle
          cx="200"
          cy="200"
          r={80 * circleScale}
          fill="none"
          stroke="rgba(139, 92, 246, 0.4)"
          strokeWidth="2"
        />
        <circle
          cx="1720"
          cy="200"
          r={60 * circleScale}
          fill="none"
          stroke="rgba(236, 72, 153, 0.4)"
          strokeWidth="2"
        />
        <circle
          cx="200"
          cy="880"
          r={100 * circleScale}
          fill="none"
          stroke="rgba(59, 130, 246, 0.4)"
          strokeWidth="2"
        />
        <circle
          cx="1720"
          cy="880"
          r={70 * circleScale}
          fill="none"
          stroke="rgba(168, 85, 247, 0.4)"
          strokeWidth="2"
        />

        {/* Center connecting lines */}
        <line
          x1="960"
          y1="540"
          x2={960 + 300 * lineProgress}
          y2={540 - 200 * lineProgress}
          stroke="rgba(96, 165, 250, 0.3)"
          strokeWidth="3"
        />
        <line
          x1="960"
          y1="540"
          x2={960 - 300 * lineProgress}
          y2={540 + 200 * lineProgress}
          stroke="rgba(168, 85, 247, 0.3)"
          strokeWidth="3"
        />
      </svg>

      {/* Text content */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          padding: '120px',
          zIndex: 10,
        }}
      >
        {/* Main narration with animated background */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '60px 80px',
            opacity: textOpacity,
            transform: `translateY(${textY}px)`,
          }}
        >
          <div
            style={{
              fontSize: '64px',
              fontWeight: '300',
              color: 'white',
              textAlign: 'center',
              lineHeight: '1.5',
              maxWidth: '1200px',
              letterSpacing: '-0.02em',
            }}
          >
            {scene.narration}
          </div>
        </div>

        {/* Scene indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: '60px',
            left: '60px',
            display: 'flex',
            gap: '12px',
            opacity: textOpacity * 0.6,
          }}
        >
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              style={{
                width: i === index ? '40px' : '12px',
                height: '4px',
                background: i === index
                  ? 'rgba(96, 165, 250, 0.8)'
                  : 'rgba(255, 255, 255, 0.2)',
                borderRadius: '2px',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
