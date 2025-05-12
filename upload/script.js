document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const resultContainer = document.getElementById('result-container');
    const previewContainer = document.getElementById('preview-container');
    const fileLink = document.getElementById('file-link');
    const copyButton = document.getElementById('copy-button');
    const uploadAnotherButton = document.getElementById('upload-another');
    const loadingScreen = document.getElementById('loading');
    const embedInfo = document.getElementById('embed-info');

    // Event Listeners
    uploadArea.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        fileInput.click();
    });
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);
    copyButton.addEventListener('click', copyToClipboard);
    uploadAnotherButton.addEventListener('click', resetUploader);

    // Handle drag over events
    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.add('drag-over');
    }

    // Handle drag leave events
    function handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.remove('drag-over');
    }

    // Handle drop events
    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            // Show loading cat immediately
            loadingScreen.style.display = 'flex';
            processFile(files[0]);
        }
    }

    // Handle file selection
    function handleFileSelect(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const files = e.target.files;
        if (files.length > 0) {
            // Show loading cat immediately
            loadingScreen.style.display = 'flex';
            // Use setTimeout with 0ms to ensure the UI updates before processing
            setTimeout(() => {
                processFile(files[0]);
            }, 0);
        }
    }

    // Process the selected file
    function processFile(file) {
        // Check if file is image or video
        if (!file.type.match('image.*') && !file.type.match('video.*')) {
            loadingScreen.style.display = 'none';
            alert('Only image and video files are supported!');
            return;
        }

        // Loading screen is already visible at this point

        // Process file client-side since GitHub Pages doesn't support server-side code
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                // Generate a random filename
                const randomString = generateRandomString(8);
                const fileExt = file.name.split('.').pop();
                const fileName = `${randomString}.${fileExt}`;
                
                // Store file in localStorage
                const fileData = {
                    name: fileName,
                    originalName: file.name,
                    type: file.type,
                    data: e.target.result,
                    date: new Date().toISOString(),
                    size: file.size
                };
                
                // Save to localStorage
                localStorage.setItem(`soal_file_${fileName}`, JSON.stringify(fileData));
                
                // Create a sharing URL
                // GitHub Pages base URL + view.html with the file parameter
                const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '/');
                const shareUrl = `${baseUrl}view.html?file=${fileName}`;
                
                // Create file preview
                createPreview(file);
                
                // Set the link
                fileLink.value = shareUrl;
                
                // Show embed info for videos
                if (file.type.match('video.*')) {
                    embedInfo.style.display = 'block';
                } else {
                    embedInfo.style.display = 'none';
                }
                
                // Hide loading and show result
                loadingScreen.style.display = 'none';
                uploadArea.style.display = 'none';
                resultContainer.style.display = 'block';
            } catch (error) {
                console.error('Storage error:', error);
                alert('Error saving file. The file might be too large for browser storage.');
                loadingScreen.style.display = 'none';
            }
        };
        
        reader.onerror = function() {
            console.error('File reading error');
            alert('Error reading file. Please try again.');
            loadingScreen.style.display = 'none';
        };
        
        // Read file as data URL
        reader.readAsDataURL(file);
    }

    // Create preview of uploaded file
    function createPreview(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            previewContainer.innerHTML = '';
            
            if (file.type.match('image.*')) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.alt = file.name;
                previewContainer.appendChild(img);
            } else if (file.type.match('video.*')) {
                const video = document.createElement('video');
                video.src = e.target.result;
                video.controls = true;
                video.autoplay = false;
                video.muted = true;
                previewContainer.appendChild(video);
            }
        };
        
        reader.readAsDataURL(file);
    }

    // Generate random string for URLs
    function generateRandomString(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return result;
    }
    
    // We no longer need the createViewPage function since we're using PHP to handle file uploads and URLs

    // Copy link to clipboard
    function copyToClipboard() {
        fileLink.select();
        document.execCommand('copy');
        
        // Visual feedback
        copyButton.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
            copyButton.innerHTML = '<i class="fas fa-copy"></i>';
        }, 2000);
    }

    // Reset uploader to initial state
    function resetUploader() {
        fileInput.value = '';
        uploadArea.style.display = 'block';
        resultContainer.style.display = 'none';
        // Ensure loading screen is hidden
        loadingScreen.style.display = 'none';
    }
});
