import { expect } from 'https://unpkg.com/chai@4.3.10/chai.js';
import { isAndroid, isIOS, isInAppBrowser, isSecureRecordingContext } from '../util/platform.js';
import { bitrateKbpsToBps, supportsFS, chooseMime, getFSStatus, getDisplayCaptureStatus, formatFeatureReport } from '../util/support.js';

describe('util/platform', () => {
  it('exposes boolean platform checks', () => {
    expect(typeof isAndroid()).to.equal('boolean');
    expect(typeof isIOS()).to.equal('boolean');
    expect(typeof isInAppBrowser()).to.equal('boolean');
    expect(typeof isSecureRecordingContext()).to.equal('boolean');
  });
});

describe('util/support', () => {
  it('bitrateKbpsToBps converts kbps to bps', () => {
    expect(bitrateKbpsToBps(1000)).to.equal(1_000_000);
    expect(bitrateKbpsToBps('192')).to.equal(192_000);
    expect(bitrateKbpsToBps(-1)).to.equal(0);
    expect(bitrateKbpsToBps('nope')).to.equal(0);
  });

  it('supportsFS returns a boolean', () => {
    expect(typeof supportsFS()).to.equal('boolean');
  });

  it('chooseMime returns a plausible mime', () => {
    const m = chooseMime();
    expect(m).to.be.a('string');
    expect(m.startsWith('video/')).to.equal(true);
  });

  it('getFSStatus includes picker and OPFS fields', () => {
    const status = getFSStatus();
    expect(status).to.include.keys('hasAPI', 'hasOPFS', 'picker', 'opfs', 'supported', 'isSecureContext');
  });

  it('getDisplayCaptureStatus reports getDisplayMedia availability', () => {
    const status = getDisplayCaptureStatus();
    expect(status).to.include.keys('hasAPI', 'hasMediaDevices', 'isSecureContext', 'android', 'supported');
    expect(typeof status.hasAPI).to.equal('boolean');
  });

  it('formatFeatureReport mentions getDisplayMedia', () => {
    expect(formatFeatureReport()).to.include('getDisplayMedia');
  });
});
