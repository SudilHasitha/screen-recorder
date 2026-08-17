import { UI } from './ui/dom.js';
import { populateMics } from './util/devices.js';
import { formatFeatureReport, getFSStatus, getDisplayCaptureStatus } from './util/support.js';
import { isAndroid } from './util/platform.js';
import { captureDisplayMedia, supportsDisplayCapture } from './capture/display.js';
import { createAudioMixer } from './audio/mixer.js';
import { maybeOpenWriter, closeWriter, fileFromHandle } from './file/save.js';
import { createRecorder, combineTracks } from './recording/recorder.js';

let displayStream, micStream, mixedAudio, combinedStream;
let recorder, mimeType, chunks = [];
let writer = null;
let writerHandle = null;
let writerSource = null;

const resetState = () => {
  chunks = [];
  if (UI.preview.srcObject) UI.preview.srcObject = null;

  [displayStream, micStream, combinedStream].forEach(s => {
    if (s) s.getTracks().forEach(t => t.stop());
  });
  if (mixedAudio?.ctx) mixedAudio.stop();

  displayStream = micStream = combinedStream = null;
  mixedAudio = null;
  recorder = null;
  writer = null;
  writerHandle = null;
  writerSource = null;
  UI.recordingState('idle');
};

function displayCaptureMissingMessage(status) {
  if (!status.isSecureContext) {
    return 'Screen recording needs a secure page (HTTPS). Open this app over HTTPS and try again.';
  }
  if (status.inAppBrowser) {
    return 'This in-app browser cannot capture the screen. Open this page in Chrome (menu → Open in Chrome / browser).';
  }
  if (status.ios) {
    return 'iOS browsers do not support getDisplayMedia screen recording.';
  }
  if (status.android) {
    return 'getDisplayMedia is not available. In Chrome, enable screen capture (see the Android guide below), relaunch Chrome, then retry.';
  }
  return 'navigator.mediaDevices.getDisplayMedia is not available in this browser.';
}

async function acquireMicrophone() {
  const devices = navigator.mediaDevices || navigator.mediaDevice;
  if (!devices?.getUserMedia) {
    return null;
  }

  try {
    return await devices.getUserMedia({
      audio: {
        deviceId: UI.micSel.value ? { exact: UI.micSel.value } : undefined,
        echoCancellation: true, noiseSuppression: true, autoGainControl: true
      }
    });
  } catch (err) {
    // Screen-only recording is still useful, especially on Android.
    UI.setMsg('Microphone unavailable. Continuing with screen audio only (if any).');
    return null;
  }
}

async function start() {
  try {
    UI.setBusy(true);
    UI.setMsg('Preparing…');
    UI.hideDownload();

    const captureStatus = getDisplayCaptureStatus();
    if (!supportsDisplayCapture() || !captureStatus.isSecureContext) {
      UI.setMsg(displayCaptureMissingMessage(captureStatus));
      UI.highlightGuide('android-guide');
      UI.setBusy(false);
      return;
    }

    const android = isAndroid();
    const fr = parseInt(UI.fpsSel.value, 10) || (android ? 30 : 60);

    // 1) Screen / window / tab / (Android) other apps via MediaProjection
    displayStream = await captureDisplayMedia({
      frameRate: fr,
      systemAudio: !android && UI.sysAudio.checked,
      android
    });

    // 2) Mic (optional — do not abort screen capture if it fails)
    micStream = await acquireMicrophone();

    // 3) Mix audio and combine with video
    mixedAudio = createAudioMixer(displayStream, micStream);
    combinedStream = combineTracks(displayStream, mixedAudio.stream);
    UI.preview.srcObject = combinedStream;

    // 4) Recorder + optional live file writer
    writer = null;
    writerHandle = null;
    writerSource = null;

    if (UI.liveSave.checked) {
      UI.setMsg('Opening file for live save...');
      const opened = await maybeOpenWriter(true, `capture-${Date.now()}.webm`);

      if (opened.error) {
        UI.liveSave.checked = false;
        UI.setMsg(`Live save failed: ${opened.error}. Recording to memory instead.`);
      } else {
        writer = opened.writer;
        writerHandle = opened.handle;
        writerSource = opened.source;
        UI.setMsg(opened.source === 'opfs'
          ? 'Live save enabled in browser storage. You can download or share when finished.'
          : 'Live save enabled. File picker opened successfully.');
      }
    }

    const { rec, mimeType: mt } = createRecorder(combinedStream, {
      vKbps: UI.vBitrate.value, aKbps: UI.aBitrate.value
    });
    recorder = rec;
    mimeType = mt;

    recorder.ondataavailable = async (e) => {
      if (!e.data || !e.data.size) return;
      if (writer) {
        try {
          await writer.write(e.data);
        } catch {
          UI.liveSave.checked = false;
          UI.setMsg('Live save failed during recording. Saving to memory instead.');
          writer = null;
          writerHandle = null;
          writerSource = null;
          chunks.push(e.data);
        }
      } else {
        chunks.push(e.data);
      }
    };

    recorder.onstop = async () => {
      try {
        if (writer && writerSource === 'picker') {
          await closeWriter(writer);
          UI.setMsg('Recording saved directly to file.');
          resetState();
          UI.setBusy(false);
          return;
        }

        let blob = null;
        if (writer && writerSource === 'opfs') {
          await closeWriter(writer);
          const file = await fileFromHandle(writerHandle);
          blob = file || null;
        }

        if (!blob) {
          if (chunks.length === 0) {
            UI.setMsg('No recording data available.');
            resetState();
            UI.setBusy(false);
            return;
          }
          blob = new Blob(chunks, { type: mimeType });
        }

        if (!blob.size) {
          UI.setMsg('Recording is empty. Please try again.');
          resetState();
          UI.setBusy(false);
          return;
        }

        const url = URL.createObjectURL(blob);
        const filename = blob.name || `capture-${Date.now()}.webm`;
        const fileSize = `${Math.round(blob.size / 1024 / 1024 * 100) / 100} MB`;

        UI.showDownload(url, filename, fileSize, blob);
        UI.setMsg(writerSource === 'opfs'
          ? 'Recording complete. Download or share it from the button below.'
          : 'Recording complete! Click the download button below.');

        [displayStream, micStream, combinedStream].forEach(s => {
          if (s) s.getTracks().forEach(t => t.stop());
        });
        if (mixedAudio?.ctx) mixedAudio.stop();

        displayStream = micStream = combinedStream = null;
        mixedAudio = null;
        recorder = null;
        writer = null;
        writerHandle = null;
        writerSource = null;
        UI.recordingState('idle');
        UI.setBusy(false);
      } catch (e) {
        UI.setMsg('Save failed: ' + (e?.message || e));
        resetState();
        UI.setBusy(false);
      }
    };

    recorder.start(250);
    UI.recordingState('recording');
    UI.setMsg(writer
      ? (writerSource === 'opfs' ? 'Recording to browser storage…' : 'Recording and saving directly to file…')
      : 'Recording to memory…');

    displayStream.getVideoTracks()[0].addEventListener('ended', () => {
      if (recorder && recorder.state !== 'inactive') recorder.stop();
    });

  } catch (err) {
    let errorMsg = 'Failed to start: ';
    if (err.code === 'DISPLAY_MEDIA_MISSING' || (err.name === 'TypeError' && /getDisplayMedia/i.test(err.message))) {
      errorMsg = displayCaptureMissingMessage(getDisplayCaptureStatus());
      UI.highlightGuide('android-guide');
    } else if (err.name === 'NotAllowedError') {
      errorMsg += 'Permission denied. Allow screen (and microphone) access and try again.';
    } else if (err.name === 'NotFoundError') {
      errorMsg += 'No capture source found. On Android, pick a screen or app in the system prompt.';
    } else if (err.name === 'NotSupportedError') {
      errorMsg += 'This feature is not supported in your browser. ' + displayCaptureMissingMessage(getDisplayCaptureStatus());
      UI.highlightGuide('android-guide');
    } else if (err.name === 'SecurityError') {
      errorMsg += 'Security error. Use HTTPS (for local testing: https://127.0.0.1:8000).';
    } else if (err.name === 'InvalidStateError') {
      errorMsg += 'Screen capture must be started from a tap on Start. Try again, and on Android pick a screen or app.';
    } else {
      errorMsg += err?.message || err;
    }

    UI.setMsg(errorMsg);
    resetState();
    UI.setBusy(false);
  }
}

function pause() {
  if (recorder?.state === 'recording') {
    recorder.pause();
    UI.recordingState('paused');
    UI.setMsg('Paused.');
  }
}

function resume() {
  if (recorder?.state === 'paused') {
    recorder.resume();
    UI.recordingState('recording');
    UI.setMsg('Recording…');
  }
}

function stop() {
  if (recorder && recorder.state !== 'inactive') {
    recorder.stop();
    UI.recordingState('idle');
  }
}

function clearDownload() {
  const downloadLink = UI.downloadA;
  if (downloadLink.href && downloadLink.href.startsWith('blob:')) {
    URL.revokeObjectURL(downloadLink.href);
  }
  UI.hideDownload();
}

function applyPlatformDefaults() {
  const android = isAndroid();
  if (android) {
    UI.sysAudio.checked = false;
    UI.sysAudio.disabled = true;
    UI.sysAudio.parentElement.title = 'System audio capture is not available in Chrome on Android.';
    UI.fpsSel.value = '30';
  }

  const captureStatus = getDisplayCaptureStatus();
  UI.updateCaptureStatus(captureStatus);
}

(async function init() {
  UI.featureReport.textContent = formatFeatureReport();
  applyPlatformDefaults();

  try {
    await populateMics(UI.micSel);
  } catch {
    UI.micSel.innerHTML = '<option value="">Error loading microphones</option>';
  }

  UI.updateLiveSaveStatus(getFSStatus());

  document.querySelectorAll('a[href="#fs-guide"], a[href="#android-guide"]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      UI.highlightGuide(a.getAttribute('href').slice(1));
    });
  });

  UI.startBtn.addEventListener('click', () => {
    clearDownload();
    start();
  });
  UI.pauseBtn.addEventListener('click', pause);
  UI.resumeBtn.addEventListener('click', resume);
  UI.stopBtn.addEventListener('click', stop);

  UI.shareBtn?.addEventListener('click', async () => {
    const blob = UI.downloadBlob;
    if (!blob || typeof navigator.share !== 'function') return;
    const file = blob instanceof File
      ? blob
      : new File([blob], UI.downloadA.download || 'capture.webm', { type: blob.type || 'video/webm' });
    try {
      if (navigator.canShare && !navigator.canShare({ files: [file] })) {
        UI.setMsg('Sharing files is not supported in this browser. Use Download instead.');
        return;
      }
      await navigator.share({ files: [file], title: file.name });
    } catch (err) {
      if (err?.name !== 'AbortError') {
        UI.setMsg('Share failed: ' + (err?.message || err));
      }
    }
  });

  UI.setBusy(false);
})();
