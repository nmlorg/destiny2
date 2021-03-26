// If you are accessing this site as https://localhost:4443/, the default credentials should work.
// To access via any other URL (for development or in production):
//   1. Load the URL in your browser, open a JS console, and note the value of `location.origin`.
//   2. Go to https://www.bungie.net/ and ensure you are logged in.
//   3. Go to https://www.bungie.net/en/Application and select or create an app.
//   4. Ensure the app is configured as:
//       - APP AUTHENTICATION
//           - OAuth Client Type:  `Public`
//           - Redirect URL:  (the URL loaded in step 1)
//       - BROWSER BASED APPS
//           - Origin Header:  (the value of `location.origin` from step 1)
//   5. Add or choose an API Key.
//   6. Add your `OAuth client_id` and `API Key` below.

let CLIENT_ID = 0;
let API_KEY = '';

let ORIGINS = {
    'https://localhost:4443': [11071, '1b4b7bbc6e5449f9b22880f5f0880e9d'],
    'https://nmlorg.github.io': [11060, 'fc29e10e0d1349d3a74feaf53b11cbf6'],
};

if (ORIGINS[location.origin])
  [CLIENT_ID, API_KEY] = ORIGINS[location.origin];
