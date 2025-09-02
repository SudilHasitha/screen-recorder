import { expect } from 'https://unpkg.com/chai@4.3.10/chai.js';
import { combineTracks } from '../recording/recorder.js';

describe('recording/recorder', () => {
  it('combineTracks returns a MediaStream', () => {
    // Mock small streams (no actual tracks; just ensure function shape)
    const videoStream = new MediaStream();
    const audioStream = new MediaStream();
    const out = combineTracks(videoStream, audioStream);
    expect(out).to.be.instanceOf(MediaStream);
  });
});
