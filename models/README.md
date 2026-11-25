# Optional character models

MVT 6 supports an **optional, locally hosted** animated GLB or glTF player character.

The game continues to use its built-in procedural character by default. This means no third-party model or internet asset is required beyond the existing Three.js engine dependency.

## To activate a custom character

1. Put an original or appropriately licensed, optimised rigged model at `models/player.glb`.
2. Set `models/manifest.json` to:

```json
{"player":"models/player.glb"}
```

3. Redeploy through GitHub/Render.

## Requirements

- Use GLB (recommended) or glTF; include animation clips labelled Idle and Walk (case-insensitive); Run and Jump are optional.
- Character should face positive Z for the current MVT 6 movement system.
- Export a complete scene with embedded materials/textures when possible. The loader normalises character height to approximately 2.98 game units.
- Aim for **under 15,000 triangles** and 1K compressed textures for mid-range laptop compatibility.
- Use only assets you created or have permission to redistribute. Do not import GTA characters or proprietary assets.
- Assets must reside within the local `models/` directory. The server prevents traversal outside that directory.
- If a model fails to load or has incompatible animations, the original character remains playable.

Current update adds the loader and original procedural character improvements. **It does not include a professionally authored rigged GLB**; add that asset separately when available.
