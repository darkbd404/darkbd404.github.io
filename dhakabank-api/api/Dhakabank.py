from http.server import BaseHTTPRequestHandler
import json
import requests
from urllib.parse import urlparse, parse_qs

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Query প্যারামিটার পার্স করুন
        query = urlparse(self.path).query
        params = parse_qs(query)
        phone = params.get('number', [''])[0]

        if not phone:
            self.send_error(400, "Phone number is required")
            return

        try:
            # Dhaka Bank API কল করুন
            result = self.verify_mobile_number(phone)
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(result.encode())
        except Exception as e:
            self.send_error(500, str(e))

    def verify_mobile_number(self, phone):
        url = "https://ezybank.dhakabank.com.bd/VerifIDExt2/api/CustOnBoarding/VerifyMobileNumber"
        headers = {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0"
        }
        payload = {
            "mobileNo": phone,
            "product_id": "250",
            "requestChannel": "MOB",
            "trackingStatus": 5
        }
        response = requests.post(url, headers=headers, json=payload, verify=False)
        return response.text
