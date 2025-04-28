<?php
// Telegram Bot API Token
$botToken = "7877159503:AAHLBuDzMULev4aSmmNCpmlIb9UjBzz2-p8";
$apiURL = "https://api.telegram.org/bot" . $botToken;

// Telegram থেকে ইনপুট পাওয়া
$update = file_get_contents("php://input");
$updateArray = json_decode($update, TRUE);

if (isset($updateArray['message'])) {
    $message = $updateArray['message']['text'] ?? '';
    $chat_id = $updateArray['message']['chat']['id'] ?? '';

    // যদি /goggle কমান্ড দেওয়া হয়
    if (strpos($message, "/goggle") === 0) {
        $searchTerm = trim(substr($message, 7)); // "/goggle " এর পরের শব্দ

        if (!empty($searchTerm)) {
            $url = "https://www.google.com/search?hl=en&tbm=isch&q=" . urlencode($searchTerm) . "&imgsz=xxlarge";

            $html = @file_get_contents($url);

            if ($html !== false) {
                preg_match_all('/<img.*?src="(https:\/\/[^"]+)"/', $html, $matches);
                $photos = array_slice($matches[1], 0, 6);

                sendImageGrid($chat_id, $photos);
            } else {
                sendMessage($chat_id, "দুঃখিত, গুগল থেকে ছবি পাওয়া যায়নি।");
            }
        } else {
            sendMessage($chat_id, "দয়া করে '/goggle [ছবির নাম]' দিয়ে সার্চ করুন।");
        }
    }
}

// বার্তা পাঠানোর ফাংশন
function sendMessage($chat_id, $message) {
    global $apiURL;
    $url = $apiURL . "/sendMessage?chat_id=" . $chat_id . "&text=" . urlencode($message);
    file_get_contents($url);
}

// একাধিক ছবি গ্রিড আকারে পাঠানোর ফাংশন
function sendImageGrid($chat_id, $photos) {
    global $apiURL;

    $photoIds = [];
    foreach ($photos as $photo) {
        $url = $apiURL . "/sendPhoto?chat_id=" . $chat_id . "&photo=" . $photo;
        $response = file_get_contents($url);
        $responseData = json_decode($response, true);
        if (isset($responseData['result']['photo'])) {
            $photoIds[] = $responseData['result']['photo'][0]['file_id'];
        }
    }

    if (count($photoIds) > 1) {
        $url = $apiURL . "/sendMediaGroup?chat_id=" . $chat_id;
        $media = [];
        foreach ($photoIds as $file_id) {
            $media[] = ['type' => 'photo', 'media' => $file_id];
        }

        $mediaPayload = json_encode(['media' => $media]);
        $options = [
            'http' => [
                'method' => 'POST',
                'header' => "Content-type: application/json\r\n",
                'content' => $mediaPayload
            ]
        ];
        $context = stream_context_create($options);
        file_get_contents($url, false, $context);
    }
}

// Render.com এর server একটা response expect করে, তাই একটা dummy response পাঠাচ্ছি
http_response_code(200);
echo "Bot is running!";
?>
