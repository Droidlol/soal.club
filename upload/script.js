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

        // Create a FormData object and append the file
        const formData = new FormData();
        formData.append('file', file);

        // Store the file in local storage with a random ID
        const randomString = generateRandomString(8);
        const fileExtension = file.name.split('.').pop();
        const fileName = `${randomString}.${fileExtension}`;
        
        // Create a reader to get the file data
        const reader = new FileReader();
        
        reader.onload = function(e) {
            // Get the file data as a data URL
            const fileData = e.target.result;
            
            // Store the file in localStorage
            try {
                // Using a simple object to store file info
                const fileInfo = {
                    name: fileName,
                    type: file.type,
                    data: fileData,
                    date: new Date().toISOString()
                };
                
                // Save to localStorage (this has size limitations, but works for demo)
                localStorage.setItem(`soal_file_${fileName}`, JSON.stringify(fileInfo));
                
                // Generate a link that will work with our custom handler
                const baseUrl = window.location.origin + window.location.pathname;
                const viewerUrl = `${baseUrl}view.html?file=${fileName}`;
                
                // Create file preview
                createPreview(file);
                
                // Set the generated link
                fileLink.value = viewerUrl;
                
                // Show embed info for videos
                if (file.type.match('video.*')) {
                    embedInfo.style.display = 'block';
                } else {
                    embedInfo.style.display = 'none';
                }
                
                // Create a special way to view the file via its data URL
                createViewPage(fileName, fileData, file.type);
                
                // Hide loading and show result
                loadingScreen.style.display = 'none';
                uploadArea.style.display = 'none';
                resultContainer.style.display = 'block';
                
            } catch (error) {
                console.error('Storage error:', error);
                alert('File too large for local storage. Try a smaller file.');
                loadingScreen.style.display = 'none';
            }
        };
        
        reader.onerror = function() {
            console.error('File reading error');
            alert('Error reading file. Please try again.');
            loadingScreen.style.display = 'none';
        };
        
        // Read the file as a data URL
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
    
    // Function to create a view page for the uploaded file
    function createViewPage(fileName, fileData, fileType) {
        // Generate simple HTML for viewing the file
        const isImage = fileType.match('image.*');
        const isVideo = fileType.match('video.*');
        
        let htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${fileName} - soal.club</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background-color: #f7fff7;
                        color: #292f36;
                        margin: 0;
                        padding: 0;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                    }
                    .container {
                        max-width: 900px;
                        padding: 2rem;
                        background-color: white;
                        border-radius: 15px;
                        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                        text-align: center;
                    }
                    img, video {
                        max-width: 100%;
                        max-height: 70vh;
                        border-radius: 10px;
                        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                    }
                    h1 {
                        color: #ff6b6b;
                        margin-bottom: 1.5rem;
                    }
                    .footer {
                        margin-top: 2rem;
                        color: #636e72;
                        font-size: 0.9rem;
                    }
                    .btn {
                        display: inline-block;
                        margin-top: 1rem;
                        padding: 0.8rem 1.5rem;
                        background-color: #6c5ce7;
                        color: white;
                        border-radius: 50px;
                        text-decoration: none;
                        font-weight: 600;
                        transition: all 0.3s;
                    }
                    .btn:hover {
                        background-color: #5f50e6;
                        transform: translateY(-2px);
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>soal.club - ${fileName}</h1>
        `;
        
        if (isImage) {
            htmlContent += `<img src="${fileData}" alt="${fileName}">`;
        } else if (isVideo) {
            htmlContent += `<video controls autoplay><source src="${fileData}" type="${fileType}">Your browser does not support the video tag.</video>`;
        } else {
            htmlContent += `<p>File type not supported for preview.</p>`;
        }
        
        htmlContent += `
                    <div class="footer">
                        <p>Uploaded via soal.club uploader</p>
                        <a href="index.html" class="btn">Upload Another File</a>
                    </div>
                </div>
                <script>
                    // Get file data from localStorage
                    function loadFileFromStorage() {
                        const urlParams = new URLSearchParams(window.location.search);
                        const fileName = urlParams.get('file');
                        
                        if (fileName) {
                            const fileInfo = localStorage.getItem('soal_file_' + fileName);
                            if (fileInfo) {
                                return JSON.parse(fileInfo);
                            }
                        }
                        return null;
                    }
                    
                    // On page load, try to get file from storage
                    window.addEventListener('DOMContentLoaded', () => {
                        const fileInfo = loadFileFromStorage();
                        if (fileInfo) {
                            // Update the page with the actual file data
                            const mediaElement = document.querySelector('img, video');
                            if (mediaElement) {
                                if (mediaElement.tagName === 'IMG') {
                                    mediaElement.src = fileInfo.data;
                                } else if (mediaElement.tagName === 'VIDEO') {
                                    const source = mediaElement.querySelector('source');
                                    if (source) {
                                        source.src = fileInfo.data;
                                        source.type = fileInfo.type;
                                        mediaElement.load();
                                    }
                                }
                            }
                        }
                    });
                </script>
            </body>
            </html>
        `;
        
        // Store view page in localStorage for later retrieval
        localStorage.setItem(`soal_view_${fileName}`, htmlContent);
    }

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
