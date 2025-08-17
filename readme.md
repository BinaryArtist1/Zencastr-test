# Kaodis & Zencastr App

This repo contains two small projects:

- **Kaodis** -> a simple Redis-like cache server that runs locally and exposes a HTTP API.
- **Zencastr App** -> a small Express.js app that uses Kaodis (through a mini client SDK library) and shows how you can interact with it via a browser or JSON API.

I kept them in one repo just to make it easier to install and run, but in real life these would live in two separate repos.

## Demo Video



https://github.com/user-attachments/assets/99c66ff1-2fc7-45b1-914a-2043c59961bc



## How it’s structured

```
repo/
- kaodis/            # the cache server
- zencastr-app/      # the express demo app (includes kaodis-client)
  - src
    - kaodis-client  # the client SDK for accessing kaodis server
```

## Getting started

### 1. Node version

You'll need Node **20.x**.
The projects are built and tested on 20.11.1

### 2. Run Kaodis (the cache server)

Open one terminal:

```bash
cd kaodis
npm install
npm run dev
```

You should see:

```
Kaodis running on http://127.0.0.1:7379
Persisting to ./cache.json
```

### 3. Run the demo app

Open another terminal:

```bash
cd zencastr-app
npm install
npm run dev
```

You should see:

```
Zencastr app running on http://127.0.0.1:3000
```

Now open [http://127.0.0.1:3000](http://127.0.0.1:3000) in your browser.

## What you can do

### From the browser

- Use the form to **set a key/value**
- View all stored keys
- Each key has actions:

  - **Get** -> opens the value in a new tab
  - **Delete** -> removes the key
  - **Kaodis direct API** -> hits the cache server directly

## Notes

- Kaodis saves everything into a JSON file (`KAODIS_FILE`) so your data sticks around after restarts. (Persisting)
- If Kaodis isn't running, the Zencastr App will show **"error connecting Kaodis"**.
- This is a simple demo - no advanced features like TTL or eviction. The focus is clarity and separation of concerns.

## Future improvements

- Add TTLs and eviction policies (LRU, LFU)
- Publish `kaodis-client` as its own npm package
- Add more tests and benchmarking
- Package into Docker images for easy deployment
