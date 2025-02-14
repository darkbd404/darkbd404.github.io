<?php
$token = '7828394833:AAGWXAKToC37qL_Ebh_huR2CA1bzK9H-zzU';
$update = file_get_contents('php://input');
$update = json_decode($update, TRUE);
$chatId = $update['message']['chat']['id'];
$message = $update['message']['text'];

switch($message) {
    case '/start':
        sendMessage($chatId, "Hello, Welcome to my Bot!");
        break;
    default:
        sendMessage($chatId, "You said: $message");
        break;
}

function sendMessage($chatId, $message) {
    global $token;
    $url = "https://api.telegram.org/bot$token/sendMessage?chat_id=$chatId&text=$message";
    file_get_contents($url);
}
?>
