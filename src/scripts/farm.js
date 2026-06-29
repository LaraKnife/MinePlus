import { system } from "@minecraft/server";

export const CROP_TYPES = {
  "minecraft:wheat": { max: [7] },
  "minecraft:carrots": { max: [7] },
  "minecraft:potatoes": { max: [7] },
  "minecraft:beetroot": { max: [3, 4, 7] },
  "minecraft:sweet_berry_bush": { max: [3] },
  "minecraft:cocoa": { max: [2] },
  "minecraft:nether_wart": { max: [3] },
  "minecraft:torchflower_crop": { max: [2] },
  "minecraft:pitcher_crop": { max: [4] },
  "minecraft:pumpkin_stem": { max: [7] },
  "minecraft:melon_stem": { max: [7] },
  "minecraft:chorus_flower": { max: [5] },
};

export function handleFarm(block, brokenPermutation, player) {
  const blockType = brokenPermutation.type.id;
  const configCultivo = CROP_TYPES[blockType];

  if (!configCultivo) return;

  try {
    let propiedadActiva = null;
    let etapaActual = undefined;

    for (const prop of ["growth", "age"]) {
      const val = brokenPermutation.getState(prop);
      if (val !== undefined) {
        propiedadActiva = prop;
        etapaActual = val;
        break;
      }
    }

    if (propiedadActiva === null || etapaActual === undefined) return;

    const esMaduro = configCultivo.max.includes(etapaActual);

    system.run(() => {
      try {
        const dimension = block.dimension;
        const location = block.location;
        const bloqueActual = dimension.getBlock(location);

        if (!bloqueActual) return;

        if (bloqueActual.type.id !== "minecraft:air") {
          return;
        }

        const nuevaPermutacion = brokenPermutation.withState(
          propiedadActiva,
          0,
        );
        bloqueActual.setPermutation(nuevaPermutacion);

        dimension.playSound("item.crop.plant", location, {
          volume: 0.3,
          pitch: 1.2,
        });
      } catch (tickError) {
        console.warn(
          `[MinePlus] Error en bloque temporal: ${tickError.message}`,
        );
      }
    });
  } catch (error) {
    console.warn(`§c[MinePlus] Error crítico: ${error.message}`);
  }
}
