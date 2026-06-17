import { system, BlockPermutation } from "@minecraft/server";

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

export function handleCropBreak(block, brokenPermutation, player) {
  const tipoDeBloque = brokenPermutation.type.id;
  const configCultivo = CROP_TYPES[tipoDeBloque];

  if (!configCultivo) return; // Cultivo no soportado

  const dimension = block.dimension;
  const location = block.location;
  const estadosOriginales = { ...brokenPermutation.getAllStates() };
  const etapaActual = estadosOriginales[configCultivo.propiedad];

  // Replanta si el cultivo ha crecido por completo
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

      // Sonido cosecha
      dimension.runCommand(
        `playsound item.crop.plant @a[r=15] ${location.x} ${location.y} ${location.z} 0.4 1.1`,
      );
    });
  }
}
