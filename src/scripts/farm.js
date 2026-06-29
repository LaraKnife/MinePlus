import { system } from "@minecraft/server";

export const CROP_TYPES = {
  "minecraft:wheat": { max: [7], seed: "minecraft:wheat_seeds" },
  "minecraft:carrots": { max: [7], seed: "minecraft:carrot" },
  "minecraft:potatoes": { max: [7], seed: "minecraft:potato" },
  "minecraft:beetroot": { max: [3, 4, 7], seed: "minecraft:beetroot_seeds" },
  "minecraft:sweet_berry_bush": { max: [3], seed: "minecraft:sweet_berries" },
  "minecraft:cocoa": { max: [2], seed: "minecraft:cocoa_beans" },
  "minecraft:nether_wart": { max: [3], seed: "minecraft:nether_wart" },
  "minecraft:torchflower_crop": {
    max: [2],
    seed: "minecraft:torchflower_seeds",
  },
  "minecraft:pitcher_crop": { max: [4], seed: "minecraft:pitcher_pod" },
  "minecraft:pumpkin_stem": { max: [7], seed: "minecraft:pumpkin_seeds" },
  "minecraft:melon_stem": { max: [7], seed: "minecraft:melon_seeds" },
  "minecraft:chorus_flower": { max: [5], seed: "minecraft:chorus_flower" },
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

    if (!esMaduro) {
      return;
    }

    system.run(() => {
      try {
        const dimension = block.dimension;
        const location = block.location;
        const bloqueActual = dimension.getBlock(location);

        if (!bloqueActual || bloqueActual.type.id !== "minecraft:air") {
          return;
        }

        const nuevaPermutacion = brokenPermutation.withState(
          propiedadActiva,
          0,
        );
        bloqueActual.setPermutation(nuevaPermutacion);

        const itemsEnElSuelo = dimension.getEntities({
          location: location,
          maxDistance: 1.5,
          type: "minecraft:item",
        });

        for (const entity of itemsEnElSuelo) {
          const itemComponent = entity.getComponent("minecraft:item");
          if (
            itemComponent &&
            itemComponent.itemStack.typeId === configCultivo.seed
          ) {
            const stack = itemComponent.itemStack;
            if (stack.amount > 1) {
              stack.amount -= 1;
              itemComponent.itemStack = stack;
              break;
            } else {
              entity.remove();
              break;
            }
          }
        }

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
