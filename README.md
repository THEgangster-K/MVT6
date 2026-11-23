# MVT 6 — Motor Vehicle Theft

## Sidewalk, Alley & Mission Overhaul (v0.7)

The new visual layout draws from the supplied screenshots showing an older brick retail alley, textured suburban pavement and an urban street junction. The screenshots are **references only**; no proprietary artwork, buildings or game assets were copied.

- **Pavement spawn:** the protagonist starts on a sidewalk beside the blanket and "Please donate" sign, not in the middle of a traffic lane.
- **Richer roads:** kerbs, colour-accented curbs, pedestrian crossing stripes, tactile ramps and broader sidewalk textures.
- **Walkable cross-block lanes:** mid-block alleyways between lower-width buildings with overhead framework, lamp fixtures and bins.
- **Varied skyline:** low-rise shops, mid-rise flats, warehouse-like blocks and occasional tall towers instead of uniformly massive buildings.
- **Four safer cinematic camera routes:** track through open road corridors and approach the pavement without passing through solid buildings.
- **Mission interactions:** walk up to Rae (a fixed NPC near the first sidewalk) and press F to receive a job; go to the physical parcel, press F to pick it up, find the receiving character and press F to hand it over. Simply touching the old green ring no longer completes jobs.
- **Pedestrians:** roaming NPCs continue to walk around and respond to F interactions, with a dedicated story contact.
- **Character animation:** idle breathing, walking, sprint lean and brief interaction gestures.
- **Performance:** curb pieces, crossing stripes, ramps, rooftops, tree geometry and alley framework are drawn in instanced GPU batches instead of hundreds of individual meshes.

A real-world photorealistic scene like the screenshots would require additional 3D art assets and a larger renderer. This version uses original procedural geometry and materials. Static JavaScript syntax and Render deployment checks do not replace hands-on in-browser testing.

## Street-side prologue and mouse control fix (v0.6)

- The left/right directions have been corrected for the third-person camera in both on-foot and driving modes.
- Click anywhere on the game canvas during gameplay to lock the mouse using the browser Pointer Lock API. Move the mouse to look around; press **Escape** to release the cursor. Click again to re-lock. Keyboard input is suspended while menus or the opening cinematic are active.
- New story openings show the character seated on a roadside blanket, beside a cardboard **"Please donate"** sign and a donation cup. After the cinematic, the character stands up, then free exploration begins. Skipping the cinematic still triggers the stand-up transition.
- The starting mission contact marker has been moved to the next intersection west, away from the character's starting position.
- Existing multiplayer services, cash, upgrades and save-system integration remain in place.

**Important:** Mouse locking is initiated by a direct click on the 3D game view because browsers do not allow automatic pointer capture without user interaction. Actual mouse responsiveness and 3D camera behavior need browser playtesting.


An original 3D open-world browser driving game. This is an independent GTA-style prototype, not GTA 6.

## Controls and world presentation repair (v0.5)

- **Fixed the trapped on-foot start:** the old starting location was inside building collision geometry. Player now starts on an open road at (0, 0).
- **Camera-relative WASD walking:** W/S move in the direction of the camera and A/D strafe; movement slides along walls instead of stopping altogether.
- **Vehicle collision improvements:** a blocked turn no longer always stops forward movement entirely.
- **Keyboard input focus:** account form typing does not accidentally trigger game controls.
- **New actual 3D opening:** four timed camera moves through the playable coastal district, central boulevard and your street-level starting point. All scenes are generated from the existing 3D environment, not 2D title cards.
- **Procedural materials:** concrete, brick-inspired patterning, asphalt, paving, grass and four architectural window/facade looks.
- **Greater architectural variety:** rooftop structures, ventilation ducts, tiered building crowns, shopfronts, awnings and balconies.
- **GPU instancing preserved:** the large amounts of repeated geometry share GPU draw calls to reduce slowdown.

This is still a lightweight original Three.js browser game rather than photorealistic AAA graphics. Source syntax and code consistency were checked; actual FPS and interaction still require browser testing on the target device.

## Street-to-success campaign (v0.4)

**You now begin on foot** in Solara City rather than driving immediately. New saves begin with **$45**, no reputation and no unlocked vehicle. The original intro shows a short cinematic flyover; select **SKIP INTRO** to play right away.

- Walk to the green **street contact** ring near your starting location and press **F** to accept a job.
- First two street jobs can be completed on foot. Completing both unlocks your first parked car. Walk over and press **E** to enter.
- Later missions include fictional underground deliveries and escalating wanted levels. Complete jobs to earn more money and unlock higher social status.
- At the vehicle garage in East Solara, purchase lifestyle upgrades from a room of your own to a tuned garage, crew headquarters and penthouse.
- Progress is stored in browser saves for guests or cloud saves for signed-in accounts when the PostgreSQL database is configured.

**Existing saves:** Previous progress is retained; you will still start on foot. Use **START OVER** on the menu if you want to begin the new $45 campaign from scratch. Resetting is permanent for the current save.

### Performance + presentation update

- The skyline now uses instanced meshes for hundreds of buildings, roofs, windows and trees, significantly reducing draw calls without removing most of the visual skyline detail.
- An original three-scene illustrated loading gallery shows the coastal city, neon downtown and the street-to-success theme.
- Introductory camera shots and chapter captions create an original cinematic opening. These are stylistic rather than copies of any GTA cinematics.
- The runtime still adapts rendering resolution if FPS drops. The actual frame rate depends on your computer and browser.

## City Life + Controls Update (v0.3)

- Third-person follow camera turns with the direction of travel, with drag-to-orbit camera input.
- Faster, more responsive acceleration, braking, and steering; body tilt when cornering.
- On-foot WASD movement, sprinting and articulated walking animation.
- 28 roaming pedestrians; approach on foot and press **F** to talk, hear unique dialogue, and sometimes earn a small reward.
- Procedural streetlights, benches, and improved vehicle mirrors, windows, headlights, grille and plates.
- Adaptive rendering pixel ratio for weak GPUs and fewer building shadow casters.

**Performance note:** Actual FPS varies by device and browser. This release has JavaScript syntax checks and Render deploy checks, but full graphical QA must be done in a real browser.

## Multiplayer release (v0.2)

- Shared online city with up to **32 simultaneous connections per server instance**
- Other players appear as vehicles or on-foot avatars, with floating player labels
- Reconnecting WebSocket clients and a live player counter
- Optional username/password accounts, with password hashes (scrypt) and HTTP-only session cookies
- Cloud progress saved to PostgreSQL **only when DATABASE_URL is configured**
- Guest players can drive together without registration; their cash/upgrades remain in browser storage

**Scope:** Player locations and avatars are synchronized. Missions, vehicle damage, police, money and upgrades are not yet authoritative shared multiplayer systems. This is an early co-presence multiplayer build, not a complete multiplayer MMO. Client-provided saves must not be used as a trusted competitive currency.

## Recommended website: Render Web Service

This project now requires a **Node.js Web Service**, not a Static Site, to run multiplayer.

1. Connect GitHub repo `THEgangster-K/MVT6` in [Render](https://dashboard.render.com/).
2. Select **New → Web Service** and set:
   - Name: `mvt6-online`
   - Branch: `main`
   - Region: Singapore (for Australian players)
   - Runtime: Node
   - Build command: `npm install`
   - Start command: `npm start`
   - Instance: Free (if available)
3. Set `NODE_ENV=production` and a long, random `SESSION_SECRET` under **Environment**.
4. For persistent online accounts, provision a PostgreSQL database and set `DATABASE_URL` to its **internal connection string**. Never publish the connection string or secrets in GitHub.
5. Deploy. The Web Service URL (for example `https://mvt6-online.onrender.com`, **if that name is assigned**) will host both game and real-time server at the same origin. Do not assume the example URL is active until deployment succeeds.
6. Test by opening the Render website on two separate browsers and verifying each sees the other's vehicle.

`render.yaml` is included as an optional Render Blueprint starting point. It declares a free Web Service; `DATABASE_URL` must be provided securely when configuring the Blueprint.

### GitHub Pages

GitHub Pages is static hosting and cannot run the included Node.js backend. For actual multiplayer, **open the Render Web Service URL**, not the GitHub Pages address. The Pages version may show offline/reconnecting.

## Local development

Requires Node.js 20+, and an internet connection for Three.js.

```bash
npm install
npm start
```

Open http://localhost:3000. To test persistent accounts locally, set `DATABASE_URL` to a PostgreSQL connection string. Without it, guest multiplayer still runs but registration/login is unavailable.

## Controls

| Key | Action |
| --- | --- |
| W/A/S/D | Walk / Drive |
| Shift | Sprint / Boost |
| Space | Brake |
| E | Enter / Exit car |
| F | Contract / Garage |
| C | Change camera |
| R | Recover car |
| Escape | Pause |
| Mouse drag | Look around |
| F near an NPC | Talk |
| F near green contact | Start street job |
| Skip Intro | Begin playing immediately |

## Security and infrastructure limitations

- HTTP-only session cookies and scrypt password hashes are implemented, but production rollout needs login rate limiting and operational security review.
- Client-reported movement is bounds/rate limited, not fully authoritative; cheating cannot be ruled out.
- Free Web Services may sleep when idle and may disconnect clients. A single-instance room is assumed.
- PostgreSQL persistence depends on having a database with an appropriate plan and lifecycle.
- Do not use real passwords reused on other websites while this prototype is being tested.
