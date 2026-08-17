import { isAndroid, isBrave, isIOS, isInAppBrowser, isSecureRecordingContext } from './platform.js';
import { supportsDisplayCapture } from '../capture/display.js';

// Feature detection & helpers (unit-tested)
export function chooseMime() {
  const candidates = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
    'video/mp4'
  ];
  for (const m of candidates) {
    if (window.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m)) {
      return m;
    }
  }
  return isAndroid() ? 'video/webm;codecs=vp8' : 'video/webm';
}

export function supportsFS() {
  return 'showSaveFilePicker' in window;
}

export function supportsOPFS() {
  return typeof navigator.storage?.getDirectory === 'function';
}

export function getFSStatus() {
  const isSecure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  const hasAPI = 'showSaveFilePicker' in window;
  const hasOPFS = supportsOPFS();
  const isSecureContext = isSecureRecordingContext();
  const picker = hasAPI && isSecure && isSecureContext;
  const opfs = hasOPFS && isSecureContext;

  return {
    hasAPI,
    hasOPFS,
    isSecure,
    isSecureContext,
    picker,
    opfs,
    supported: picker || opfs,
    brave: isBrave()
  };
}

export function getDisplayCaptureStatus() {
  const isSecureContext = isSecureRecordingContext();
  const hasMediaDevices = !!(navigator.mediaDevices || navigator.mediaDevice);
  const hasAPI = supportsDisplayCapture();

  return {
    hasAPI,
    hasMediaDevices,
    isSecureContext,
    android: isAndroid(),
    ios: isIOS(),
    inAppBrowser: isInAppBrowser(),
    supported: hasAPI && isSecureContext
  };
}

export function bitrateKbpsToBps(kbps) {
  const n = Number(kbps);
  return Number.isFinite(n) && n > 0 ? n * 1000 : 0;
}

export function formatFeatureReport() {
  const fsStatus = getFSStatus();
  const gdmStatus = getDisplayCaptureStatus();
  const fs = fsStatus.picker ? '✅ File System Access' : (fsStatus.opfs ? '⚠️ File System Access (browser storage)' : '❌ File System Access');
  const mr = window.MediaRecorder ? '✅ MediaRecorder' : '❌ MediaRecorder';
  const gdm = gdmStatus.hasAPI ? '✅ getDisplayMedia' : '❌ getDisplayMedia';

  let fsDetails = '';
  if (!fsStatus.picker) {
    if (!fsStatus.hasAPI) {
      fsDetails = ' (API not available — see guide below)';
    } else if (!fsStatus.isSecure) {
      fsDetails = ' (requires HTTPS)';
    } else if (!fsStatus.isSecureContext) {
      fsDetails = ' (not secure context)';
    }
  }

  let gdmDetails = '';
  if (!gdmStatus.hasAPI) {
    if (!gdmStatus.isSecureContext) {
      gdmDetails = ' (requires HTTPS)';
    } else if (gdmStatus.inAppBrowser) {
      gdmDetails = ' (open in Chrome, not an in-app browser)';
    } else if (gdmStatus.android) {
      gdmDetails = ' (enable screen capture in Chrome — see guide)';
    } else if (gdmStatus.ios) {
      gdmDetails = ' (not supported on iOS)';
    } else {
      gdmDetails = ' (not available in this browser)';
    }
  }

  return [fs + fsDetails, mr, gdm + gdmDetails].join(' · ');
}
