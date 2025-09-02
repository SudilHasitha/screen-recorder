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
  downloadSection: el('downloadSection'),
  downloadMsg: el('downloadMsg'),
  preview: el('preview'),
  msg: el('msg'),
  featureReport: el('featureReport'),

  setMsg(text) {
    this.msg.textContent = text || '';
  },

  setBusy(isBusy) {
    this.startBtn.disabled = isBusy;
    // Only hide download section if we're starting a new recording (not when finishing one)
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

  showDownload(url, filename, fileSize) {
    this.downloadA.href = url;
    this.downloadA.download = filename;
    this.downloadA.textContent = ' Download Recording';
    
    // Set the download message with file size
    const sizeText = fileSize ? ` (${fileSize})` : '';
    this.downloadMsg.textContent = `Recording ready for download${sizeText}`;
    
    // Show the download section
    this.downloadSection.style.display = 'block';
    
    // Scroll to download section
    this.downloadSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
  },

  hideDownload() {
    this.downloadSection.style.display = 'none';
    this.downloadA.href = '';
    this.downloadA.download = '';
    this.downloadA.textContent = '';
    this.downloadMsg.textContent = '';
  },

  updateLiveSaveStatus(fsStatus) {
    const liveSaveLabel = this.liveSave.parentElement;
    const checkbox = this.liveSave;
    
    if (fsStatus.supported) {
      liveSaveLabel.style.opacity = '1';
      checkbox.disabled = false;
      liveSaveLabel.title = 'Save recording directly to file while recording (requires Chromium-based browser)';
    } else {
      liveSaveLabel.style.opacity = '0.5';
      checkbox.disabled = true;
      
      let reason = '';
      if (!fsStatus.hasAPI) {
        reason = 'File System Access API not available. Try Chrome or Edge.';
      } else if (!fsStatus.isSecure) {
        reason = 'File System Access requires HTTPS. Try accessing via https://localhost:8000';
      } else if (!fsStatus.isSecureContext) {
        reason = 'Not in a secure context.';
      }
      
      liveSaveLabel.title = `Live save disabled: ${reason}`;
      
      // Add a help message using safe DOM methods
      const helpMsg = document.createElement('div');
      helpMsg.className = 'fs-help';
      helpMsg.style.cssText = 'font-size: 0.85rem; color: var(--muted); margin-top: 0.5rem; padding: 0.5rem; background: var(--panel-2); border-radius: 8px; border-left: 3px solid var(--primary);';
      
      const strong = document.createElement('strong');
      strong.textContent = 'To enable live save in Brave:';
      helpMsg.appendChild(strong);
      
      const br1 = document.createElement('br');
      helpMsg.appendChild(br1);
      
      const text1 = document.createTextNode('1. Go to ');
      helpMsg.appendChild(text1);
      
      const code1 = document.createElement('code');
      code1.textContent = 'brave://flags/#file-system-access-api';
      helpMsg.appendChild(code1);
      
      const br2 = document.createElement('br');
      helpMsg.appendChild(br2);
      
      const text2 = document.createTextNode('2. Enable "File System Access API"');
      helpMsg.appendChild(text2);
      
      const br3 = document.createElement('br');
      helpMsg.appendChild(br3);
      
      const text3 = document.createTextNode('3. Restart Brave');
      helpMsg.appendChild(text3);
      
      const br4 = document.createElement('br');
      helpMsg.appendChild(br4);
      
      const text4 = document.createTextNode('4. Access this page via ');
      helpMsg.appendChild(text4);
      
      const code2 = document.createElement('code');
      code2.textContent = 'https://localhost:8000';
      helpMsg.appendChild(code2);
      
      // Remove existing help message if any
      const existingHelp = liveSaveLabel.querySelector('.fs-help');
      if (existingHelp) {
        existingHelp.remove();
      }
      
      liveSaveLabel.appendChild(helpMsg);
    }
  }
};
