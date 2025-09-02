// Mix screen (system) audio and mic via Web Audio API
export function createAudioMixer(displayStream, micStream) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const dest = ctx.createMediaStreamDestination();

  const addIfHasAudio = (stream) => {
    if (!stream || stream.getAudioTracks().length === 0) return null;
    const src = ctx.createMediaStreamSource(stream);
    const g = ctx.createGain();
    g.gain.value = 1.0;
    src.connect(g).connect(dest);
    return src;
  };

  const screenSrc = addIfHasAudio(displayStream);
  const micSrc = addIfHasAudio(micStream);

  const audioTracks = dest.stream.getAudioTracks();
  return {
    stream: new MediaStream(audioTracks),
    ctx,
    stop() { try { ctx.close(); } catch {} }
  };
}
