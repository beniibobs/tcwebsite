# Trial Chambers Field Atlas — Minecraft Java 26.3

Static HTML/CSS/JavaScript Trial Chambers research atlas, extending the original **Maze (Slanted)** prototype.

## Pages
- `index.html` — overview
- `chambers.html` — eight chamber directory, with search and sorting
- `rooms/maze.html` — preserved original interactive Maze 3D model in an embedded frame
- `rooms/chamber_*.html`, `rooms/assembly.html`, `rooms/eruption.html`, `rooms/pedestal.html` — chamber statistics and schematic connector references
- `statistics.html` — searchable reference statistics
- `generation.html` — door outcomes by height and L-side
- `about.html` — data provenance and limitations

The original HTML is preserved at `original/Maze_Slanted_original.html`.
**Note:** The six other chamber diagrams and the Slanted schematic are representative locator schematics, not block-accurate PNG renders. The original bundled PNG graphics and full 12-MB simulation-data archive are not yet present in the GitHub repository; these are retained in the downloadable full website ZIP. The source research statistics are from an independent structure emulator, not validated vanilla in-game sampling.

## GitHub Pages publishing
This is a no-build static site. Enable GitHub Pages in **Settings → Pages**: Deploy from a branch, `main`, `/(root)`. The repository is currently private; public Pages availability may depend on GitHub plan. If you want a publicly visible site and your plan does not support Pages from private repositories, change visibility under **Settings → General → Danger Zone → Change repository visibility** to **Public**.

Expected URL after enabling Pages:
https://beniibobs.github.io/tcwebsite/

The Maze viewer loads Three.js r128 from a CDN, so that page requires Internet access and WebGL.

## Editing
- `assets/css/site.css`: theme and responsive layout
- `assets/js/site.js`: search, sorting, theme switch
- `original/Maze_Slanted_original.html`: original 3D viewer
- `assets/data/*.csv`: backing statistics and details
- `rooms/*.html`: chamber pages

### Notes
The entire initial offline export (including its original eight raster diagrams, generator script, and complete 100k raw study archive) remains available from the prior chat download, `Trial_Chambers_Atlas_GitHub_Pages.zip`. The current GitHub-hosted version is intentionally a lighter static copy and does not yet include those binary files. For a full mirror, upload the contents of that ZIP to this repository.

Minecraft is a trademark of Mojang/Microsoft. This is an independent community project.
