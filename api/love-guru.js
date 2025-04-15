let otpCount = 0;

export default async function handler(req, res) {
  const { phone, limit = 5 } = req.query;

  if (!phone || phone.length !== 11) {
    return res.status(400).json({ error: "দয়া করে সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন।" });
  }

  const fullPhoneNumber = "88" + phone;

  if (otpCount >= parseInt(limit)) {
    return res.status(429).json({ error: "OTP সীমা অতিক্রম করেছে!" });
  }

  const apiUrl = "http://api.ads.army/otp/sendOTP";
  const data = {
    app: "loveapps",
    msisdn: fullPhoneNumber,
    aditionalData: [
      { network: "1001", clickid: "880196110478746076", campaignid: "8837158" },
    ],
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Accept: "*/*",
        Origin: "http://loveapps.bd.gd",
        Referer: "http://loveapps.bd.gd/",
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 11; helio 30 Build/RP1A.200720.011) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.39 Mobile Safari/537.36",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const result = await response.json();
    otpCount++;

    return res.status(200).json({
      message: `OTP পাঠানো হয়েছে! মোট পাঠানো হয়েছে: ${otpCount}`,
      data: result,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "কিছু সমস্যা হয়েছে!" });
  }
}
