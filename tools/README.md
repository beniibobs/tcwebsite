# Non-chamber piece exporter

Generate the entrance and corridor-slice batch from the same Minecraft Java 26.3 client JAR used by the atlas:

```sh
python -m pip install Pillow
python tools/build_pieces.py /path/to/minecraft-26.3-client.jar tools/recipes/entrances-and-slices.json assets/data/pieces
```

Use the combined recipe for the published shared library. The older entrance-only recipe is retained as historical reference; do not use it to overwrite the published shared atlas, as it lacks the corridor models.

The combined recipe produces eleven independently compressed voxel grids, a shared library of 52 compiled block-state models, and a lossless texture atlas with 74 tiles and one-pixel extruded borders. The three entrance layouts remain unchanged. Chest geometry and all six face UVs for the base, lid and lock follow the JAR's ChestModel, ModelPart.Cube, ModelPart.Polygon and ChestRenderer definitions. The renderer loads only the selected grid and its library, caches loaded scenes, and reuses one WebGL context. Atrium is registered separately in the same manifest.

## Recipes and scope

Recipes choose the base, a representative child per connector pool or explicit connector coordinate, and floor cut heights. The exporter finds matching connector names and opposed facings, respects aligned connector top directions, and checks internal attachment bounds and sibling collisions for the slice batch. The selected spawner connector can recursively attach its content; routing-only connectors themselves are not displayed in the catalogue. Empty optional pools are allowed. Copper-door branches are intentionally omitted from these slice previews.

This is a deterministic representative-template assembler, not a vanilla world-generation simulator. It supports standard variant blockstates, parent inheritance, the entrance bed models, closed single chests, blank decorated pots, static water, and the selected recursive attachments. Multipart states, double chests, dynamic entities, additional block entities, more complex rotations and special renderers need further implementation and testing. The visual examples are not intended to show every possible configuration.

To add a compiled piece, register its name, asset, library, interior flood-fill seeds, floor cuts and camera radius in `assets/data/pieces/manifest.json`. Verify decoded grid dimensions, state and texture indices, connector placement and floor-cut face counts. Review the result interactively before marking the batch final.

## Alphabetical batch 1

Build to a fresh staging directory (do not overwrite the entrance/slice atlas):

```sh
python tools/build_pieces.py /path/to/minecraft-26.3-client.jar tools/recipes/alphabetical-1.json /tmp/tc-batch1
python tools/pack_atlas.py /tmp/tc-batch1 assets/data/pieces/entrance-atlas.png
```

Copy the ten layout JSON files, batch1-models.json and batch1-atlas-pack.json into assets/data/pieces. The batch adds general element rotation/rescale, rotating directional block-state properties, and the default tripwire state. The published packed atlas references the existing entrance atlas for unchanged tiles and stores compressed RGBA interiors for new tiles. The viewer reconstructs their 18px bordered tiles on demand. Keep the referenced entrance atlas unchanged unless also rebuilding the packed map. Standalone decorations can opt into exterior rendering and closer camera settings in the manifest.

The earlier entrance and slice assets are unchanged. This exporter revision is for new batches; regenerating old batches with the new rotation logic may change those models.

## Complete catalogue (alphabetical batches 2–9)

All 98 catalogue entries now have a render. The final 76 layouts use a single shared compressed library, loaded only when one is selected. Build the new layouts in a fresh directory:

```sh
python tools/build_remaining.py /path/to/minecraft-26.3-client.jar tools/recipes/remaining.json /tmp/tc-remaining
python tools/pack_catalogue.py /tmp/tc-remaining /path/to/raw-entrance-export /path/to/raw-batch1-export
```

The exact source library order is significant: use the earlier exporter versions from their respective commits for raw entrance/slice and batch1 assets. The existing published entrance and batch1 libraries must remain immutable while the compressed catalogue refers to them. This revision supports multipart blockstates, patterned decorated pots, and static foliage/redstone tints. Dynamic entities, fluid animation and candle flames remain outside the viewer's scope. Structural links between neighbouring pieces are deliberately not expanded. Floor cuts and camera settings are representative and can be refined after visual review. All 76 published layout blobs match the local exports; the packer verifies exact decoded model faces and texture interiors before publishing.
