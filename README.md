# Trial Chambers Field Atlas — Minecraft Java 26.3

A static, GitHub Pages-ready site continuing the supplied **Maze (Slanted) — Trial Chambers.html** prototype.

## What's here

- A home page (`index.html`) and searchable index of all eight combat chambers (`chambers.html`).
- A **3D Maze viewer** (`rooms/maze.html`) built with the *original supplied encoded room geometry and renderer*. It retains orbit/zoom, cut-height slider, floor buttons, hover information, exits, and resource highlights.
- Seven other room pages with accurate **base-template doorway reference diagrams** and whole-structure generation statistics. Their full dynamic 3D interiors are **not implemented yet**.
- A `statistics.html` data browser with 66 headline study measurements and CSV downloads.
- A `generation.html` page comparing copper-door outcomes by height and inside/outside-L position, and room type by connection origin.
- An `about.html` methodology and limitations page.
- `original/Maze_Slanted_original.html` preserves the initial upload for reference.

**Important:** The numerical figures are estimates from an independent NBT/jigsaw emulator, *not* validated frequencies from actual Minecraft world generation. The Slanted room resource table assumes complete interior generation, while the whole-TC figures come from separate 100,000-structure cohorts. The 3D Maze is **one example** of an assembled room, with representative resolved block entities.

## Publish on GitHub Pages (no build tools)

1. Create a GitHub repository, e.g. `trial-chambers-atlas`.
2. Upload **the contents of this folder** to the repository root, preserving `index.html`, `rooms/`, `assets/`, and `.nojekyll`. Do not upload the parent folder as an extra directory level.
3. Commit to the `main` branch.
4. Open the repository's **Settings → Pages → Build and deployment**.
5. Under **Source**, choose **Deploy from a branch**. Select **`main`** and **`/(root)`**, then **Save**.
6. GitHub should provide a site URL similar to `https://YOUR_USERNAME.github.io/trial-chambers-atlas/` once published.

Links are relative, so the site works with a project subpath (no hard-coded username or domain).

### Test locally

Start a static server from the folder:

```bash
python -m http.server 8000
```

Open `http://localhost:8000/`. Double-clicking the HTML files may work for the static pages, but a local web server is recommended for the 3D viewer and file permissions.

The Maze viewer uses Three.js r128 hosted on `cdnjs.cloudflare.com` and requires an internet connection plus WebGL in the browser. Its compressed source geometry and texture are embedded locally in `assets/js/maze-renderer.js`.

## Where to edit

| What | File |
|---|---|
| All styles, light/dark palette, mobile layout | `assets/css/site.css` |
| Theme switcher and search/sort controls | `assets/js/site.js` |
| Maze 3D model and interaction | `assets/js/maze-renderer.js` |
| Maze resource probabilities | In the original Maze renderer's stats table code |
| All room pages | `rooms/*.html` |
| Home and chamber cards | `index.html`, `chambers.html` |
| Full-TC statistics | `statistics.html` and `assets/data/quick_reference.csv` |
| Doorway / origin / pots tables | `assets/data/*.csv` |

The pages are pre-rendered HTML rather than dynamically generated from their CSV sources, so **editing a CSV does not automatically update the displayed table**. Update the corresponding HTML too when correcting a figure.

To regenerate the HTML pages from the included source CSV files after updating figures, run `python tools/build_tc_atlas.py` from the repository root. This generator reads the bundled data and original Maze HTML, and rewrites the HTML pages; keep custom modifications to generated pages backed up before rerunning. GitHub Pages does **not** run this script — it publishes the already-generated HTML files.

## Research/source notes

- `assets/data/quick_reference.csv`: figures merged from the later 100,000-run chamber study (v4) and the later 100,000-run resources-and-loot study (v5), with the study identifier in each row.
- `assets/data/chamber_by_location.csv`: chamber placement frequency by source branch.
- `assets/data/chamber_exit_connectors.csv`: each combat chamber's connector coordinates and the fraction of placements using it.
- `assets/data/doors_by_height_side.csv`: immediate and eventual outcomes for copper doors, conditional on door location.
- `assets/data/pots_by_straight.csv`: expected pots from each straight corridor variant.
- `assets/data/slanted_quadrant_rotations.csv`: Slanted corner/rotation model results.
- `assets/data/slanted_resources.csv`: Slanted per-room resource probabilities.
- `downloads/complete_simulation_data.zip`: full research export, preserving older and corrected study outputs.

Minecraft and its names are trademarks of their respective owners. This is an independent community project.