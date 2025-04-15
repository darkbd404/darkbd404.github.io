<?php
header('Content-Type: application/json');

$otpCount = 0; // সার্ভারে পার্সিস্ট করতে হলে ফাইল/ডাটাবেসে স্টোর করতে হবে

// GET প্যারামিটার নেয়া
$phone = isset($_GET['phone']) ? $_GET['phone'] : null;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 5;

// ফোন নম্বর ভ্যালিডেশন
if (!$phone || strlen($phone) !== 11) {
    http_response_code(400);
    echo json_encode(['error' => 'দয়া করে সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন।']);
    exit;
}

// ফোন নম্বরে 88 যোগ
$fullPhoneNumber = "88" . $phone;

// লিমিট চেক
if ($otpCount >= $limit) {
    http_response_code(429);
    echo json_encode(['error' => 'OTP সীমা অতিক্রম করেছে!']);
    exit;
}

// API ডেটা
$apiUrl = "http://api.ads.army/otp/sendOTP";
$data = [
    'app' => 'loveapps',
    'msisdn' => $fullPhoneNumber,
    'aditionalData' => [
        [
            'network' => '1001',
            'clickid' => '880196110478746076',
            'campaignid' => '8837158'
        ]
    ]
];

// cURL দিয়ে API কল
$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json; charset=utf-8',
    'Accept: */*',
    'Origin: http://loveapps.bd.gd',
    'Referer: http://loveapps.bd.gd/',
    'User-Agent: Mozilla/5.0 (Linux; Android 11; helio 30 Build/RP1A.200720.011) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.39 Mobile Safari/537.36'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($response === false || $httpCode !== 200) {
    http_response_code(500);
    echo json_encode(['error' => 'কিছু সমস্যা হয়েছে!']);
    exit;
}

$result = json_decode($response, true);
$otpCount++;

// সাকসেস রেসপন্স
http_response_code(200);
echo json_encode([
    'message' => "OTP পাঠানো হয়েছে! মোট পাঠানো হয়েছে: $otpCount",
    'data' => $result
]);
?>
