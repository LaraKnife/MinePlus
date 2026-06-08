import { system } from "@minecraft/server";

// Cultivos soportados
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

export function handleCropBreak(block, player) {
  const tipoDeBloque = block.typeId;
  const configCultivo = CROP_TYPES[tipoDeBloque];

  if (!configCultivo) return;

  const dimension = block.dimension;
  const location = block.location;
  const estadosOriginales = block.permutation.getStates();
  const etapaActual = estadosOriginales[configCultivo.propiedad];

  // Replanta si el cultivo ha crecido por completo
  if (etapaActual === configCultivo.max) {
    system.run(() => {
      const bloqueActual = dimension.getBlock(location);
      if (!bloqueActual) return;

      bloqueActual.setType("minecraft:air");

      const nuevosEstados = { ...estadosOriginales };
      nuevosEstados[configCultivo.propiedad] = 0;

      bloqueActual.setType(tipoDeBloque);
      const nuevaPermutacion = BlockPermutation.resolve(
        tipoDeBloque,
        nuevosEstados,
      );
      bloqueActual.setPermutation(nuevaPermutacion);

      // Sonido cosecha
      dimension.runCommand(
        `playsound item.crop.plant @a[r=15] ${location.x} ${location.y} ${location.z} 0.4 1.1`,
      );
    });
  } else {
    // Cultivo sin madurar
    system.run(() => {
      const bloqueActual = dimension.getBlock(location);
      if (bloqueActual) bloqueActual.setType("minecraft:air");
    });
  }
}
