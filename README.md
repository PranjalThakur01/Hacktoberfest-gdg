# ScreenMind

A polished, responsive frontend for a private screen memory app. It brings ScreenMind's local-first timeline, focus insights, saved collections, and natural-language recall into an immersive dark interface inspired by the motion-led visual language of Mohit Virli's portfolio.

## Run it

Open `http://localhost:4173` while the local server is running. There are no build tools or dependencies. Start the server from this folder with `python3 -m http.server 4173`.

## Prototype interactions

- Ask a question or choose a prompt to open a local-memory answer preview.
- Save and unsave recent moments.
- Navigate the Overview, Timeline, Search, and Insights screens.
- Filter saved moments and keep them across reloads with browser storage.
- Search and ask questions against the included sample history.
- Use `⌘ K` / `Ctrl K` to open memory search.

The screen history, metrics, and answers use included sample data. This frontend does not capture screens or connect to a local AI model yet; those require a native capture service and model runtime.
