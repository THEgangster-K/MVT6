# MVT 6 — Motor Vehicle Theft

## v0.4.0 — CINEMATIC OVERHAUL (Preview 10)

- Self-contained widescreen illustrated cover, irregular panels, no scene captions, and working menu controls.
- Refined vehicle materials, lighting, character joints and locomotion, chapter recaps, opening fades and local venue guide.
- Static menu and hidden-tab render suspension, stable FPS timing on resume, fewer repeated HUD DOM changes, and time-based remote actor interpolation.
- Existing save schema and campaign retained. Package metadata now matches the 0.4.0 release series.

**Validation:** Automated regression assertions in an adapted JavaScript harness. Actual browser rendering, multiplayer sessions, performance measurements and deployment verification remain outstanding; this is a release candidate, not a fully verified production release.

## v3.1 — POSTCARDS

- Original eight-panel Solara City illustrated SVG cover with Jawson, Luxie, city scenes, waterfront and Sunset Coupe. Vibrant coastal palette and comic-panel layout, with MVT 6's own logo and typography. Used in the final intro reveal and main menu.
- Preserves the Kang Dynasty Studios fade, six live cinematic shots, Skip Intro and reduced-motion support.
- Four optional personal activities across existing story landmarks: two for Jawson and two for Luxie, with independent rewards and saved completion. Press K to mark the next personal activity and F to interact on foot.
- Improved home interiors with wall prints, bedside lights and books; closer indoor camera and roof cutaway when inside.
- Existing saves, characters, city layout and progression retained.
- 3,111 assertions passed in the strict adapted regression environment, including cover structure, route, personal activity payouts and existing intro tests.

**Scope:** Original vector illustration rather than copied GTA artwork or photorealistic gameplay. No major district expansion or new character rigs in this release. Actual browser appearance, gameplay, account persistence and FPS remain unverified.


## v3.0 — HORIZON

- Five original Jawson and Luxie exhibition story stops across the five city districts, with new conversations, ordered landmark interactions, minimap markers and persistent completion rewards. Press B to mark the next site; F on foot to interact. Actual sites use checked open positions; unavailable placements are skipped.
- Distinct landmark sculptures, subtle road/pavement/grass surface relief, warmer lighting, night facade glow and higher cinematic shadow resolution. Performance mode disables the added surface bump maps.
- Coastal and rain ambience using original synthesized sound; friendly interaction gestures for both animated character rigs.
- Previous eight-chapter campaign, property themes, vehicle collection, character selection and save fields retained.
- 3,080 assertions passed in the strict adapted regression environment. All five sites fit the generated building and alley plans in the placement simulation.

**Scope:** This is an incremental visual and content upgrade, not a new rendering engine. The original campaign stages and main road grid remain unchanged. Actual landmark placement against all runtime scenery, visual quality, browser playability, account persistence and FPS have not been verified.


## v2.9 — SHOWROOM

- Vehicle collection available through the pause menu between jobs or the marked showroom frontage near Solara Customs. Five original models with purchasable ownership and free switching between owned vehicles. The selected model changes the existing player car's body, glazing, roof and pillars, retaining its upgrades and collision system.
- Owned properties offer coastal blue, modern charcoal and warm terracotta furnishing themes; furniture, wood and rug colours update independently by home.
- Clear, overcast and rainy game-time weather cycles, with lighting, fog, wet-road material appearance and a bounded batched rain effect. Reduced motion disables rain streaks; performance mode reduces their count.
- Existing money, chapters, properties, characters and account progress retained; new ownership and appearance fields validated in account saves.
- 3,038 assertions passed in the strict adapted regression environment.

**Scope:** The collection uses one active vehicle at a time with shared performance upgrades; showroom is a menu and street frontage rather than a full walk-in dealership. Furnishings change materials rather than furniture layouts. Weather is visual only. No additional campaign missions or character animations included. Interactive rendering, browser gameplay, account persistence and FPS have not been verified.


## v2.8 — HOMESTEAD

- Three fictional purchasable properties: Harbour Studio ($550), Garden Apartment ($1,200), and Solara Loft ($2,400). Walk-in rooms include furniture, lighting, signage and collision footprints; locations are subject to existing scenery clearance checks.
- Press F near a home, confirm the in-game purchase, and retain shared ownership in local and account saves. HUD ownership count and gold/green minimap markers distinguish available and owned homes.
- Residents now alternate between resting, walking and browsing on staggered game-time schedules, retaining existing sidewalk routes and distance-based rendering.
- Chapter briefings display Jawson and Luxie's dialogue as separate animated speaker cards, respecting reduced-motion preferences.
- Cosmetic damped vehicle pitch and roll replace the previous interpolation; the driving and collision model remains unchanged.
- 3,004 assertions passed in the strict adapted regression environment.

**Scope:** No new campaign mission stages, full physical suspension, separate NPC destination pathfinding, or complete interior camera system. Actual property placement, interactive browser visuals, account persistence and FPS remain unverified.


## v2.7 — AVENUES

- 52 curved secondary lanes replace straight alley strips within the existing reserved corridors. The minimap follows their new curves and tree placement avoids the reserved envelopes.
- Six original traffic body/cabin profiles: sedan, taxi, utility, compact, wagon and coupe. Traffic is distributed across more of the main street network.
- More varied park venues, including garden cafés, harbour archives, information kiosks and community gardens, with distinct roof colours and local activities. Purple minimap markers identify nearby venue activities.
- Jawson and Luxie can independently complete venue assistance interactions once per location, with $45 and $60 rewards respectively. Completion records persist locally and in account progress.
- Existing main road grid, mission locations, character switching, progression and vehicle mechanics retained.

**Verification:** 2,861 assertions passed in the strict adapted regression environment, including lane-envelope checks and vehicle profile validation. Browser graphics, navigability of individual alleys, account persistence and FPS remain unverified. The secondary lanes do not reroute NPC traffic; no full road-network overhaul or new professional vehicle assets are included.


## v2.6 — DUAL PATHS

- Play as Jawson or Luxie, switch with V on foot between jobs, or use the pause-menu character switch.
- Separate original animated Luxie glTF variant with distinctive clothing and hair; each character has a fallback and matching stylised seated car occupant.
- The inactive protagonist becomes the story contact. The original Jawson prologue is retained.
- Jawson receives a 10% courier chapter bonus; Luxie receives $45 instead of $35 for first-time shop help. Character chapter counts and active lead persist locally and in account progress.
- Existing campaign, mission stages, road network, city scenery and vehicle mechanics retained.
- 1,792 assertions passed in the adapted strict test environment. Interactive browser rendering, account persistence and FPS have not been verified.

**Scope:** Switching changes the active character at the current location; there is no separate playable character location simulation. Luxie shares Jawson's rig and animations with a different appearance. New road layouts and vehicle assets are not included.


## v2.5 — CROSSWINDS

- Jawson is the playable lead and Luxie is the recurring co-lead and story contact. Eight chapter briefings and completion lines follow their original workshop and harbour mystery. The opening introduces both characters with dedicated shots.
- The original articulated player asset now uses its own seated and standing joint poses instead of intentionally swapping to the old model during the prologue. The procedural fallback remains available if the asset fails to load.
- Palm fronds and broadleaf tree canopies react to nearby movement with a brief recoverable rattle, using the existing instanced geometry. No full structural destruction simulation.
- Existing mission stages, rewards, save format, road grid, graphics profiles and prior releases are preserved.
- 1,778 assertions passed in the strict adapted test environment, including model joint references, pose interpolation, story dialogue and foliage matrix restoration.

**Scope:** Luxie is an NPC co-lead, not a second playable character. The existing mission mechanics remain; browser visual quality and FPS are not measured. No violent passenger-ejection animation, professional vehicle assets or new road network included.


## v2.4 — STREETSCAPE

- Original jointed seated characters in civilian traffic, police vehicles and the player's car, with facial details, hair, clothing, hands and footwear.
- Transparent close-range glazing, cabin seats, headrests and console. Shared character meshes and materials, distance-based occupant detail and opaque distant glazing limit rendering cost.
- NPCs who leave vehicles retain their matching character appearance and transition to ordinary standing and walking poses.
- Public venues feature room walls, windows, shelves, practical lighting and improved chairs, with static footprint collision checks.
- Minimap displays the existing irregular parcel alley routes.
- Main road grid, original character asset, saves, missions and previous intro are retained.

**Verification:** 1,749 assertions passed in the strict adapted regression environment, including occupant construction and detail switching. Actual browser visuals and FPS remain unverified. No violent ejection animation, new full road network or professional vehicle assets are included.


## v2.3 — PREMIERE

- Kang Dynasty Studios Presents fades in from black, holds, then fades back to black over 3.5 seconds.
- Replaces the flat illustrated title cards with six live in-engine shots, including coastal, downtown, street, plaza, night and skyline views. Camera motion, restrained cuts, location captions, changing lighting and a stronger original logo reveal replace the old artwork.
- Skip Intro and reduced-motion mode retained. Intro audio is optional and user-activated, using original synthesized tones.
- Title waits for the first successfully rendered frame. Errors during startup or the title cancel pending transitions and display retry.
- Added close-range vehicle plate and running light details; corrected rear exhaust orientation.
- Prior city, character, driving, progression, audio and multiplayer systems retained. Main road network unchanged.

**Verification:** 1,501 strict adapted regression assertions passed, including simulated title lifecycle, six camera shots, startup error handling and previous geometry crash. Browser rendering, audio and frame rates remain unverified.


## v2.2 — DYNASTY

- New Kang Dynasty Studios title branding.
- Hybrid opening: studio splash, the three original City Life illustrations restored directly from v1.9, three live rendered Solara City camera shots, and the MVT 6 logo reveal. Includes a skip button and reduced-motion alternative.
- Optional synthesized ambient sound and speed-responsive engine audio start after a user gesture, with a persistent Sound toggle in the pause menu.
- Waterfront uses a slowly moving original wave texture and animated shoreline accents.
- Retains the v2.1 city, original articulated character, collision mechanics, saves and prior startup fixes.
- Regression suite exercises the title sequence with simulated timers, skip and reduced-motion behavior, and the previous pier construction crash. 1,474 assertions passed in the strict adapted test environment.

**Scope:** Interactive browser rendering, audio and FPS have not been measured; no new professionally authored vehicle asset or road-network redesign is included.


## v2.1 — CROSSROADS

- Replace uniform district building rows with irregular, mixed-use parcels. Each of the five districts has a weighted mixture of building categories; 158 planned structures, variable gaps, offset through-alleys and varied lot counts are generated across the 64 blocks.
- Add open-air café, information and market venues in clear public spaces, with interiors, furniture, signage and interaction prompts.
- Replace the illustrated startup montage with three real-time rendered views of the existing game world. The story introduction also has revised camera shots and shorter pacing. Reduced-motion users skip the moving title montage.
- Add an original, locally hosted articulated glTF character (8,784 triangles, 44 mesh parts, four animation clips), enabled during ordinary gameplay, with the previous character kept for special story poses and loading failures.
- Add an inexpensive contact-shadow texture, static sky-derived reflections, and optional dynamic directional shadows in Cinematic mode.
- Add non-graphic arcade vehicle contact checks, overlap separation, recoil, brief traffic stopping, impact particles and condition changes. Static building and parked-car contacts use the world footprint collision system.
- Preserve the main road network, missions, saved progression, workshop and multiplayer interfaces.

**Scope:** The character is an original stylised articulated model, not a photorealistic professionally skinned model. Shadows in Cinematic mode may reduce FPS. Contacts are simplified arcade gameplay, not a full rigid-body simulation. Public venues are open-sided rather than full enterable buildings. Native browser rendering, asset appearance and measured FPS have not been verified.


## v2.0 — BOULEVARDS

- Reworked West Haven coastline: separate water and land, beach strip, boardwalk segments, railings and an offshore pier landmark. Main roads end at the map edge and crossing markings sit near the road surface.
- Expanded moving traffic from 18 to 24 vehicles, with taxi, utility, compact and sedan silhouettes. NPC traffic follows timed junction signals and slows for same-lane queues and the player.
- Added distance culling and reduced distant wheel animation to limit rendering costs.
- Updated the minimap shoreline and visible release marker.
- Existing road grid, jobs, saves and City Life districts are preserved. The pier is a scenic landmark outside the playable boundary. Vehicles still use original procedural assets; vehicle acquisition retains the existing player vehicle model.
- Regression suite passed in-memory (748 assertions). Interactive browser performance and gameplay have not been measured.


## v1.9 — CITY LIFE | District & World Overhaul

- Remove the freestanding spawn brick facade and reserve a whole city block for an open public plaza with a fountain, paths, gardens and seating.
- Replace repetitive parcels with 64 district-aware block plans: residential houses with pitched roofs, coastal hotels, commercial markets, downtown towers and apartments, industrial warehouses, parks and parking areas.
- Add raised landscaped beds, coastal walkways, distinct signage, marked parking spaces and parked vehicle scenery; use GPU instancing for repeated geometry.
- Public spaces attract local residents. Pedestrians follow sidewalk axes and avoid building footprints and road lanes during ordinary walking.
- Update the minimap and district labels to reflect the new parcel plans. Preserve the existing main road grid, job coordinates, progression, accounts, workshop and Afterglow presentation.
- New regression checks cover every block plan, parcel overlaps, road clearance, spawn reservation and district diversity.

**Scope:** Road elevations remain flat to preserve compatibility with driving and mission systems. Terrain relief is landscaped scenery. Vehicles and people still use the existing original procedural models; no professional rigged assets are bundled. Runtime and FPS require interactive browser testing.


## v1.8 — AFTERGLOW | Presentation & Driving

### Release presentation
- Original MVT 6 wordmark, restrained black-to-artwork-to-title introduction with a reduced-motion alternative, and a new main menu over the live 3D city.
- Restyled HUD, pause menu, minimap, phone and key controls; a visible AFTERGLOW V1.8 release marker.
- Retains existing gameplay and saves. The artwork is the game's original illustrated material, re-edited into a different sequence.

### Environment and cars
- Brighter coastal daylight, revised surface palette, clearer distance visibility, custom curved palm frond geometry rendered with instancing.
- Tapered original car body mesh with shared geometry, sloping integrated cabin glazing and refreshed roof silhouette. Existing lights, wheel animation and customisation hooks retained.
- Street furniture checks the horizontal footprint against both road axes; old floating barriers, arbitrary kiosk blocks and loose alley-bin clutter removed. Transit stops repositioned; legacy secondary street furniture is also checked.
- Wheel rim customisation now finds nested wheel meshes. The exit interaction selects open nearby space, and the camera retracts when its target overlaps a building footprint.

### Arcade handling
- The previous sideways position offset is replaced with a persistent game-only slide state. Heading and travel direction differ during the slide and converge smoothly when it ends.
- The movement vector uses the existing collision checks. Camera response and smoke indication follow the actual sliding state.
- Keep existing keyboard controls and adaptive graphics quality.

### Quality gate
New regression coverage includes sustained slide and recovery, ordinary forward/reverse movement, road footprint clearance, integration and startup compatibility. No native browser playtest or measured Surface Pro FPS is claimed. The release remains a stylised procedural browser game, with original custom meshes; it does not ship professionally authored rigged GLB characters or licensed vehicle models.


## v1.7 — Character Model Pipeline and Updated Hero Silhouette

- Added a **local GLB/glTF animation pipeline** for an optional original, licensed player character. A rigged model with Idle and Walk animations can replace the built-in player by editing `models/manifest.json`.
- The loader validates model paths and animation clips, normalises model height, crossfades between Idle, Walk, Run and Jump (where supplied), and safely falls back to the existing player if loading fails.
- The game server now serves only explicitly allowed model asset files under `models/`; unrelated files remain inaccessible.
- The **built-in player also looks less blocky**, using rounded sleeves, hands, legs and footwear instead of rectangular limb boxes.
- Normal game loading, multiplayer, save data, police, vehicle physics and existing procedural NPCs are unchanged.
- The default manifest leaves player assets disabled until an original rigged model is supplied. **This release does not bundle a photorealistic model** or claim GTA 6 graphical quality.

See `models/README.md` for asset format, model scale and licensing instructions.

**Validation:** Syntax and integration assertions pass. A complete Node runtime test and live browser/FPS test were unavailable from this session; actual model loading has not yet been exercised with a rigged GLB.


## v1.6 — Motion Polish & Responsive Chase Camera

- Walking and sprinting animation weights now blend smoothly rather than snapping between idle and moving poses. Character gait uses a continuous phase with subtle shoulder/torso motion and eased head tracking.
- Jumping, landing, standing, gesture and vehicle-entry pose controls remain part of the existing animation system.
- The chase camera adds moderate speed-dependent field of view and looks slightly ahead while driving, making corners more readable. Camera settings gradually recover when stopping or leaving the vehicle.
- Projection updates are skipped for very small changes to avoid unnecessary per-frame camera matrix work.
- The adaptive graphics presets, road traffic, police, missions, accounts and saves remain unchanged.

**Testing:** JavaScript syntax and structural regression checks were performed. Gameplay feel, framerate and browser-specific behavior still require hands-on validation; this update does not introduce external 3D assets.


## v1.5 — Patrol & Jail, Drifting, Distinct Shops, Pedestrian Reactions, Smoother Rendering

### Police and consequences
- Replaced the old direct-to-player police movement (which caused cars to orbit the player) with turning-limited, road-aware pursuit. Cars approach, slow and can stop to arrest a wanted player.
- Arrest triggers a short non-graphic cinematic and a Solara Central holding screen. Bail is **$175 per wanted star**, calculated on the arrested wanted level (1–5). If there is enough saved in-game cash, pay bail to return to the street; otherwise the jail screen requires a clear **Start a New Story** action. A new story resets chapter progress, gear, customisations and the vehicle.
- Wanted stars still decay when not pursued. Existing campaign and persistent account progress remain.

### Vehicles and NPC interactions
- **Shift while turning at speed** now activates arcade drifting with sideways movement, reduced traction and procedural tyre smoke. Shift still sprints on foot; Space brakes in a car.
- A small shared, pooled VFX system creates smoke, dust and arcade collision effects with a fixed particle budget to limit draw calls.
- Pedestrians have a visibly rounded torso, head, face, hands and shoes and have contextual walking, conversation, dodge and brief stumble animations.
- Non-graphic vehicle/pedestrian contacts trigger a stumble/retreat, reduced vehicle speed, vehicle wear and higher police attention. No injuries, deaths, or graphic collisions are depicted.

### Environmental improvements
- Removed the arbitrary street-furniture spawn list that placed table/chair/umbrella sets on roads. Café patios are now generated only for café/deli/bakery storefronts where there is a sidewalk.
- Shops receive individual details: retail displays and product shelves; cafés have outdoor seating, cups and canopies; services have different furnishings.
- Existing varied buildings, streetlamps, kiosks, transport shelters and Solara Customs remain in the city.

### Performance and compatibility
- HUD updates are throttled to 10 Hz and circular minimap redraws to about 10 Hz, while 3D gameplay is still rendered on animation frames. Distant shop details stay culled.
- Workshop animation no longer repeatedly scans the entire shop group for lift rigs. Visual effects are pooled.
- **Important:** The earlier code inadvertently removed a shared VFX function during a pedestrian collision change, which could cause a JavaScript error. Those VFX functions have been restored.
- The game remains a procedural Three.js browser game; high-end realism requires professionally modeled assets. Code checks and deployment are not substitutes for an interactive browser test.


## v1.4 — Cinematic Streets, Living Workshop & Driving Systems

This update expands the existing original browser game, preserving the online multiplayer client, accounts, campaign, mission phone, navigation, vehicle tuning and saved progress.

### Graphics and environment
- **Solara Customs visual rebuild** inspired by the previously shown cinematic workshop reference: procedural multi-layer tile, diamond-plate metal, rubber, wall-panel textures; transparent workshop glazing; garage service bays, tool cabinets, tire racks, overhead LED strips, lift machinery and warm/cool practical lighting.
- **Workshop animations:** operating lift beams, subtle tool movement, Nico's head/body/arm motion and animated signage. Lighting and workshop detail are distance-culled to limit GPU usage.
- **Refined cars:** clearcoat paint with metalness and smooth highlights, animated wheel spokes and steering, illuminated brake lights and indicators.
- **Richer city:** bus shelters, shopfront public-transport signs, streetlight poles, small kiosks, benches, bollards and bins, instanced where practical.
- **Atmosphere toggle:** press **N** to cycle daylight, golden hour and Solara Nights. Time-of-day presentation changes sky colour, fog, sun and ambient lighting. This is an arcade lighting preset, not a full physically based weather renderer.
- **Quality settings:** Pause → Graphics Quality: Performance, Balanced or Cinematic. Cinematic increases render resolution; Performance lowers it and disables extra workshop point lights. Use Performance on low-powered laptops if FPS drops.

### New gameplay and animation
- **Traffic and pedestrians:** pedestrians respond to approaching vehicles by turning and moving clear; the car's arcade braking assist slows close encounters. This is a non-graphic safety mechanic, not an injury simulation.
- **Driving controls:** **J** uses the horn, **L** toggles headlights. The car animates its wheels, body lean, indicators and brake lights.
- **Vehicle condition:** collisions with buildings or vehicles reduce bodywork condition; severe damage limits maximum driving speed. In Solara Customs, a repair service restores condition for an in-game fee. A detailing service refreshes paint appearance.
- **World interactions:** pedestrian conversation gestures, traffic responses, existing collectible equipment, missions, street art, and vehicle takeovers remain.
- **Controls retained:** WASD walk/drive, Space jump/brake, E enter/exit, F interact, Q gadget wheel, P mission phone and Tab tutorial.

### Verification and limits
- JavaScript parser checks and a scan for duplicate or missing UI IDs were completed.
- A successful deployment does not establish that the graphics look photorealistic or that every animation, input action or FPS level is correct. Full browser playtesting is still needed.
- This is an original Three.js game. Photorealistic AAA visual fidelity would require custom professionally created 3D meshes, animation rigs, textures and considerably more GPU performance.


## v1.3 — Solara Customs, Jump Fix and Chapter Story

### Mission briefings and story conversations

Talk to Rae and press **F** to open a chapter briefing with the chapter title, character dialogue, a three-step objective list, reward, time limit, and **Accept / Not Now** choices. Accepting tracks the next destination automatically. Nico can be spoken to on foot near Solara Customs. The mechanic workshop interaction lets you customise a stationary car; chapter 3's delivery handoff takes priority when it is active.


- **Jump repaired:** Space is captured at the document level during gameplay, with an immediate visible hop, a gravity arc and landing animation. The game suppresses browser scrolling on Space. A dedicated **JUMP** touch button appears for coarse-pointer touchscreen users while on foot. Space remains brake when driving.
- **Solara Customs:** The old pause menu no longer offers instant vehicle upgrades. Drive east to the physical garage at (184, 0) and stop in its service bay, then press **F** to open the workshop. The building includes large signage, structural pillars, lifts and repair details plus mechanic Nico.
- **Performance and customisation:** Keep the existing engine, handling and nitro upgrade purchases. Add a paint tab with eight finishes and options for a spoiler, LED underglow and alloy rims. Vehicle customisation is stored locally under `mvt6-customs`, while regular progress continues using existing save mechanisms. Fresh resets clear customisations.
- **Storyline:** Eight chapters remain an original fictional Solara City storyline with Rae, Nico and Vega. Each chapter now opens with a cinematic dialogue banner, sets a map waypoint automatically, and shows distance to the next objective on the HUD. Chapter success/failure messaging has been clarified. The gameplay still mixes pickups, vehicle deliveries, terminal puzzles, races, scouting and pursuit escapes.
- **Lifestyle progression:** Housing and crew-status upgrades remain available from the mission phone rather than being tied to the vehicle garage.
- **Controls:** **WASD** move, **Space** jump on foot/brake in vehicle, **E** get in/out, **F** interact/enter workshop, **P** phone, **Q** equipment wheel, **Tab** tutorial.
- **Verification:** JavaScript syntax and UI ID checks were run before updating GitHub. A successful Render deployment does not itself verify gameplay FPS, physics or input responsiveness; test with a browser before treating them as proven.


## v1.2 — Collectible Equipment, Jumping and Cinematic HUD

- **Pickup-driven eight-slot equipment wheel:** Press **Q** to view the wheel. The Hands slot is equipped by default, while the other seven slots are visibly empty. Find glowing collectible gear placed along accessible sidewalks and press **F** to pick it up. Collected equipment fills its matching wheel slot. Trying to select an empty slot displays a pickup reminder instead of equipping an unavailable item.
- **Equipment persistence:** Collected gadgets save in the browser's local storage (key `mvt6-gear-v2`) separately from multiplayer account progress. Gear is **not yet synchronised to the cloud**. Current collectible gadget types are signal tagger, loot scanner, flash distraction, repair kit, route beacon, city camera, and emergency radio.
- **New jump:** Press **Space** while walking to jump. The character has a gravity-based jump arc, midair arm and leg poses, a short landing bend and safe reset on vehicle entry. Space remains the brake key when driving.
- **Cleaner interface:** Updated gradient glass-style status, mission and notification panels, a larger eight-direction radial wheel, contextual pickup instructions, active gadget indicator and collectible markers on the circular minimap. Fixed pointer-event handling so the tutorial, mission phone and equipment buttons can be clicked.
- **Genre rather than imitation:** The cinematic presentation is an original MVT 6 open-world visual style, not a reproduction of GTA 6's protected artwork, characters, UI or storyline.

**Testing note:** JavaScript parsing and Render build checks were performed; the updated game still needs an interactive in-browser QA pass to verify movement, jumps, equipment collection and FPS.


## v1.1 — Takeover Stability & Clean HUD

**Vehicle freeze fix:** Replaced the takeover animation state with a short, bounded transition that always returns controls to driving mode. Added safe checks for the exiting driver's animation parts and resets for the camera, player car, movement input and takeover state. An animation exception is caught to allow a safe transition to finish.

**Tutorial:** The old stack of keyboard instructions is removed from the bottom of the screen. A new full-screen, dismissible guide explains walking, camera, driving, story interaction, phone, maps and gadgets. It appears after the first opening unless the player opts out, and can be reopened with **Tab**, **H**, or **? CONTROLS**.

**Radial equipment wheel:** Use **Q** or the **GADGETS** HUD button and select Hands, Signal Tagger, Loot Scanner, or Flash Distraction. The non-graphic equipment has progression unlocks. Press **G** to activate the selected item on foot. Hands instead use **F** for regular interactions.

**Improved circular minimap:** A slightly larger readable round map follows the player, rotates with heading, shows bearings and major points of interest, reduces clutter to nearby markers, and draws a dotted route to the current mission. The mission phone can set navigation pins for contacts, garage and loot.

The code has passed JavaScript parsing and the UI ID/reference checks. Render deployment can be confirmed in the service dashboard. Full movement, visuals and responsiveness still need a hands-on browser test.


## v1.0 — Street Controls, Mission Phone & Navigation

- **Corrected A/D walking** using the actual handedness of the third-person camera: A moves left and D moves right. Mouse look remains pointer-locked when clicking the game scene.
- **Starting scene anchored to a real building:** removed the former isolated floating wall and replaced it with brick storefront detail attached to the collision-side facade. The character starts seated beside the building and stands before exploration.
- **Story phone:** press **P** or the on-screen PHONE button. View the active mission, next objective, eight chapter cards, completion progress, contacts and navigation pins. Phone clock displays local device time.
- **Rotating circular minimap:** centred on the player or car, turns with camera/car bearing, displays degrees and compass directions. Marker types show story objectives, contacts, shops, loot, player car and police. Select waypoints to Rae, garage, nearest loot or current objective using the phone.
- **Richer models and materials:** procedural surface patterns are shaded with tonal gradients; the protagonist has a rounded torso; vehicle bodies and cabin roofs use bevelled extruded shapes rather than plain boxes. Building opacity remains solid.
- **Non-graphic arcade rival encounters:** patrol guards chase at higher heat. After two missions, **G** on foot temporarily disables the nearest patrol signal. If tagged by patrol, the player respawns at a street checkpoint with a small in-game cash penalty. No lethal weapons or explicit violence.
- **Preserved:** online multiplayer sync, account login and save system, traffic, original campaign and existing NPCs.
- **Verification:** JavaScript syntax and referenced UI IDs have been checked; actual 3D input, visuals and FPS still require browser playtesting.


## v0.9 — Solara: The Lost City

**Most important fixes**
- Walk/keyboard repair: moved the sidewalk spawn to a validated clear position, uses a smaller on-foot collision boundary, includes a fallback when the character is obstructed, and reads physical WASD key codes.
- Post-intro camera: now starts on the roadway side of the protagonist rather than inside the building behind them.
- Solid buildings and opaque windows: building blocks, facades and storefront glass use depth-writing nontransparent materials.
- Pedestrian pathing: NPCs align their facing and walking cycle with their real displacement and turn when a walkway is blocked.

**Original crime-fiction story** (loosely within the open-world genre, not copied from the GTA 6 plot):
1. Small Change — meet Rae and carry a first courier package.
2. The Wrong Envelope — encounter the first mystery.
3. Borrowed Wheels — bring a vehicle to a mechanic.
4. The Locked Ledger — solve an arcade three-symbol decoder puzzle at a terminal.
5. After-Hours Sprint — drive through timed street checkpoints.
6. False Colours — collect three fictional reconnaissance photos.
7. Vanishing Point — collect a package, lose your pursuit and make the handoff.
8. City of Secrets — decode the final ledger, escape the heat and reach your contact.

**Additional arcade side activities:** search fictional underground supply stashes with F and leave a crew street-art mural by pressing T near a marked wall. Both give small money rewards and increase in-game wanted level; stashes have cooldowns.

**Presentation and environment:** improved cinematic 3D camera movements, moving traffic during the opening, original film-like subtitles and loading gallery styling; dense markets with tables, café seating, planters, rubbish bins, and lantern details in GPU-instanced batches.

**Verification:** client/server JavaScript syntax validation and successful Render deployment are verified separately. Full in-browser input and performance testing is still required. Existing account progress and multiplayer code are preserved.


## Cinematic Neighbourhood & Living Traffic Update (v0.8)

A substantial update to the existing original Three.js game, inspired by the supplied street, sidewalk and alley references without copying their art or assets.

- **Mouse look repaired:** moving the mouse right now rotates the camera in the opposite direction from the previous implementation. WASD strafe direction was adjusted to match.
- **Pavement start:** your protagonist begins seated against a textured building wall with the existing "Please donate" sign, then rises to start exploring.
- **More detailed pedestrians:** fabric-grain clothing, layered outfits, belts, backpacks or accessories, facial eyes, hair and shoes. Approximately 48 NPCs are distributed across sidewalks and move in the local neighbourhood; Rae still provides missions.
- **Visible traffic drivers:** more local cars drive through the street grid, with modeled drivers and steering motion.
- **Pedestrian-aware traffic:** approaching NPCs or the player in the roadway causes traffic to brake and slow.
- **Vehicle takeover:** approach a passing car on foot and press **E**. A short non-graphic scene shows the vehicle door opening, its original driver getting out and walking away, and your character entering. The wanted level rises. The vehicle remains usable when you exit. This is a fictional arcade game mechanic, not a simulation of real-world conduct.
- **Neighbourhood shops:** textured signboards, framed glass storefronts, awnings, planters and shops you can interact with using **F**. The shop reward is a one-time small contribution per shop per game session.
- **Compact playable world:** trimmed the outer four blocks in each direction, leaving a denser 8×8 block city that retains existing mission locations.
- **Cinematic environment:** sky gradients, cloud forms, repeated pavement and asphalt surface maps, glass and masonry, coloured shopfronts, landscaping and visible coast.
- **Rendering fixes:** increased near clipping distance for depth precision; separated overlapping road and alley surfaces; segmented kerbs and raised crossing markings to reduce z-fighting; periodically hides distant shopfront details.

**Verification:** JavaScript syntax and Render build/deploy can be checked automatically. The game needs a real in-browser graphics and input test to confirm behaviour and actual FPS, especially on lower-powered laptops.


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
