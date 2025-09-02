// Feature detection & helpers (unit-tested)
export function chooseMime() {
  const candidates = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm'
  ];
  for (const m of candidates) {
    if (window.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m)) {
      return m;
    }
  }
  return 'video/webm';
}

export function supportsFS() {
  return 'showSaveFilePicker' in window;
}

export function getFSStatus() {
  // Check if we're on HTTPS or localhost
  const isSecure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  
  // Check if API exists
  const hasAPI = 'showSaveFilePicker' in window;
  
  // Check if we're in a secure context
  const isSecureContext = window.isSecureContext;
  
  return {
    hasAPI,
    isSecure,
    isSecureContext,
    supported: hasAPI && isSecure && isSecureContext
  };
}

export function bitrateKbpsToBps(kbps) {
  const n = Number(kbps);
  return Number.isFinite(n) && n > 0 ? n * 1000 : 0;
}

export function formatFeatureReport() {
  const fsStatus = getFSStatus();
  const fs = fsStatus.supported ? '✅ File System Access' : '❌ File System Access';
  const mr = window.MediaRecorder ? '✅ MediaRecorder' : '❌ MediaRecorder';
  const gdm = navigator.mediaDevices?.getDisplayMedia ? '✅ getDisplayMedia' : '❌ getDisplayMedia';
  
  let fsDetails = '';
  if (!fsStatus.supported) {
    if (!fsStatus.hasAPI) {
      fsDetails = ' (API not available)';
    } else if (!fsStatus.isSecure) {
      fsDetails = ' (requires HTTPS)';
    } else if (!fsStatus.isSecureContext) {
      fsDetails = ' (not secure context)';
    }
  }
  
  return [fs + fsDetails, mr, gdm].join(' · ');
}
