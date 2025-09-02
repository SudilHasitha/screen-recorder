# ScreenCaptureMe

A privacy-first screen and microphone recorder that runs entirely in your browser. No uploads, no servers, no accounts - everything stays local.

## Features

- 🖥️ **Screen Recording**: Capture your entire screen, specific windows, or browser tabs
- 🎤 **Microphone Recording**: Record audio from your microphone
- 🔊 **System Audio**: Capture system audio when available
- 💾 **Local Storage**: All recordings stay on your device
- 📱 **Cross-Platform**: Works on Linux, Windows, macOS
- 🔒 **Privacy-First**: No data leaves your machine

## Live Demo

Visit the live demo: [https://sudilhasitha.github.io/screen-recorder](https://sudilhasitha.github.io/screen-recorder)

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

2. Start the development server:
```bash
# HTTP (basic functionality)
python3 -m http.server 8000

# HTTPS (full functionality including live save)
python3 serve_https.py
```

3. Open your browser and navigate to:
   - HTTP: `http://localhost:8000`
   - HTTPS: `https://127.0.0.1:8000` (accept the security warning)

## Deployment to GitHub Pages

### Automatic Deployment

1. **Create a GitHub repository** and push your code:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/SudilHasitha/screen-recorder.git
git push -u origin main
```

2. **Enable GitHub Pages**:
   - Go to your repository → Settings → Pages
   - Select "GitHub Actions" as the source
   - The workflow will automatically deploy on every push to main

3. **Your app will be available at**:
   `https://sudilhasitha.github.io/screen-recorder`

### Manual Deployment

For future updates, simply push to the main branch:
```bash
git add .
git commit -m "Update screen recorder"
git push origin main
```

## Browser Compatibility

- ✅ Chrome/Chromium (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

## Security Notes

- ✅ **No Server-Side Code**: All processing happens in the browser
- ✅ **No Data Collection**: No analytics, tracking, or data transmission
- ✅ **HTTPS Required**: GitHub Pages provides automatic SSL certificates
- ✅ **Local Storage Only**: Recordings never leave your device
- ✅ **Open Source**: All code is visible and auditable

## Privacy Policy

This application:
- Does not collect any personal information
- Does not transmit data to external servers
- Stores recordings only locally on your device
- Does not use cookies or tracking
- Is completely open source and auditable

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Troubleshooting

### Microphone not detected
- Ensure you're using HTTPS
- Check browser permissions
- Try refreshing the page

### Screen capture not working
- Use HTTPS (required by browsers)
- Ensure you have the latest browser version
- Check if your browser supports `getDisplayMedia`

### File System Access not working
- Only works in Chromium-based browsers (Chrome, Edge, Brave)
- Requires HTTPS
- Enable the File System Access API flag if needed
