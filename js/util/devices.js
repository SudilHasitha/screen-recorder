// Microphone enumeration utilities
export async function populateMics(selectEl) {
  try {
    // First, try to enumerate devices without requesting permission
    let devs = await navigator.mediaDevices.enumerateDevices();
    let mics = devs.filter(d => d.kind === 'audioinput');
    
    // If no devices have labels, we need to request permission
    if (mics.length > 0 && mics.every(mic => !mic.label)) {
      try {
        // Request permission to get device labels
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: { 
            echoCancellation: true, 
            noiseSuppression: true, 
            autoGainControl: true 
          } 
        });
        
        // Stop the stream immediately
        stream.getTracks().forEach(track => track.stop());
        
        // Re-enumerate devices to get labels
        devs = await navigator.mediaDevices.enumerateDevices();
        mics = devs.filter(d => d.kind === 'audioinput');
      } catch (permissionError) {
        // Continue with devices without labels
      }
    }
    
    // Clear existing options
    selectEl.innerHTML = '';
    
    if (mics.length === 0) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'No microphones found';
      selectEl.appendChild(opt);
      return;
    }
    
    // Add default option
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = 'Default microphone';
    selectEl.appendChild(defaultOpt);
    
    // Add each microphone
    for (const mic of mics) {
      const opt = document.createElement('option');
      opt.value = mic.deviceId;
      opt.textContent = mic.label || `Microphone ${selectEl.children.length}`;
      selectEl.appendChild(opt);
    }
    
  } catch (error) {
    selectEl.innerHTML = '<option value="">Error loading microphones</option>';
  }
}
