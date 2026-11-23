# MVT 6 — Motor Vehicle Theft

An original 3D open-world browser driving game. This is an independent GTA-style prototype, not GTA 6.

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
