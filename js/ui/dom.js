// Minimal DOM helpers and UI state toggles
export const qs = (sel) => document.querySelector(sel);
export const el = (id) => document.getElementById(id);

export const UI = {
  micSel: el('mic'),
  fpsSel: el('fps'),
  sysAudio: el('sysAudio'),
  liveSave: el('liveSave'),
  vBitrate: el('vBitrate'),
  aBitrate: el('aBitrate'),
  startBtn: el('start'),
  pauseBtn: el('pause'),
  resumeBtn: el('resume'),
  stopBtn: el('stop'),
  downloadA: el('download'),
  shareBtn: el('share'),
  downloadSection: el('downloadSection'),
  downloadMsg: el('downloadMsg'),
  preview: el('preview'),
  msg: el('msg'),
  featureReport: el('featureReport'),
  captureBanner: el('captureBanner'),
  downloadBlob: null,

  setMsg(text) {
    this.msg.textContent = text || '';
  },

  setBusy(isBusy) {
    this.startBtn.disabled = isBusy;
    if (isBusy) {
      this.downloadSection.style.display = 'none';
    }
  },

  recordingState(state) {
    const { pauseBtn, resumeBtn, stopBtn } = this;
    if (state === 'recording') {
      pauseBtn.disabled = false; resumeBtn.disabled = true; stopBtn.disabled = false;
    } else if (state === 'paused') {
      pauseBtn.disabled = true; resumeBtn.disabled = false; stopBtn.disabled = false;
    } else {
      pauseBtn.disabled = true; resumeBtn.disabled = true; stopBtn.disabled = true;
    }
  },

  showDownload(url, filename, fileSize, blob) {
    this.downloadA.href = url;
    this.downloadA.download = filename;
    this.downloadA.textContent = ' Download Recording';
    this.downloadBlob = blob || null;

    const sizeText = fileSize ? ` (${fileSize})` : '';
    this.downloadMsg.textContent = `Recording ready for download${sizeText}`;
    this.downloadSection.style.display = 'block';

    const canShare = !!(blob && typeof navigator.share === 'function');
    if (this.shareBtn) {
      this.shareBtn.style.display = canShare ? 'inline-block' : 'none';
    }

    this.downloadSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
  },

  hideDownload() {
    this.downloadSection.style.display = 'none';
    this.downloadA.href = '';
    this.downloadA.download = '';
    this.downloadA.textContent = '';
    this.downloadMsg.textContent = '';
    this.downloadBlob = null;
    if (this.shareBtn) this.shareBtn.style.display = 'none';
  },

  highlightGuide(id) {
    const node = el(id);
    if (!node) return;
    node.classList.add('guide-highlight');
    if (node.tagName === 'DETAILS') node.open = true;
    node.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  updateCaptureStatus(status) {
    if (!this.captureBanner) return;

    // Already on HTTPS in production. Do not nag about it. Only warn when
    // capture cannot run at all (in-app browser / iOS).
    if (status.supported || (status.android && !status.inAppBrowser)) {
      this.captureBanner.hidden = true;
      this.startBtn.disabled = false;
      return;
    }

    this.captureBanner.hidden = false;
    this.startBtn.disabled = false;

    if (status.inAppBrowser) {
      this.captureBanner.textContent = 'In-app browsers cannot capture the screen. Open this page in Chrome.';
    } else if (status.ios) {
      this.captureBanner.textContent = 'iOS does not support web screen recording.';
    } else if (!status.hasAPI) {
      this.captureBanner.textContent = 'getDisplayMedia is not available in this browser. Use Chrome, Edge, Firefox, or Safari on desktop.';
    } else {
      this.captureBanner.hidden = true;
    }
  },

  updateLiveSaveStatus(fsStatus) {
    const liveSaveLabel = this.liveSave.parentElement;
    const checkbox = this.liveSave;
    const existingHelp = liveSaveLabel.querySelector('.fs-help');
    if (existingHelp) existingHelp.remove();

    if (fsStatus.picker) {
      liveSaveLabel.style.opacity = '1';
      checkbox.disabled = false;
      liveSaveLabel.title = 'Save recording directly to a file you choose (Chromium File System Access).';
      return;
    }

    if (fsStatus.opfs) {
      liveSaveLabel.style.opacity = '1';
      checkbox.disabled = false;
      liveSaveLabel.title = 'Save chunks to private browser storage while recording, then download or share.';
      const helpMsg = document.createElement('div');
      helpMsg.className = 'fs-help';
      helpMsg.textContent = 'Live save will use browser storage (File System Access picker is off). See the guide below to enable a real Save dialog.';
      liveSaveLabel.appendChild(helpMsg);
      return;
    }

    liveSaveLabel.style.opacity = '0.5';
    checkbox.disabled = true;

    let reason = 'File System Access is not available.';
    if (!fsStatus.hasAPI && !fsStatus.hasOPFS) {
      reason = 'File System Access API not available. See the enable guide below.';
    } else if (!fsStatus.isSecure) {
      reason = 'File System Access requires HTTPS.';
    } else if (!fsStatus.isSecureContext) {
      reason = 'Not in a secure context.';
    }
    liveSaveLabel.title = `Live save disabled: ${reason}`;

    const helpMsg = document.createElement('div');
    helpMsg.className = 'fs-help';
    const link = document.createElement('a');
    link.href = '#setup-guides';
    link.textContent = 'How to enable File System Access';
    helpMsg.appendChild(document.createTextNode(`${reason} `));
    helpMsg.appendChild(link);
    liveSaveLabel.appendChild(helpMsg);
  }
};
