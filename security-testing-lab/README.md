# My Server Security Lab

A mobile-first, defensive security checker for systems you own or are authorized to test.

## GitHub Pages

1. Create a GitHub repository.
2. Upload all files in this folder.
3. In **Settings → Pages**, choose **Deploy from a branch**.
4. Select `main` and `/ (root)`.
5. Open the generated Pages URL.
6. On Android Chrome, use **Add to Home screen / Install app**.

## Important browser limitation

The dashboard is client-side. A target server must allow the browser to read its response through CORS. If it does not, the browser cannot inspect the response.

For a server-side check without requiring your Android phone to run a terminal, use the included GitHub Actions workflow. Configure your own authorized target in the repository variable `AUTHORIZED_TARGET`, then run the workflow manually.

This project intentionally does NOT implement:
- password guessing
- credential theft
- malware
- destructive exploitation
- port scanning
- bypassing authentication
- scanning arbitrary third-party targets

Only test infrastructure you own or have explicit permission to test.
