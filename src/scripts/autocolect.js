import { system } from "@minecraft/server";
import { CROP_TYPES, handleCropBreak } from "./crops.js";

export function handleBlockBreak(eventData) {
  const player = eventData.player;
  const block = eventData.block;
  const blockID = block.typeId;
  const dimension = block.dimension;
  const location = block.location;
  const equipo = player.getComponent("minecraft:equipment_inventory");
  const herramienta = equipo?.getEquipment("Mainhand");
  const itemsQueSoltara = block.permutation.getDrops(herramienta); // Respeta encantamientos

  // Autorrecolección
  if (itemsQueSoltara && itemsQueSoltara.length > 0) {
    eventData.cancel = true;

    const inventario = player.getComponent("minecraft:inventory")?.container;
    if (!inventario) return;

    for (const itemStack of itemsQueSoltara) {
      try {
        const itemSobrante = inventario.addItem(itemStack);
        // Inventario lleno
        if (itemSobrante && itemSobrante.amount > 0) {
          dimension.spawnItem(itemSobrante, location);
        }
      } catch (e) {
        dimension.spawnItem(itemStack, location);
      }
    }

    // Replantado
    if (blockID in CROP_TYPES) {
      handleCropBreak(block, player);
    } else {
      // Bloques no cultivables
      system.run(() => {
        const bloqueActual = dimension.getBlock(location);
        if (bloqueActual) bloqueActual.setType("minecraft:air");
      });
    }
  }
}
