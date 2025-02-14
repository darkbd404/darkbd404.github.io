<?php
$secret = 'darkbd404';
$token = '7828394833:AAGWXAKToC37qL_Ebh_huR2CA1bzK9H-zzU';

// টেলিগ্রাম থেকে আপডেট প্রাপ্তি
$update = file_get_contents('php://input');
$update = json_decode($update, TRUE);

// চ্যাট আইডি এবং মেসেজ প্রাপ্তি
$chatId = $update['message']['chat']['id'];
$message = $update['message']['text'];

// GitHub Signature যাচাই
$headers = getallheaders();
if (isset($headers['X-Hub-Signature'])) {
    $signature = $headers['X-Hub-Signature'];
    $payload = file_get_contents('php://input');
    $expected_signature = 'sha1=' . hash_hmac('sha1', $payload, $secret);
    if (hash_equals($expected_signature, $signature)) {
        // Signature সঠিক
        switch($message) {
            case '/start':
                sendMessage($chatId, "Hello, Welcome to my Bot!");
                break;
            default:
                sendMessage($chatId, "You said: $message");
                break;
        }
    } else {
        // Signature সঠিক নয়
        http_response_code(403);
        exit('Forbidden');
    }
} else {
    // Signature নেই
    http_response_code(403);
    exit('Forbidden');
}

// মেসেজ পাঠানোর ফাংশন
function sendMessage($chatId, $message) {
    global $token;
    $url = "https://api.telegram.org/bot$token/sendMessage?chat_id=$chatId&text=" . urlencode($message);
    file_get_contents($url);
}
?>
