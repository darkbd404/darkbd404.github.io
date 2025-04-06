import requests
import json

def verify_mobile_number(phone):
    url = "https://ezybank.dhakabank.com.bd/VerifIDExt2/api/CustOnBoarding/VerifyMobileNumber"
    
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0"
    }
    
    payload = {
        "AccessToken": "",
        "TrackingNo": "",
        "mobileNo": phone,
        "otpSms": "",
        "product_id": "250",
        "requestChannel": "MOB",
        "trackingStatus": 5
    }
    
    # SSL verification বন্ধ করা (ডিবাগের জন্য, প্রোডাকশনে এটি বন্ধ না করাই ভালো)
    response = requests.post(url, headers=headers, data=json.dumps(payload), verify=False)
    
    return response.text

# Vercel Serverless Function হ্যান্ডলার
def handler(request):
    phone = request.args.get("number")
    if phone:
        result = verify_mobile_number(phone)
        return {
            "statusCode": 200,
            "body": result,
            "headers": {"Content-Type": "application/json"}
        }
    else:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Phone number is required"})
        }
