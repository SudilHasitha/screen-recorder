// Streaming to disk during recording (Chromium) or collecting chunks for a final download
export async function maybeOpenWriter(enabled, suggestedName) {
  if (!enabled) return { writer: null, handle: null, error: null };
  
  // Check if File System Access API is supported
  if (!('showSaveFilePicker' in window)) {
    return { 
      writer: null, 
      handle: null, 
      error: 'File System Access API not supported. Please use a Chromium-based browser (Chrome, Edge, etc.)' 
    };
  }

  try {
    const handle = await window.showSaveFilePicker({
      suggestedName,
      types: [{ description: 'WebM Video', accept: { 'video/webm': ['.webm'] } }]
    });
    const writer = await handle.createWritable();
    return { writer, handle, error: null };
  } catch (error) {
    if (error.name === 'AbortError') {
      return { 
        writer: null, 
        handle: null, 
        error: 'File save cancelled by user' 
      };
    }
    return { 
      writer: null, 
      handle: null, 
      error: `Failed to open file for writing: ${error.message}` 
    };
  }
}

export async function closeWriter(writer) {
  if (!writer) return;
  try {
    await writer.close();
  } catch (error) {
    console.error('Error closing file writer:', error);
    throw new Error(`Failed to close file: ${error.message}`);
  }
}
