<?php
// Telegram Bot API Token
$botToken = "7828394833:AAGWXAKToC37qL_Ebh_huR2CA1bzK9H-zzU";
$apiURL = "https://api.telegram.org/bot" . $botToken;

// Telegram থেকে ইনপুট পাওয়া
$update = file_get_contents("php://input");
$updateArray = json_decode($update, TRUE);

// বার্তা পাঠানো
$message = $updateArray['message']['text'];
$chat_id = $updateArray['message']['chat']['id'];

// যদি /image কমান্ড দেওয়া হয়
if (strpos($message, "/goggle") === 0) {
    // '/image' কমান্ড এর পর যদি কিছু লেখা থাকে
    $searchTerm = trim(substr($message, 7)); // "/image " এর পরের নাম

    if (!empty($searchTerm)) {
        // গুগল ইমেজ সার্চ URL তৈরি (imgsz=xxlarge প্যারামিটার দিয়ে)
        $url = "https://www.google.com/search?hl=en&tbm=isch&q=" . urlencode($searchTerm) . "&imgsz=xxlarge";  // xxlarge মানে Full HD ছবি

        // গুগল সার্চ পেজের HTML ডাউনলোড করা
        $html = file_get_contents($url);

        // যদি HTML পাওয়া যায়
        if ($html !== false) {
            // HTML থেকে ছবি URL বের করার জন্য প্যাটার্ন
            preg_match_all('/<img.*?src="(https:\/\/[^"]+)"/', $html, $matches);

            // প্রথম 6টি ছবি সংগ্রহ করা
            $photos = array_slice($matches[1], 0, 6);

            // ছবি গ্রিড আকারে পাঠানো
            sendImageGrid($chat_id, $photos);
        } else {
            sendMessage($chat_id, "দুঃখিত, গুগল থেকে ছবি পাওয়া যায়নি।");
        }
    } else {
        sendMessage($chat_id, "দয়া করে '/image [যে কোন ছবির নাম]' দিয়ে ছবি সার্চ করুন।");
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

    // ফটোগুলো একসঙ্গে পাঠানোর জন্য
    $photoIds = [];
    foreach ($photos as $photo) {
        // ছবি পাঠানোর জন্য API কল
        $url = $apiURL . "/sendPhoto?chat_id=" . $chat_id . "&photo=" . $photo;
        $response = file_get_contents($url);
        $responseData = json_decode($response, true);
        if (isset($responseData['result']['photo'])) {
            // যদি ছবি পাঠানো হয়, ফটো আইডি সেভ করা
            $photoIds[] = $responseData['result']['photo'][0]['file_id'];
        }
    }

    // একসাথে গ্রিড আকারে ছবি পাঠানো
    if (count($photoIds) > 1) {
        $url = $apiURL . "/sendMediaGroup?chat_id=" . $chat_id;
        $media = [];
        foreach ($photoIds as $file_id) {
            $media[] = ['type' => 'photo', 'media' => $file_id];
        }

        $mediaPayload = ['media' => json_encode($media)];
        $options = [
            'http' => [
                'method' => 'POST',
                'header' => "Content-type: application/json\r\n",
                'content' => http_build_query($mediaPayload)
            ]
        ];
        $context = stream_context_create($options);
        $result = file_get_contents($url, false, $context);

        // যদি ফটোগুলি সফলভাবে পাঠানো হয়
        if ($result) {
            sendMessage($chat_id, "এখানে আপনার ছবি:");
        } else {
            sendMessage($chat_id, "আরও ছবি পেতে আবার Search করুন।");
        }
    }
}
?>
