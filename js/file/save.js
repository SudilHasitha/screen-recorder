// Streaming to disk during recording (Chromium picker) or Origin Private File System.

export async function maybeOpenWriter(enabled, suggestedName) {
  if (!enabled) return { writer: null, handle: null, error: null, source: null };

  if ('showSaveFilePicker' in window) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName,
        types: [{ description: 'WebM Video', accept: { 'video/webm': ['.webm'] } }]
      });
      const writer = await handle.createWritable();
      return { writer, handle, error: null, source: 'picker' };
    } catch (error) {
      if (error.name === 'AbortError') {
        return {
          writer: null,
          handle: null,
          error: 'File save cancelled by user',
          source: null
        };
      }
      // Fall through to OPFS if the picker exists but failed for another reason.
    }
  }

  if (typeof navigator.storage?.getDirectory === 'function') {
    try {
      const root = await navigator.storage.getDirectory();
      const handle = await root.getFileHandle(suggestedName, { create: true });
      const writer = await handle.createWritable();
      return { writer, handle, error: null, source: 'opfs' };
    } catch (error) {
      return {
        writer: null,
        handle: null,
        error: `Failed to open browser storage for writing: ${error.message}`,
        source: null
      };
    }
  }

  return {
    writer: null,
    handle: null,
    error: 'File System Access API not supported. Enable it (see the guide below) or record to memory.',
    source: null
  };
}

export async function closeWriter(writer) {
  if (!writer) return;
  try {
    await writer.close();
  } catch (error) {
    throw new Error(`Failed to close file: ${error.message}`);
  }
}

export async function fileFromHandle(handle) {
  if (!handle || typeof handle.getFile !== 'function') return null;
  return handle.getFile();
}
