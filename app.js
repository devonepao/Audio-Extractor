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
const INVIDIOUS_INSTANCE = 'https://yewtu.be';

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

async function fetchVideoInfo(videoId) {
    const response = await fetch(`${INVIDIOUS_INSTANCE}/api/v1/videos/${videoId}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch video information: ${response.statusText}`);
    }
    return response.json();
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
        const videoInfo = await fetchVideoInfo(videoId);
        currentVideoData = videoInfo;
        
        // Update preview
        const thumbnailUrl = videoInfo.videoThumbnails.find(t => t.quality === 'hqdefault')?.url;
        if (thumbnailUrl) {
            elements.thumbnail.src = thumbnailUrl;
        } else {
            elements.thumbnail.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjkwIiB2aWV3Qm94PSIwIDAgMTIwIDkwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iOTAiIGZpbGw9IiNmNWY1ZjciLz48L3N2Zz4=';
        }
        elements.videoTitle.textContent = videoInfo.title;
        elements.videoAuthor.textContent = videoInfo.author;
        elements.videoDuration.textContent = `Duration: ${formatDuration(videoInfo.lengthSeconds)}`;
        
        // Get download options
        const audioFormats = videoInfo.adaptiveFormats.filter(f => f.type.startsWith('audio/'));
        const videoFormats = videoInfo.adaptiveFormats.filter(f => f.type.startsWith('video/'));

        // Render audio options
        renderAudioOptions(audioFormats);
        
        // Render video options
        renderVideoOptions(videoFormats);
        
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
    elements.audioOptions.innerHTML = audioFormats.map(format => {
        const quality = `${Math.round(format.bitrate / 1000)} kbps`;
        const size = format.contentLength ? formatFileSize(format.contentLength) : 'Unknown size';
        const url = format.url;
        return `
        <div class="option-item" data-type="audio" data-quality="${quality}">
            <div class="option-info">
                <div class="option-title">MP3 - ${quality}</div>
                <div class="option-details">Bitrate: ${quality} • Size: ~${size}</div>
            </div>
            <button class="option-action" data-type="audio" data-quality="${quality}" data-url="${url}">
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
            handleDownload('audio', btn.dataset.quality, btn.dataset.url);
        });
    });
}

function renderVideoOptions(videoFormats) {
    elements.videoOptions.innerHTML = videoFormats.map(format => {
        const quality = format.resolution;
        const size = format.contentLength ? formatFileSize(format.contentLength) : 'Unknown size';
        const url = format.url;
        return `
        <div class="option-item" data-type="video" data-quality="${quality}">
            <div class="option-info">
                <div class="option-title">MP4 - ${quality}</div>
                <div class="option-details">Resolution: ${quality} • Size: ~${size}</div>
            </div>
            <button class="option-action" data-type="video" data-quality="${quality}" data-url="${url}">
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
            handleDownload('video', btn.dataset.quality, btn.dataset.url);
        });
    });
}

function triggerFileDownload(blob, filename) {
    // Create a download link and trigger it
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

async function handleDownload(type, quality, url) {
    // Show progress section
    hideSection(elements.audioSection);
    hideSection(elements.videoSection);
    showSection(elements.downloadProgress);
    updateProgress(0, 'Preparing download...');

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Download failed: ${response.statusText}`);
        }

        const contentLength = response.headers.get('content-length');
        const totalSize = parseInt(contentLength, 10);
        let loadedSize = 0;

        const reader = response.body.getReader();
        const stream = new ReadableStream({
            start(controller) {
                function push() {
                    reader.read().then(({ done, value }) => {
                        if (done) {
                            controller.close();
                            return;
                        }
                        loadedSize += value.length;
                        if (totalSize) {
                            const percent = (loadedSize / totalSize) * 100;
                            updateProgress(percent, `Downloading ${type} (${quality})...`);
                        }
                        controller.enqueue(value);
                        push();
                    });
                }
                push();
            }
        });

        const blob = await new Response(stream).blob();
        
        // Create filename
        const safeTitle = currentVideoData.title.substring(0, 50).replace(/[<>:"/\\|?*]/g, '_');
        const safeQuality = quality.replace(/[<>:"/\\|?*]/g, '_');
        const extension = type === 'audio' ? 'mp3' : 'mp4';
        const filename = `${safeTitle}_${safeQuality}.${extension}`;
        
        triggerFileDownload(blob, filename);
        
        updateProgress(100, 'Download complete!');
        
        setTimeout(() => {
            hideSection(elements.downloadProgress);
            showSection(elements.audioSection);
            showSection(elements.videoSection);
        }, 2000);
        
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
