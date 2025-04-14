const axios = require('axios');

module.exports = async (req, res) => {
  const { phone } = req.query;

  const url = "https://ezybank.dhakabank.com.bd/VerifIDExt2/api/CustOnBoarding/VerifyMobileNumber";

  try {
    const data = {
      AccessToken: "",
      TrackingNo: "",
      mobileNo: phone,
      otpSms: "",
      product_id: "250",
      requestChannel: "MOB",
      trackingStatus: 5
    };

    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0',
      },
      httpsAgent: new (require('https').Agent)({
        rejectUnauthorized: false,
      }),
    });

    res.send(response.data);
  } catch (error) {
    res.send(error.message);
  }
};
