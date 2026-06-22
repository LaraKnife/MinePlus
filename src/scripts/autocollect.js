import { system } from "@minecraft/server";
import { CROP_TYPES, handleFarm } from "./farm.js";
import { PROPERTIES } from "./constants.js";

export function handleBlockBreak(eventData) {
  const { player, block, brokenBlockPermutation, dimension } = eventData;
  const blockID = brokenBlockPermutation.type.id;
  const location = block.location;

  const autoCollect =
    player.getDynamicProperty(PROPERTIES.AUTO_COLLECT) ?? true;
  const autoFarm = player.getDynamicProperty(PROPERTIES.AUTO_FARM) ?? true;

  // Replantado Automático
  if (autoFarm && blockID in CROP_TYPES) {
    handleFarm(block, brokenBlockPermutation, player);
  }

  // Auto Recolección
  if (autoCollect) {
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
          // Prevenir crasheos si la entidad desapareció
        }
      }
    }, 1);
  }
}
