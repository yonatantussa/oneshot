import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { ExplainerVideo } from './ExplainerVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ExplainerVideo"
        component={ExplainerVideo}
        durationInFrames={300} // 10 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: 'Example Topic',
          scenes: [
            {
              visual: 'Abstract tech background',
              narration: 'This is an example scene.',
              duration: 5,
            },
          ],
        }}
      />
    </>
  );
};

registerRoot(RemotionRoot);
