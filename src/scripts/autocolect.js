import { system } from "@minecraft/server";
import { CROP_TYPES, handleCropBreak } from "./crops.js";

export function handleBlockBreak(eventData) {
  const { player, block, brokenBlockPermutation, dimension } = eventData;
  const blockID = brokenBlockPermutation.type.id;
  const location = block.location;

  // Si es cultivo
  if (blockID in CROP_TYPES) {
    handleCropBreak(block, brokenBlockPermutation, player);
  }

  // Autocolect
  system.runTimeout(() => {
    const inventario = player.getComponent("minecraft:inventory")?.container;
    if (!inventario) return;

    const itemsEnElSuelo = dimension.getEntities({
      location: location,
      maxDistance: 1.5,
      type: "minecraft:item",
    });

    for (const entity of itemsEnElSuelo) {
      const itemComponent = entity.getComponent("minecraft:item");
      if (!itemComponent) continue;

      const itemStack = itemComponent.itemStack;

      try {
        const itemSobrante = inventario.addItem(itemStack);

        if (!itemSobrante || itemSobrante.amount === 0) {
          entity.remove();
        } else {
          entity.remove();
          dimension.spawnItem(itemSobrante, location); // Inventario lleno
        }
      } catch (error) {
        // Secure
      }
    }
  }, 1);
}
