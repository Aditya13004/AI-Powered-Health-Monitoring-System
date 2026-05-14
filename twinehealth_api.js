// TwineHealth (Fitbit Plus) API helper
// NOTE: The OpenAPI spec requires OAuth2 Bearer tokens for all data endpoints.
// Calling from a browser without a token will return 401 Unauthorized.
(function () {
  const BASE_URL = 'https://api.twinehealth.com/pub';
  const DEFAULT_HEADERS = {
    'Accept': 'application/vnd.api+json'
  };

  async function fetchHealthQuestionDefinitions(token) {
    const headers = { ...DEFAULT_HEADERS };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const url = `${BASE_URL}/health_question_definition`;
    try {
      const res = await fetch(url, { method: 'GET', headers });
      const ct = res.headers.get('content-type') || '';
      const body = (ct.includes('json')) ? await res.json() : await res.text();

      if (!res.ok) {
        console.error('TwineHealth API error', { status: res.status, statusText: res.statusText, body });
        throw new Error(`TwineHealth request failed: ${res.status} ${res.statusText}`);
      }

      console.log('TwineHealth response', body);
      return body;
    } catch (err) {
      console.error('TwineHealth network error:', err);
      throw err;
    }
  }

  // Expose to the browser
  window.TwineHealthAPI = {
    fetchHealthQuestionDefinitions
  };
})();
