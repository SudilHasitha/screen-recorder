import { UI } from './ui/dom.js';
import { populateMics } from './util/devices.js';
import { formatFeatureReport, getFSStatus } from './util/support.js';
import { createAudioMixer } from './audio/mixer.js';
import { maybeOpenWriter, closeWriter } from './file/save.js';
import { createRecorder, combineTracks } from './recording/recorder.js';

let displayStream, micStream, mixedAudio, combinedStream;
let recorder, mimeType, chunks = [];
let writer = null;

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
  UI.recordingState('idle');
};

async function start() {
  try {
    UI.setBusy(true);
    UI.setMsg('Preparing…');
    UI.hideDownload(); // Hide any existing download

    const fr = parseInt(UI.fpsSel.value, 10) || 60;

    // 1) Screen/window/tab (user picks; tick "Share audio" to include system audio)
    displayStream = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: fr },
      audio: UI.sysAudio.checked
    });

    // 2) Mic
    micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: UI.micSel.value ? { exact: UI.micSel.value } : undefined,
        echoCancellation: true, noiseSuppression: true, autoGainControl: true
      }
    });

    // 3) Mix audio and combine with video
    mixedAudio = createAudioMixer(displayStream, micStream);
    combinedStream = combineTracks(displayStream, mixedAudio.stream);
    UI.preview.srcObject = combinedStream;

    // 4) Recorder + optional live file writer
    if (UI.liveSave.checked) {
      UI.setMsg('Opening file picker for live save...');
      const { writer: fw, error } = await maybeOpenWriter(UI.liveSave.checked, `capture-${Date.now()}.webm`);
      
      if (error) {
        // If live save fails, disable the checkbox and show error
        UI.liveSave.checked = false;
        UI.setMsg(`Live save failed: ${error}. Recording to memory instead.`);
        writer = null;
      } else {
        writer = fw;
        UI.setMsg('Live save enabled. File picker opened successfully.');
      }
    } else {
      writer = null;
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
        } catch (error) {
          // If writing fails, disable live save and fall back to memory
          UI.liveSave.checked = false;
          UI.setMsg('Live save failed during recording. Saving to memory instead.');
          writer = null;
        }
      } else {
        chunks.push(e.data);
      }
    };

    recorder.onstop = async () => {
      try {
        if (writer) {
          await closeWriter(writer);
          UI.setMsg('Recording saved directly to file.');
          // Reset state after successful file save
          resetState();
          UI.setBusy(false);
        } else {
          // Create blob and download link for memory recording
          if (chunks.length === 0) {
            UI.setMsg('No recording data available.');
            resetState();
            UI.setBusy(false);
            return;
          }
          
          const blob = new Blob(chunks, { type: mimeType });
          
          if (blob.size === 0) {
            UI.setMsg('Recording is empty. Please try again.');
            resetState();
            UI.setBusy(false);
            return;
          }

          const url = URL.createObjectURL(blob);
          const filename = `capture-${Date.now()}.webm`;
          const fileSize = `${Math.round(blob.size / 1024 / 1024 * 100) / 100} MB`;
          
          // Show download button BEFORE setting busy to false
          UI.showDownload(url, filename, fileSize);
          UI.setMsg(`Recording complete! Click the download button below.`);
          
          // Don't reset state here - keep the download link available
          // Reset only the recording-related state, not the UI
          [displayStream, micStream, combinedStream].forEach(s => {
            if (s) s.getTracks().forEach(t => t.stop());
          });
          if (mixedAudio?.ctx) mixedAudio.stop();
          
          displayStream = micStream = combinedStream = null;
          mixedAudio = null;
          recorder = null;
          UI.recordingState('idle');
          
          // Set busy to false AFTER showing download (this won't hide it now)
          UI.setBusy(false);
        }
      } catch (e) {
        UI.setMsg('Save failed: ' + (e?.message || e));
        resetState();
        UI.setBusy(false);
      }
    };

    recorder.start(250);
    UI.recordingState('recording');
    UI.setMsg(writer ? 'Recording and saving directly to file…' : 'Recording to memory…');

    // If user ends share via browser UI, stop our recorder too
    displayStream.getVideoTracks()[0].addEventListener('ended', () => {
      if (recorder && recorder.state !== 'inactive') recorder.stop();
    });

  } catch (err) {
    // Provide specific error messages
    let errorMsg = 'Failed to start: ';
    if (err.name === 'NotAllowedError') {
      errorMsg += 'Permission denied. Please allow camera/microphone access and try again.';
    } else if (err.name === 'NotFoundError') {
      errorMsg += 'No camera/microphone found. Please check your devices.';
    } else if (err.name === 'NotSupportedError') {
      errorMsg += 'This feature is not supported in your browser.';
    } else if (err.name === 'SecurityError') {
      errorMsg += 'Security error. Try accessing via https://localhost:8000';
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

// Add a function to clear download when starting a new recording
function clearDownload() {
  const downloadLink = UI.downloadA;
  if (downloadLink.href && downloadLink.href.startsWith('blob:')) {
    URL.revokeObjectURL(downloadLink.href);
  }
  UI.hideDownload();
}

(async function init() {
  UI.featureReport.textContent = formatFeatureReport();
  
  try {
    await populateMics(UI.micSel);
  } catch (error) {
    UI.micSel.innerHTML = '<option value="">Error loading microphones</option>';
  }

  // Check File System Access API support and update UI with detailed status
  const fsStatus = getFSStatus();
  UI.updateLiveSaveStatus(fsStatus);

  UI.startBtn.addEventListener('click', () => {
    clearDownload(); // Clear any existing download before starting new recording
    start();
  });
  UI.pauseBtn.addEventListener('click', pause);
  UI.resumeBtn.addEventListener('click', resume);
  UI.stopBtn.addEventListener('click', stop);

  UI.setBusy(false);
})();
