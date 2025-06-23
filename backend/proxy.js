const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 5000;

// مفتاح OpenRouteService الخاص بك
const ORS_API_KEY = '5b3ce3597851110001cf6248a990a6da4d61e2c1c4b25b0168ca8bc622fa7e2767637e2f67df1483';


app.use(cors());
app.use(express.json());

// نقطة اختبار
app.get("/", (req, res) => {
  res.send("🟢 ORS Proxy Server is Running");
});

// مسار التوجيه
app.post('/route', async (req, res) => {
  try {
    const orsRes = await axios.post(
      'https://api.openrouteservice.org/v2/directions/foot-walking',
      req.body,
      {
        headers: {
          'Authorization': ORS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    res.json(orsRes.data);
  } catch (err) {
    console.error("Proxy error:", err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch route from ORS' });
  }
});

app.listen(PORT, () => {
  console.log(`ORS Proxy running on http://localhost:${PORT}`);
});
app.post('/route', async (req, res) => {
  try {
    console.log("📨 Request received at /route:", req.body); // ← جديد

    const orsRes = await axios.post(
      'https://api.openrouteservice.org/v2/directions/foot-walking',
      req.body,
      {
        headers: {
          'Authorization': ORS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(orsRes.data);
  } catch (err) {
    console.error("❌ Proxy error:", err.response?.data || err.message); // ← طباعة الخطأ
    res.status(500).json({ error: 'Failed to fetch route from ORS' });
  }
});
