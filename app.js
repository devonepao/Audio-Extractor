// Audio Extractor - Main Application
'use strict';

// Service Worker Registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => console.log('ServiceWorker registered:', registration.scope))
            .catch(error => console.log('ServiceWorker registration failed:', error));
    });
}

// DOM Elements
const elements = {
    videoUrl: document.getElementById('videoUrl'),
    clearBtn: document.getElementById('clearBtn'),
    extractBtn: document.getElementById('extractBtn'),
    loadingSection: document.getElementById('loadingSection'),
    previewSection: document.getElementById('previewSection'),
    audioSection: document.getElementById('audioSection'),
    videoSection: document.getElementById('videoSection'),
    downloadProgress: document.getElementById('downloadProgress'),
    errorSection: document.getElementById('errorSection'),
    thumbnail: document.getElementById('thumbnail'),
    videoTitle: document.getElementById('videoTitle'),
    videoAuthor: document.getElementById('videoAuthor'),
    videoDuration: document.getElementById('videoDuration'),
    audioOptions: document.getElementById('audioOptions'),
    videoOptions: document.getElementById('videoOptions'),
    progressBar: document.getElementById('progressBar'),
    progressPercent: document.getElementById('progressPercent'),
    progressStatus: document.getElementById('progressStatus'),
    errorMessage: document.getElementById('errorMessage'),
    dismissErrorBtn: document.getElementById('dismissErrorBtn')
};

// State
let currentVideoData = null;

// API Configuration
const API_BASE = 'https://youtube-mp36.p.rapidapi.com';
const YTDL_API = 'https://ytstream-download-youtube-videos.p.rapidapi.com';

// Utility Functions
function extractVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /^([a-zA-Z0-9_-]{11})$/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

function formatDuration(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
        return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${mins}:${String(secs).padStart(2, '0')}`;
}

function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return 'Unknown size';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showSection(section) {
    section.style.display = 'block';
    section.style.animation = 'fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
}

function hideSection(section) {
    section.style.display = 'none';
}

function showError(message) {
    elements.errorMessage.textContent = message;
    hideSection(elements.loadingSection);
    showSection(elements.errorSection);
}

function hideError() {
    hideSection(elements.errorSection);
}

// Mock API for demonstration (since we can't use real API keys in a public repo)
async function mockFetchVideoInfo(videoId) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return mock data
    return {
        title: 'Sample Video Title - Audio Extraction Demo',
        author: 'Demo Channel',
        duration: 245, // 4:05
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        videoId: videoId
    };
}

async function mockGetDownloadOptions(videoId) {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
        audio: [
            { quality: '320 kbps', format: 'mp3', size: '7.8 MB', bitrate: 320 },
            { quality: '256 kbps', format: 'mp3', size: '6.2 MB', bitrate: 256 },
            { quality: '192 kbps', format: 'mp3', size: '4.7 MB', bitrate: 192 },
            { quality: '128 kbps', format: 'mp3', size: '3.1 MB', bitrate: 128 },
            { quality: '64 kbps', format: 'mp3', size: '1.6 MB', bitrate: 64 }
        ],
        video: [
            { quality: '1080p', format: 'mp4', size: '125 MB', resolution: '1920x1080' },
            { quality: '720p', format: 'mp4', size: '78 MB', resolution: '1280x720' },
            { quality: '480p', format: 'mp4', size: '45 MB', resolution: '854x480' },
            { quality: '360p', format: 'mp4', size: '28 MB', resolution: '640x360' },
            { quality: '240p', format: 'mp4', size: '15 MB', resolution: '426x240' }
        ]
    };
}

async function mockDownload(type, quality) {
    // Simulate download progress
    return new Promise((resolve) => {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => resolve({ success: true }), 500);
            }
            updateProgress(progress, `Downloading ${type} (${quality})...`);
        }, 300);
    });
}

function updateProgress(percent, status) {
    elements.progressBar.style.width = `${percent}%`;
    elements.progressPercent.textContent = `${Math.round(percent)}%`;
    elements.progressStatus.textContent = status;
}

// Event Handlers
elements.clearBtn.addEventListener('click', () => {
    elements.videoUrl.value = '';
    elements.videoUrl.focus();
});

elements.dismissErrorBtn.addEventListener('click', () => {
    hideError();
});

elements.extractBtn.addEventListener('click', async () => {
    const url = elements.videoUrl.value.trim();
    
    if (!url) {
        showError('Please enter a YouTube URL');
        return;
    }
    
    const videoId = extractVideoId(url);
    if (!videoId) {
        showError('Invalid YouTube URL. Please check and try again.');
        return;
    }
    
    // Hide previous results
    hideError();
    hideSection(elements.previewSection);
    hideSection(elements.audioSection);
    hideSection(elements.videoSection);
    hideSection(elements.downloadProgress);
    
    // Show loading
    showSection(elements.loadingSection);
    
    try {
        // Fetch video info
        const videoInfo = await mockFetchVideoInfo(videoId);
        currentVideoData = videoInfo;
        
        // Update preview - validate and sanitize URLs
        if (videoInfo.thumbnail && videoInfo.thumbnail.startsWith('https://')) {
            elements.thumbnail.src = videoInfo.thumbnail;
        } else {
            // Use placeholder if thumbnail URL is invalid
            elements.thumbnail.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjkwIiB2aWV3Qm94PSIwIDAgMTIwIDkwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iOTAiIGZpbGw9IiNmNWY1ZjciLz48L3N2Zz4=';
        }
        elements.videoTitle.textContent = videoInfo.title;
        elements.videoAuthor.textContent = videoInfo.author;
        elements.videoDuration.textContent = `Duration: ${formatDuration(videoInfo.duration)}`;
        
        // Get download options
        const options = await mockGetDownloadOptions(videoId);
        
        // Render audio options
        renderAudioOptions(options.audio);
        
        // Render video options
        renderVideoOptions(options.video);
        
        // Hide loading and show results
        hideSection(elements.loadingSection);
        showSection(elements.previewSection);
        showSection(elements.audioSection);
        showSection(elements.videoSection);
        
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to fetch video information. Please try again.');
    }
});

function renderAudioOptions(audioFormats) {
    elements.audioOptions.innerHTML = audioFormats.map((format, index) => {
        const quality = escapeHtml(format.quality);
        const bitrate = escapeHtml(String(format.bitrate));
        const size = escapeHtml(format.size);
        return `
        <div class="option-item" data-type="audio" data-quality="${quality}">
            <div class="option-info">
                <div class="option-title">MP3 - ${quality}</div>
                <div class="option-details">Bitrate: ${bitrate} kbps • Size: ~${size}</div>
            </div>
            <button class="option-action" data-type="audio" data-quality="${quality}" data-bitrate="${bitrate}">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 2v8m0 0L5 7m3 3l3-3M3 14h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                Download
            </button>
        </div>
    `;
    }).join('');
    
    // Add event listeners
    elements.audioOptions.querySelectorAll('.option-action').forEach(btn => {
        btn.addEventListener('click', () => {
            handleDownload(btn.dataset.type, btn.dataset.quality, btn.dataset.bitrate);
        });
    });
}

function renderVideoOptions(videoFormats) {
    elements.videoOptions.innerHTML = videoFormats.map((format, index) => {
        const quality = escapeHtml(format.quality);
        const resolution = escapeHtml(format.resolution);
        const size = escapeHtml(format.size);
        return `
        <div class="option-item" data-type="video" data-quality="${quality}">
            <div class="option-info">
                <div class="option-title">MP4 - ${quality}</div>
                <div class="option-details">Resolution: ${resolution} • Size: ~${size}</div>
            </div>
            <button class="option-action" data-type="video" data-quality="${quality}" data-resolution="${resolution}">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 2v8m0 0L5 7m3 3l3-3M3 14h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                Download
            </button>
        </div>
    `;
    }).join('');
    
    // Add event listeners
    elements.videoOptions.querySelectorAll('.option-action').forEach(btn => {
        btn.addEventListener('click', () => {
            handleDownload(btn.dataset.type, btn.dataset.quality, btn.dataset.resolution);
        });
    });
}

async function handleDownload(type, quality, extra) {
    // Show progress section
    hideSection(elements.audioSection);
    hideSection(elements.videoSection);
    showSection(elements.downloadProgress);
    updateProgress(0, 'Preparing download...');
    
    try {
        // Simulate download
        await mockDownload(type, quality);
        
        // Create mock download - escape user input
        const safeTitle = currentVideoData.title.substring(0, 50).replace(/[<>:"/\\|?*]/g, '_');
        const safeQuality = quality.replace(/[<>:"/\\|?*]/g, '_');
        const filename = type === 'audio' 
            ? `${safeTitle}_${safeQuality}.mp3`
            : `${safeTitle}_${safeQuality}.mp4`;
        
        // In a real implementation, this would trigger actual download
        updateProgress(100, 'Download complete!');
        
        // Show success message
        setTimeout(() => {
            alert(`Download started: ${filename}\n\nNote: This is a demo. In production, the actual file would be downloaded.`);
            
            // Hide progress and show options again
            hideSection(elements.downloadProgress);
            showSection(elements.audioSection);
            showSection(elements.videoSection);
        }, 1000);
        
    } catch (error) {
        console.error('Download error:', error);
        showError('Download failed. Please try again.');
        hideSection(elements.downloadProgress);
    }
}

// Input validation and UX improvements
elements.videoUrl.addEventListener('input', (e) => {
    const hasValue = e.target.value.trim().length > 0;
    elements.extractBtn.disabled = !hasValue;
});

elements.videoUrl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && elements.videoUrl.value.trim()) {
        elements.extractBtn.click();
    }
});

// Initialize
elements.extractBtn.disabled = true;

// PWA Install Prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show custom install button if needed
    console.log('PWA install prompt available');
});

window.addEventListener('appinstalled', () => {
    console.log('PWA installed successfully');
    deferredPrompt = null;
});

// Demo mode indicator
console.log('%c🎵 Audio Extractor Demo Mode', 'font-size: 16px; color: #007AFF; font-weight: bold;');
console.log('%cThis is a demonstration version using mock data.', 'font-size: 12px; color: #666;');
console.log('%cFor production use, integrate with a real YouTube API service.', 'font-size: 12px; color: #666;');
