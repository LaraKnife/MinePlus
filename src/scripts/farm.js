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
  const tipoDeBloque = brokenPermutation.type.id;
  const configCultivo = CROP_TYPES[tipoDeBloque];

  const dimension = block.dimension;
  const location = block.location;
  const estadosOriginales = { ...brokenPermutation.getAllStates() };
  const etapaActual = estadosOriginales[configCultivo.propiedad];

  if (etapaActual === configCultivo.max) {
    system.run(() => {
      const bloqueActual = dimension.getBlock(location);
      if (!bloqueActual) return;

      const nuevosEstados = { ...estadosOriginales };
      nuevosEstados[configCultivo.propiedad] = 0;

      const nuevaPermutacion = BlockPermutation.resolve(
        tipoDeBloque,
        nuevosEstados,
      );
      bloqueActual.setPermutation(nuevaPermutacion);

      dimension.playSound("item.crop.plant", location, {
        volume: 0.4,
        pitch: 1.1,
      });
    });
  }
}
