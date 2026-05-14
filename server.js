import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const OAUTH_URL = 'https://api.twinehealth.com/pub/oauth/token';

// Exchange client credentials for an OAuth2 access token
app.post('/api/twinehealth/token', async (req, res) => {
  const clientId = process.env.TWINEHEALTH_CLIENT_ID;
  const clientSecret = process.env.TWINEHEALTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'Server not configured: set TWINEHEALTH_CLIENT_ID and TWINEHEALTH_CLIENT_SECRET env vars.' });
  }

  try {
    const resp = await axios.post(
      OAUTH_URL,
      {
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      },
      {
        headers: {
          Accept: 'application/vnd.api+json',
          'Content-Type': 'application/json',
        },
        validateStatus: () => true, // forward upstream status
      }
    );

    res.status(resp.status).json(resp.data);
  } catch (e) {
    console.error('OAuth proxy error', e?.response?.status || e.message);
    res.status(502).json({ error: 'Upstream error contacting TwineHealth.' });
  }
});

app.listen(PORT, () => {
  console.log(`TwineHealth proxy listening on http://localhost:${PORT}`);
});
