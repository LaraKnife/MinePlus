import { system, BlockPermutation } from "@minecraft/server";

export const CROP_TYPES = {
  "minecraft:wheat": { propiedad: "growth", max: 7 },
  "minecraft:carrots": { propiedad: "growth", max: 7 },
  "minecraft:potatoes": { propiedad: "growth", max: 7 },
  "minecraft:beetroot": { propiedad: "growth", max: 3 },
  "minecraft:nether_wart": { propiedad: "age", max: 3 },
  "minecraft:sweet_berry_bush": { propiedad: "growth", max: 3 },
  "minecraft:cocoa": { propiedad: "growth", max: 2 },
  "minecraft:torchflower_crop": { propiedad: "growth", max: 2 },
  "minecraft:pitcher_crop": { propiedad: "growth", max: 4 },
};

export function handleFarm(block, brokenPermutation, player) {
  const blockType = brokenPermutation.type.id;
  const configCultivo = CROP_TYPES[blockType];

  if (!configCultivo) return;

  try {
    const etapaActual = brokenPermutation.getState(configCultivo.propiedad);

    if (etapaActual === configCultivo.max) {
      system.run(() => {
        const bloqueActual = block.dimension.getBlock(block.location);
        if (!bloqueActual) return;

        const newPermutation = brokenPermutation.withState(
          configCultivo,
          propiedad,
          0,
        );
        bloqueActual.setPermutation(newPermutation);

        block.dimension.playSound("item.crop.plant", block.location, {
          volume: 0.4,
          pitch: 1.1,
        });
      });
    }
  } catch (error) {
    console.warn("§c[MinePlus] Error replantando: " + error);
  }
}
