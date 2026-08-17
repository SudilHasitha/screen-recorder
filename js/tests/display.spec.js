import { expect } from 'https://unpkg.com/chai@4.3.10/chai.js';
import {
  resolveGetDisplayMedia,
  supportsDisplayCapture,
  buildDisplayConstraintAttempts,
  captureDisplayMedia
} from '../capture/display.js';

describe('capture/display', () => {
  it('resolveGetDisplayMedia uses mediaDevices.getDisplayMedia', () => {
    const fn = async () => 'ok';
    const nav = { mediaDevices: { getDisplayMedia: fn } };
    expect(supportsDisplayCapture(nav)).to.equal(true);
    expect(resolveGetDisplayMedia(nav)).to.be.a('function');
  });

  it('resolveGetDisplayMedia accepts navigator.mediaDevice (singular)', () => {
    const fn = async () => 'ok';
    const nav = { mediaDevice: { getDisplayMedia: fn } };
    expect(supportsDisplayCapture(nav)).to.equal(true);
  });

  it('resolveGetDisplayMedia returns null when missing', () => {
    expect(resolveGetDisplayMedia({})).to.equal(null);
    expect(supportsDisplayCapture({ mediaDevices: {} })).to.equal(false);
  });

  it('Android constraints stay loose and skip system audio', () => {
    const attempts = buildDisplayConstraintAttempts({
      frameRate: 60,
      systemAudio: true,
      android: true
    });
    expect(attempts[0].video).to.equal(true);
    expect(attempts[0].audio).to.equal(false);
    expect(attempts[0].monitorTypeSurfaces).to.equal('include');
  });

  it('desktop constraints can request system audio', () => {
    const attempts = buildDisplayConstraintAttempts({
      frameRate: 60,
      systemAudio: true,
      android: false
    });
    expect(attempts[0].audio).to.equal(true);
    expect(attempts[0].video.frameRate.ideal).to.equal(60);
  });

  it('captureDisplayMedia throws DISPLAY_MEDIA_MISSING when API is absent', async () => {
    try {
      await captureDisplayMedia({}, {});
      expect.fail('should have thrown');
    } catch (err) {
      expect(err.code).to.equal('DISPLAY_MEDIA_MISSING');
      expect(err.name).to.equal('NotSupportedError');
    }
  });

  it('captureDisplayMedia retries looser constraints after OverconstrainedError', async () => {
    const calls = [];
    const nav = {
      mediaDevices: {
        getDisplayMedia: async (opts) => {
          calls.push(opts);
          if (calls.length === 1) {
            const err = new Error('overconstrained');
            err.name = 'OverconstrainedError';
            throw err;
          }
          return { kind: 'stream' };
        }
      }
    };
    const stream = await captureDisplayMedia({ android: true }, nav);
    expect(stream).to.deep.equal({ kind: 'stream' });
    expect(calls.length).to.be.greaterThan(1);
  });

  it('captureDisplayMedia does not retry NotAllowedError', async () => {
    let calls = 0;
    const nav = {
      mediaDevices: {
        getDisplayMedia: async () => {
          calls += 1;
          const err = new Error('denied');
          err.name = 'NotAllowedError';
          throw err;
        }
      }
    };
    try {
      await captureDisplayMedia({ android: false }, nav);
      expect.fail('should have thrown');
    } catch (err) {
      expect(err.name).to.equal('NotAllowedError');
      expect(calls).to.equal(1);
    }
  });
});
