// server/server.js ফাইলের CORS অংশটি এমন করুন
const cors = require('cors');

// ... অন্যান্য কোড ...

app.use(cors({
  origin: '*', // সব ডোমেইন থেকে রিকোয়েস্ট গ্রহণ করবে
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// OPTIONS রিকোয়েস্ট হ্যান্ডেল করা (Preflight request)
app.options('*', cors());
