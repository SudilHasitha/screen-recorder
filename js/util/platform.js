// Runtime environment helpers used for capture/save fallbacks and in-app guides.

export function getUserAgent() {
  return navigator.userAgent || '';
}

export function isAndroid() {
  return /Android/i.test(getUserAgent());
}

export function isIOS() {
  const ua = getUserAgent();
  return /iPhone|iPad|iPod/i.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export function isChromium() {
  const brands = navigator.userAgentData?.brands;
  if (Array.isArray(brands) && brands.some(b => /Chromium|Google Chrome|Microsoft Edge/i.test(b.brand))) {
    return true;
  }
  const ua = getUserAgent();
  return /Chrome|Chromium|Edg|OPR/i.test(ua) && !/Firefox|FxiOS/i.test(ua);
}

export function isBrave() {
  return typeof navigator.brave?.isBrave === 'function';
}

export function isInAppBrowser() {
  const ua = getUserAgent();
  return /FBAN|FBAV|Instagram|Line\/|Twitter|WhatsApp|Snapchat|; wv\)/i.test(ua);
}

export function isSecureRecordingContext() {
  return window.isSecureContext === true;
}
