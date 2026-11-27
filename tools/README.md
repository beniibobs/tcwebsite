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
