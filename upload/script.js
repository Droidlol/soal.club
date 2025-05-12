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

        // Use GoFile for all file types
        // Generate random string for filename
        const randomString = generateRandomString(8);
        const fileExt = file.name.split('.').pop().toLowerCase();
        
        // Show loading screen
        loadingScreen.style.display = 'flex';
        
        // Upload the file to GoFile
        uploadToGoFile(file, randomString, fileExt);
    }
    
    // Function to upload files to GoFile
    function uploadToGoFile(file, randomString, fileExt) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('token', 'lrOjbbunRT2PHnMqmoCUlEYPJrW5XIok'); // Your GoFile API token
        
        // Upload directly to GoFile using the current API
        fetch('https://upload.gofile.io/uploadFile', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'ok') {
                // Create file preview
                createPreview(file);
                
                // Get the link to the file
                const fileUrl = data.data.downloadPage;
                
                // Set the link - modern GoFile uses shorter URLs
                fileLink.value = fileUrl;
                
                // Show embed info for videos
                if (file.type.match('video.*')) {
                    embedInfo.style.display = 'block';
                } else {
                    embedInfo.style.display = 'none';
                }
                
                // Store minimal info in localStorage just for the preview
                const fileInfo = {
                    name: `${randomString}.${fileExt}`,
                    originalName: file.name,
                    type: file.type,
                    displayUrl: fileUrl,
                    size: file.size
                };
                localStorage.setItem(`soal_file_info_${randomString}`, JSON.stringify(fileInfo));
                
                // Hide loading and show result
                loadingScreen.style.display = 'none';
                uploadArea.style.display = 'none';
                resultContainer.style.display = 'block';
            } else {
                throw new Error('Upload failed: ' + (data.error || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Upload error:', error);
            alert('Failed to upload the file. Please try again or try a smaller file.');
            loadingScreen.style.display = 'none';
        });
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
