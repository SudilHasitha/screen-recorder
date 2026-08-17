// Microphone enumeration utilities
export async function populateMics(selectEl) {
  try {
    const devices = navigator.mediaDevices || navigator.mediaDevice;
    if (!devices?.enumerateDevices) {
      selectEl.innerHTML = '<option value="">Microphone list unavailable</option>';
      return;
    }

    let devs = await devices.enumerateDevices();
    let mics = devs.filter(d => d.kind === 'audioinput');

    if (mics.length > 0 && mics.every(mic => !mic.label) && devices.getUserMedia) {
      try {
        const stream = await devices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });

        stream.getTracks().forEach(track => track.stop());

        devs = await devices.enumerateDevices();
        mics = devs.filter(d => d.kind === 'audioinput');
      } catch {
        // Continue with devices without labels
      }
    }

    selectEl.innerHTML = '';

    if (mics.length === 0) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'No microphones found';
      selectEl.appendChild(opt);
      return;
    }

    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = 'Default microphone';
    selectEl.appendChild(defaultOpt);

    for (const mic of mics) {
      const opt = document.createElement('option');
      opt.value = mic.deviceId;
      opt.textContent = mic.label || `Microphone ${selectEl.children.length}`;
      selectEl.appendChild(opt);
    }

  } catch {
    selectEl.innerHTML = '<option value="">Error loading microphones</option>';
  }
}
