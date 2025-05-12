<?php
// Get the filename from the query string
$filename = isset($_GET['file']) ? $_GET['file'] : '';

// Validate filename to prevent directory traversal
$filename = basename($filename);

// Path to the file
$filePath = 'files/' . $filename;

// Check if file exists
if (!file_exists($filePath) || empty($filename)) {
    header("HTTP/1.0 404 Not Found");
    include('404.php');
    exit;
}

// Get file extension to determine type
$fileExt = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

// Define allowed file types
$imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
$videoTypes = ['mp4', 'webm', 'mov'];

// Determine file type
$isImage = in_array($fileExt, $imageTypes);
$isVideo = in_array($fileExt, $videoTypes);

// Get file size
$fileSize = filesize($filePath);
$formattedSize = formatFileSize($fileSize);

// Function to format file size
function formatFileSize($bytes) {
    $units = ['B', 'KB', 'MB', 'GB'];
    $i = 0;
    while ($bytes > 1024 && $i < count($units) - 1) {
        $bytes /= 1024;
        $i++;
    }
    return round($bytes, 2) . ' ' . $units[$i];
}

// Get current URL for sharing
$protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://';
$host = $_SERVER['HTTP_HOST'];
$uri = $_SERVER['REQUEST_URI'];
$fullUrl = $protocol . $host . $uri;

// Determine if this will embed on Discord
$discordEmbed = $isVideo || $isImage;
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($filename); ?> - soal.club</title>
    
    <!-- Meta tags for better sharing -->
    <meta property="og:title" content="<?php echo htmlspecialchars($filename); ?> - soal.club">
    <meta property="og:type" content="<?php echo $isVideo ? 'video' : ($isImage ? 'image' : 'website'); ?>">
    <meta property="og:url" content="<?php echo htmlspecialchars($fullUrl); ?>">
    <?php if ($isImage): ?>
    <meta property="og:image" content="<?php echo htmlspecialchars($protocol . $host . dirname($_SERVER['PHP_SELF']) . '/files/' . $filename); ?>">
    <?php endif; ?>
    <?php if ($isVideo): ?>
    <meta property="og:video" content="<?php echo htmlspecialchars($protocol . $host . dirname($_SERVER['PHP_SELF']) . '/files/' . $filename); ?>">
    <meta property="og:video:type" content="video/<?php echo $fileExt; ?>">
    <?php endif; ?>
    <meta property="og:description" content="View this <?php echo $isVideo ? 'video' : ($isImage ? 'image' : 'file'); ?> on soal.club">
    <meta property="og:site_name" content="soal.club uploader">
    
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
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
            background-image: url('paw-pattern.png');
        }
        .container {
            max-width: 900px;
            width: 90%;
            padding: 2rem;
            background-color: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            text-align: center;
            margin: 2rem;
            position: relative;
            overflow: hidden;
        }
        img, video {
            max-width: 100%;
            max-height: 70vh;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #ff6b6b;
            margin-bottom: 1rem;
        }
        .file-info {
            margin: 1rem 0;
            font-size: 0.9rem;
            color: #636e72;
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
            background-color: #4ecdc4;
            color: white;
            border-radius: 50px;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s;
        }
        .btn:hover {
            background-color: #3bafa5;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(78, 205, 196, 0.3);
        }
        .cat-decoration {
            position: absolute;
            width: 100px;
            z-index: 0;
        }
        .cat-decoration-1 {
            top: 20px;
            right: -30px;
            transform: rotate(15deg);
        }
        .cat-decoration-2 {
            bottom: 20px;
            left: -20px;
            transform: rotate(-10deg);
        }
        .media-container {
            position: relative;
            z-index: 1;
            margin: 2rem auto;
        }
        .copy-link {
            display: flex;
            max-width: 500px;
            margin: 1rem auto;
        }
        .copy-link input {
            flex: 1;
            padding: 0.8rem;
            border: 2px solid #4ecdc4;
            border-radius: 8px 0 0 8px;
            font-size: 1rem;
            outline: none;
        }
        .copy-link button {
            background-color: #4ecdc4;
            color: white;
            border: none;
            padding: 0.8rem 1.2rem;
            border-radius: 0 8px 8px 0;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        .copy-link button:hover {
            background-color: #3bafa5;
        }
        .discord-embed {
            display: inline-block;
            margin-top: 0.5rem;
            padding: 0.5rem 1rem;
            background-color: #7289da;
            color: white;
            border-radius: 50px;
            font-size: 0.9rem;
        }
        .discord-embed i {
            margin-right: 0.5rem;
        }
        .direct-link {
            margin-top: 1rem;
        }
        .direct-link a {
            color: #4ecdc4;
            text-decoration: none;
        }
        .direct-link a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>soal.club <span class="cat-emoji">🐱</span></h1>
        
        <div class="file-info">
            <span><i class="fas fa-file"></i> <?php echo htmlspecialchars($filename); ?></span>
            <span><i class="fas fa-weight-hanging"></i> <?php echo $formattedSize; ?></span>
        </div>
        
        <div class="media-container">
            <?php if ($isImage): ?>
                <img src="files/<?php echo htmlspecialchars($filename); ?>" alt="<?php echo htmlspecialchars($filename); ?>">
            <?php elseif ($isVideo): ?>
                <video controls autoplay muted>
                    <source src="files/<?php echo htmlspecialchars($filename); ?>" type="video/<?php echo $fileExt; ?>">
                    Your browser does not support the video tag.
                </video>
            <?php else: ?>
                <p>This file type cannot be previewed.</p>
                <a href="files/<?php echo htmlspecialchars($filename); ?>" download class="btn">Download File</a>
            <?php endif; ?>
        </div>
        
        <?php if ($discordEmbed): ?>
            <div class="discord-embed">
                <i class="fab fa-discord"></i> This file will auto-embed on Discord!
            </div>
        <?php endif; ?>
        
        <div class="copy-link">
            <input type="text" id="page-url" value="<?php echo htmlspecialchars($fullUrl); ?>" readonly>
            <button id="copy-button">
                <i class="fas fa-copy"></i>
            </button>
        </div>
        
        <div class="direct-link">
            <a href="files/<?php echo htmlspecialchars($filename); ?>" target="_blank">Direct link to file</a>
        </div>
        
        <div class="footer">
            <p>Uploaded via soal.club uploader</p>
            <a href="index.html" class="btn">Upload Another File</a>
        </div>
        
        <div class="cat-decoration cat-decoration-1">
            <img src="cat2.gif" alt="Decorative cat">
        </div>
        <div class="cat-decoration cat-decoration-2">
            <img src="cat3.gif" alt="Decorative cat">
        </div>
    </div>
    
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const copyButton = document.getElementById('copy-button');
            const pageUrl = document.getElementById('page-url');
            
            // Copy URL to clipboard
            copyButton.addEventListener('click', () => {
                pageUrl.select();
                document.execCommand('copy');
                
                // Visual feedback
                copyButton.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => {
                    copyButton.innerHTML = '<i class="fas fa-copy"></i>';
                }, 2000);
            });
        });
    </script>
</body>
</html>
