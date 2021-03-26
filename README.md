To use this library:

1. Go to https://www.bungie.net/ and ensure you are logged in.
2. Go to https://www.bungie.net/en/Application and select or create an app.
3. Ensure the app is configured as:
    - APP AUTHENTICATION
        - OAuth Client Type:
            `Public`
        - Redirect URL:
            `https://localhost:4443/` (or your public-facing URL)
        - Scope:
            ☑ `Read your Destiny 2 information ...`
            ☑ `Move or equip ...`
    - BROWSER BASED APPS
        - Origin Header:
            `https://localhost:4443` (or the prefix of your public-facing URL)
4. Add or choose an API Key.
5. Using `API Key` and `OAuth client_id`, create a file called `apikey.js` of the structure:
    ```js
    let API_KEY = '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d';
    let CLIENT_ID = 12345;
    ```
