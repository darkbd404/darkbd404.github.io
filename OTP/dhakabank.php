<?php

$phn = $_REQUEST["phone"];
$url = "https://ezybank.dhakabank.com.bd/VerifIDExt2/api/CustOnBoarding/VerifyMobileNumber";

$curl = curl_init($url);
curl_setopt($curl, CURLOPT_URL, $url);
curl_setopt($curl, CURLOPT_POST, true);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

$headers = array(
   "Content-Type: application/json",
  "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0",

);
curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
//{ "AccessToken": "", "TrackingNo": "", "mobileNo": "*****", "otpSms": "", "product_id": "250", "requestChannel": "MOB", "trackingStatus": 5 }

$ps = array(
  "AccessToken" => "", "TrackingNo" =>  "", "mobileNo"=>  $phn, "otpSms"=>  "", "product_id"=>  "250", "requestChannel"=>  "MOB", "trackingStatus"=>  5
);

$data = json_encode($ps);

curl_setopt($curl, CURLOPT_POSTFIELDS, $data);

//for debug only!
curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);

$resp = curl_exec($curl);
curl_close($curl);
echo($resp);

?>

