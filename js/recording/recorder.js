import { chooseMime, bitrateKbpsToBps } from '../util/support.js';

export function createRecorder(stream, opts) {
  const mimeType = chooseMime();
  const rec = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: bitrateKbpsToBps(opts.vKbps || 6000),
    audioBitsPerSecond: bitrateKbpsToBps(opts.aKbps || 192)
  });
  return { rec, mimeType };
}

export function combineTracks(videoStream, audioStream) {
  const tracks = [
    ...videoStream.getVideoTracks(),
    ...audioStream.getAudioTracks()
  ];
  return new MediaStream(tracks);
}
