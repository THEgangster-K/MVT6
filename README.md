# MVT 6 — Motor Vehicle Theft

An **original, GTA-style** 3D browser driving game. This is not Grand Theft Auto VI, and does not use Rockstar assets, locations, source code, characters, or trademarked visuals.

## Play locally

1. Download and extract the ZIP.
2. Open `index.html` in Chrome, Edge, or Firefox while connected to the internet.
3. Click **Start Exploring**.

If the browser blocks modules opened from a local file, run a local server from the extracted directory:

```bash
python -m http.server 8000
```

Then open http://localhost:8000

The game loads Three.js from jsDelivr. An internet connection is needed for the first load.

## Controls

- W/A/S/D or arrow keys: Drive / walk
- Shift: Boost / sprint
- Space: Brake
- E: Exit / enter car
- F: Start contract at green ring; open upgrades at yellow ring
- C: Switch cameras
- R: Reset car position
- Esc: Pause

## Missions and saves

Drive to the green ring to accept delivery and pursuit missions. Earn cash to upgrade your car at the yellow ring. Progress is stored in your browser's localStorage.

## Publish as a website (GitHub Pages)

1. Go to github.com and create a new **public** repository, e.g. `mvt6`.
2. Click **Add file → Upload files**. Upload **index.html** from this ZIP to the root of your repository (not a nested `mvt6` folder).
3. Commit your files.
4. Go to **Settings → Pages**. Under *Build and deployment*, select **Deploy from a branch**, `main`, and `/ (root)`. Save.
5. Once GitHub Pages deploys, visit `https://YOUR-USERNAME.github.io/mvt6/` (replace `YOUR-USERNAME`).

## Publish on Render (static site)

1. Push `index.html` to a GitHub repository.
2. In Render, choose **New → Static Site** and connect your repository.
3. Use `.` for the publish directory, if prompted. No build command is necessary.
4. Deploy, then open the `onrender.com` URL assigned by Render.

## Notes

This is a playable browser-scale prototype, not a AAA game. It includes a procedural 3D city, traffic, police pursuit, walk / drive controls, timed contracts, upgrades, daylit visuals, a minimap and browser saves.