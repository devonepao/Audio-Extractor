# 🎵 Audio Extractor

A beautiful, Apple-designed Progressive Web App (PWA) for extracting audio and downloading videos from YouTube with multiple format and quality options.

![Apple Design System](https://img.shields.io/badge/Design-Apple%20HIG-007AFF?style=flat-square)
![PWA Ready](https://img.shields.io/badge/PWA-Ready-5856D6?style=flat-square)
![Responsive](https://img.shields.io/badge/Responsive-Desktop%20%26%20Mobile-34C759?style=flat-square)

## ✨ Features

### 🎨 Apple Design System
- **San Francisco Font Family** - Uses Apple's system font stack
- **Glassmorphism Effects** - Frosted glass design with backdrop blur
- **Minimalist Interface** - Clean, uncluttered, purpose-driven design
- **Generous White Space** - Breathing room and visual hierarchy
- **Light Theme** - Optimized for clarity and readability
- **Haptic Feedback** - Visual feedback on touch interactions
- **Safe Areas** - Respects iOS notch and home indicator regions

### 📱 Progressive Web App
- **Installable** - Add to home screen on any device
- **Offline Support** - Service Worker caching
- **App-like Experience** - Standalone display mode
- **Fast Loading** - Optimized performance

### 🎬 Media Extraction
- **Audio Download** - Extract audio in MP3 format
  - 320 kbps (High Quality)
  - 256 kbps
  - 192 kbps (Standard)
  - 128 kbps (Medium)
  - 64 kbps (Low)

- **Video Download** - Download videos in various resolutions
  - 1080p Full HD
  - 720p HD
  - 480p
  - 360p
  - 240p

### 📊 User Experience
- **Video Preview** - Thumbnail, title, author, duration
- **Progress Tracking** - Real-time download progress
- **Error Handling** - Friendly error messages
- **Responsive Design** - Works on desktop and mobile (landscape optimized)

## 🚀 Getting Started

### Hosting on GitHub Pages

1. **Fork or Clone** this repository
2. **Enable GitHub Pages**:
   - Go to repository Settings
   - Navigate to Pages section
   - Select source: Deploy from branch
   - Choose branch: `main` (or your default branch)
   - Select folder: `/ (root)`
   - Click Save

3. **Access your app**:
   - Your app will be available at: `https://[username].github.io/Audio-Extractor/`

### Local Development

Simply open `index.html` in a modern web browser, or use a local server:

```bash
# Python 3
python -m http.server 8000

# Node.js (with http-server)
npx http-server

# PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## 📱 Installing as PWA

### iOS (Safari)
1. Open the app in Safari
2. Tap the Share button
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"

### Android (Chrome)
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Tap "Add to Home screen"
4. Tap "Add"

### Desktop (Chrome/Edge)
1. Open the app in Chrome or Edge
2. Look for the install icon in the address bar
3. Click "Install"

## 🛠️ Technology Stack

- **HTML5** - Semantic markup with meta tags for PWA
- **CSS3** - Modern CSS with custom properties, animations, backdrop-filter
- **Vanilla JavaScript** - No frameworks, pure ES6+
- **Service Worker API** - Offline support and caching
- **Web App Manifest** - PWA configuration

## 🎯 Browser Support

- ✅ Safari (iOS 12+, macOS)
- ✅ Chrome (Desktop & Mobile)
- ✅ Edge (Desktop & Mobile)
- ✅ Firefox (Desktop & Mobile)
- ✅ Samsung Internet

## 📝 Demo Mode

The current implementation uses **mock data** for demonstration purposes. For production use:

1. Integrate with a YouTube data API service
2. Replace mock functions in `app.js`:
   - `mockFetchVideoInfo()`
   - `mockGetDownloadOptions()`
   - `mockDownload()`

3. Consider using services like:
   - YouTube Data API v3
   - Third-party YouTube download APIs
   - Backend proxy server for API calls

## 🔒 Legal Notice

This application is for educational and demonstration purposes. Users must:
- Respect YouTube's Terms of Service
- Respect copyright and intellectual property rights
- Only download content they have permission to download
- Comply with local laws regarding media downloads

## 🎨 Design Philosophy

This app follows [Apple's Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/):

- **Clarity** - Clear visual hierarchy and readable content
- **Deference** - Subtle interface that highlights content
- **Depth** - Realistic motion and layering

## 📄 License

MIT License - feel free to use this project for learning and development.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

Made with ❤️ following Apple Design System principles
