import { expect } from 'https://unpkg.com/chai@4.3.10/chai.js';
import { bitrateKbpsToBps, supportsFS, chooseMime } from '../util/support.js';

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
    expect(m.startsWith('video/webm')).to.equal(true);
  });
});
