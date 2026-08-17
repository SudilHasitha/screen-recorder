# ScreenCaptureMe

A privacy-first screen and microphone recorder that runs entirely in your browser. No uploads, no servers, no accounts - everything stays local.

## Features

- 🖥️ **Screen Recording**: Capture your entire screen, specific windows, or browser tabs
- 🎤 **Microphone Recording**: Record audio from your microphone
- 🔊 **System Audio**: Capture system audio when available
- 💾 **Local Storage**: All recordings stay on your device
- 📱 **Cross-Platform**: Works on Linux, Windows, macOS, and Android Chrome (with screen-capture enabled)
- 🔒 **Privacy-First**: No data leaves your machine

## Live Demo

### GitHub Pages (Public Repos)
Visit the live demo: [https://sudilhasitha.github.io/screen-recorder](https://sudilhasitha.github.io/screen-recorder)

### Netlify (Public & Private Repos)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/SudilHasitha/screen-recorder)

## Deployment Options

### 🚀 Quick Deploy

**For Private Repositories:**
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/SudilHasitha/screen-recorder)

**For Public Repositories:**
- GitHub Pages: Enable in repository settings
- Netlify: Use the deploy button above

### 📋 Manual Deployment

1. **GitHub Pages**: Go to Settings → Pages → GitHub Actions
2. **Netlify**: Connect your GitHub repository
3. **Vercel**: Import your GitHub repository

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## Local Development

### Prerequisites

- Python 3.x
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Running Locally

1. Clone the repository:
```bash
git clone https://github.com/SudilHasitha/screen-recorder.git
cd screen-recorder
```

2. Start the local server:
```bash
# HTTP (basic functionality)
python3 -m http.server 8000

# HTTPS (full functionality - recommended)
python3 serve_https.py
```

3. Open your browser and navigate to:
   - HTTP: `http://localhost:8000`
   - HTTPS: `https://127.0.0.1:8000`

## Browser Compatibility

| Browser | Screen Recording | Microphone | File System API |
|---------|-----------------|------------|-----------------|
| Chrome | ✅ | ✅ | ✅ |
| Edge | ✅ | ✅ | ✅ |
| Firefox | ✅ | ✅ | ❌ (download / Share instead) |
| Safari | ✅ | ✅ | ❌ (download instead) |
| Chrome Android | ⚠️ Enable flags if `getDisplayMedia` is missing | ✅ | ✅ (Chrome 132+; otherwise browser storage / download) |
| Safari iOS | ❌ | ✅ | ❌ |

### Android Chrome: screen recording other apps

Chrome on Android does not always expose `navigator.mediaDevices.getDisplayMedia`. If Start fails with **function not found**:

1. Open this app in **Google Chrome** over **HTTPS** (not an in-app browser).
2. Update Chrome, then visit:
   - `chrome://flags/#user-media-screen-capturing` → **Enabled**
   - `chrome://flags/#android-media-picker` → **Enabled** (if listed)
3. Relaunch Chrome, tap **Start**, and pick a **screen or another app** in the Android prompt.

System audio is not captured on Android; the microphone still works.

### Enable File System Access (save while recording)

The live-save checkbox uses `showSaveFilePicker` when the browser allows it.

1. Load the app over **HTTPS** (required).
2. **Chrome / Edge (desktop):** on by default. If missing, enable `chrome://flags/#file-system-access-api` (or `edge://flags/#file-system-access-api`) and relaunch.
3. **Brave:** enable `brave://flags/#file-system-access-api` and relaunch.
4. **Chrome Android 132+:** File System Access is supported. Update Chrome, or enable the same flag if the Save dialog is missing.

If the Save dialog is unavailable, recordings still download (and can be **shared** on Android). Live save can use private browser storage as a fallback.

## Security Features

- �� **No Data Collection**: Zero tracking or analytics
- 🛡️ **Local Processing**: All recording happens in your browser
- 🔐 **HTTPS Required**: Secure context for sensitive APIs
- 📋 **Open Source**: Fully auditable code
- 🚫 **No External Requests**: No third-party dependencies

## Privacy Policy

This application:
- ✅ Processes all data locally in your browser
- ✅ Does not collect, store, or transmit any personal information
- ✅ Does not use cookies or tracking
- ✅ Does not require user accounts or registration
- ✅ Does not connect to external servers

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📖 **Documentation**: Check [DEPLOYMENT.md](DEPLOYMENT.md) for deployment help
- 🐛 **Issues**: Report bugs on [GitHub Issues](https://github.com/SudilHasitha/screen-recorder/issues)
- 💡 **Feature Requests**: Suggest new features via GitHub Issues

## Acknowledgments

- Built with modern web APIs (MediaRecorder, getDisplayMedia, File System Access)
- Inspired by privacy-first design principles
- Thanks to the open-source community for the tools and libraries
