const { bundle } = require('@remotion/bundler');
const { renderMedia, selectComposition } = require('@remotion/renderer');
const path = require('path');
const fs = require('fs');

async function renderVideo(scriptData, outputPath) {
  try {
    console.log('Starting video render...');

    // Bundle Remotion project
    const bundleLocation = await bundle({
      entryPoint: path.join(__dirname, '../remotion/Root.tsx'),
      webpackOverride: (config) => config,
    });

    console.log('Bundle created at:', bundleLocation);

    // Calculate duration
    const totalDuration = scriptData.scenes.reduce(
      (acc, scene) => acc + scene.duration,
      0
    );
    const fps = 30;
    const durationInFrames = Math.round(totalDuration * fps);

    console.log(`Total duration: ${totalDuration}s (${durationInFrames} frames)`);

    // Select composition
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'ExplainerVideo',
      inputProps: scriptData,
    });

    console.log('Composition selected:', composition.id);

    // Render
    await renderMedia({
      composition: {
        ...composition,
        durationInFrames,
        props: scriptData,
      },
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps: scriptData,
    });

    console.log('Video rendered successfully:', outputPath);
    return { success: true, outputPath };
  } catch (error) {
    console.error('Render error:', error);
    return { success: false, error: error.message };
  }
}

// CLI usage
if (require.main === module) {
  const scriptPath = process.argv[2];
  const outputPath = process.argv[3];

  if (!scriptPath || !outputPath) {
    console.error('Usage: node render-video.js <script.json> <output.mp4>');
    process.exit(1);
  }

  const scriptData = JSON.parse(fs.readFileSync(scriptPath, 'utf-8'));
  renderVideo(scriptData, outputPath)
    .then((result) => {
      if (result.success) {
        console.log('✅ Success!');
        process.exit(0);
      } else {
        console.error('❌ Failed:', result.error);
        process.exit(1);
      }
    });
}

module.exports = { renderVideo };
