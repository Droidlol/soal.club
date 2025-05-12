<?php
// Allow cross-origin requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: *");

// Configure upload settings
$uploadDir = 'files/'; // Directory where files will be stored
$maxFileSize = 50 * 1024 * 1024; // 50MB max file size

// Create the upload directory if it doesn't exist
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Make sure we have a file
if (empty($_FILES['file'])) {
    echo json_encode([
        'success' => false,
        'message' => 'No file was uploaded'
    ]);
    exit;
}

$file = $_FILES['file'];

// Check for upload errors
if ($file['error'] !== UPLOAD_ERR_OK) {
    $errorMessages = [
        UPLOAD_ERR_INI_SIZE => 'The uploaded file exceeds the upload_max_filesize directive in php.ini',
        UPLOAD_ERR_FORM_SIZE => 'The uploaded file exceeds the MAX_FILE_SIZE directive in the HTML form',
        UPLOAD_ERR_PARTIAL => 'The uploaded file was only partially uploaded',
        UPLOAD_ERR_NO_FILE => 'No file was uploaded',
        UPLOAD_ERR_NO_TMP_DIR => 'Missing a temporary folder',
        UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
        UPLOAD_ERR_EXTENSION => 'A PHP extension stopped the file upload'
    ];
    
    $errorMessage = isset($errorMessages[$file['error']]) 
        ? $errorMessages[$file['error']] 
        : 'Unknown upload error';
    
    echo json_encode([
        'success' => false,
        'message' => $errorMessage
    ]);
    exit;
}

// Check file size
if ($file['size'] > $maxFileSize) {
    echo json_encode([
        'success' => false,
        'message' => 'File is too large (max ' . ($maxFileSize / 1024 / 1024) . 'MB)'
    ]);
    exit;
}

// Get file extension and generate random filename
$fileExt = pathinfo($file['name'], PATHINFO_EXTENSION);
$allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm', 'mov'];

if (!in_array(strtolower($fileExt), $allowedExtensions)) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid file type. Allowed types: ' . implode(', ', $allowedExtensions)
    ]);
    exit;
}

// Generate a random filename
function generateRandomString($length = 8) {
    $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    $result = '';
    
    for ($i = 0; $i < $length; $i++) {
        $result .= $chars[mt_rand(0, strlen($chars) - 1)];
    }
    
    return $result;
}

// Generate unique filename
$newFilename = generateRandomString(8) . '.' . $fileExt;
$uploadPath = $uploadDir . $newFilename;

// Make sure the filename is unique
while (file_exists($uploadPath)) {
    $newFilename = generateRandomString(8) . '.' . $fileExt;
    $uploadPath = $uploadDir . $newFilename;
}

// Move the file to the upload directory
if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
    // Determine the full URL to the file
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://';
    $host = $_SERVER['HTTP_HOST'];
    $uri = rtrim(dirname($_SERVER['PHP_SELF']), '/\\');
    
    $fileUrl = $protocol . $host . $uri . '/' . $uploadPath;
    
    echo json_encode([
        'success' => true,
        'fileUrl' => $fileUrl,
        'fileName' => $newFilename,
        'fileType' => $file['type']
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to save the uploaded file'
    ]);
}
?>
