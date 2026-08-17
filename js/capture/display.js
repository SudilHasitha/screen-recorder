import { isAndroid } from '../util/platform.js';

/**
 * Resolve getDisplayMedia from the current (or injected) navigator.
 * Android Chrome historically omitted the method; some engines expose it
 * on navigator instead of mediaDevices.
 */
export function resolveGetDisplayMedia(nav = navigator) {
  const devices = nav.mediaDevices || nav.mediaDevice || null;
  if (devices && typeof devices.getDisplayMedia === 'function') {
    return devices.getDisplayMedia.bind(devices);
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
    // Android MediaProjection is picky: exact frameRate / system audio often
    // reject the whole getDisplayMedia() call. Keep constraints loose and
    // include other apps/screens when the picker supports it.
    return [
      {
        video: true,
        audio: false,
        preferCurrentTab: false,
        selfBrowserSurface: 'include',
        monitorTypeSurfaces: 'include'
      },
      { video: true, audio: false },
      { video: true }
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

export async function captureDisplayMedia({ frameRate, systemAudio, android = isAndroid() } = {}, nav = navigator) {
  const getDisplayMedia = resolveGetDisplayMedia(nav);
  if (!getDisplayMedia) {
    const err = new Error('navigator.mediaDevices.getDisplayMedia is not available in this browser');
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
      // User cancelled or denied — don't retry with other constraints.
      if (err?.name === 'NotAllowedError' || err?.name === 'AbortError') {
        throw err;
      }
    }
  }

  throw lastErr;
}
