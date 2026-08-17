/**
 * Resolve getDisplayMedia from the current (or injected) navigator.
 * Chrome Android often omits the own-property; check the prototype too.
 */
export function inspectDisplayCapture(nav = navigator) {
  const devices = nav.mediaDevices || nav.mediaDevice || null;
  let typeOf = 'no-mediaDevices';
  let inChain = false;
  if (devices) {
    try {
      typeOf = typeof devices.getDisplayMedia;
      inChain = 'getDisplayMedia' in devices;
    } catch (err) {
      typeOf = `getter-threw:${err?.name || err}`;
    }
  }
  return {
    hasDevices: !!devices,
    typeOf,
    inChain,
    supported: typeof resolveGetDisplayMedia(nav) === 'function'
  };
}

export function resolveGetDisplayMedia(nav = navigator) {
  const devices = nav.mediaDevices || nav.mediaDevice || null;
  if (devices && typeof devices.getDisplayMedia === 'function') {
    return devices.getDisplayMedia.bind(devices);
  }

  const proto = typeof MediaDevices !== 'undefined' ? MediaDevices.prototype : null;
  if (
    devices &&
    proto &&
    typeof MediaDevices === 'function' &&
    devices instanceof MediaDevices &&
    typeof proto.getDisplayMedia === 'function'
  ) {
    return proto.getDisplayMedia.bind(devices);
  }

  if (typeof nav.getDisplayMedia === 'function') {
    return nav.getDisplayMedia.bind(nav);
  }
  if (typeof nav.webkitGetDisplayMedia === 'function') {
    return nav.webkitGetDisplayMedia.bind(nav);
  }
  return null;
}

export function supportsDisplayCapture(nav = navigator) {
  return typeof resolveGetDisplayMedia(nav) === 'function';
}

export function buildDisplayConstraintAttempts({ frameRate = 30, systemAudio = false, android = false } = {}) {
  const fr = Number(frameRate) || 30;

  if (android) {
    // Extra options (monitorTypeSurfaces, preferCurrentTab, audio) can throw
    // TypeError on Chrome Android even when getDisplayMedia exists. Start
    // with the spec minimum so the system picker can appear.
    return [
      { video: true },
      { video: true, audio: false }
    ];
  }

  return [
    {
      video: { frameRate: { ideal: fr } },
      audio: !!systemAudio,
      preferCurrentTab: false,
      selfBrowserSurface: 'include',
      monitorTypeSurfaces: 'include',
      systemAudio: systemAudio ? 'include' : 'exclude'
    },
    {
      video: { frameRate: { ideal: fr } },
      audio: !!systemAudio
    },
    { video: true, audio: false }
  ];
}

export async function captureDisplayMedia({ frameRate, systemAudio, android = false } = {}, nav = navigator) {
  const getDisplayMedia = resolveGetDisplayMedia(nav);
  if (!getDisplayMedia) {
    const err = new Error('getDisplayMedia is not available');
    err.name = 'NotSupportedError';
    err.code = 'DISPLAY_MEDIA_MISSING';
    throw err;
  }

  const attempts = buildDisplayConstraintAttempts({ frameRate, systemAudio, android });
  let lastErr;

  for (const constraints of attempts) {
    try {
      return await getDisplayMedia(constraints);
    } catch (err) {
      lastErr = err;
      if (err?.name === 'NotAllowedError' || err?.name === 'AbortError') {
        throw err;
      }
    }
  }

  throw lastErr;
}
