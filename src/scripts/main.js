import {
  world,
  system,
  BlockPermutation,
  DynamicPropertiesDefinition,
} from "@minecraft/server";
import { handleMenu } from "./menu.js";
import { handleBlockBreak } from "./autocolect.js";

// Dynamic Property Key
export const DYNAMIC_PROP_KEY = "mineplus:auto_farm";
world.afterEvents.worldInitialize.subscribe((event) => {
  const def = new DynamicPropertiesDefinition();
  def.defineBoolean(DYNAMIC_PROP_KEY);
  event.registerDynamicProperties(def, "minecraft:player");
});

// Comando Menu
world.beforeEvents.chatSend.subscribe((eventData) => {
  const player = eventData.sender;
  const mensaje = eventData.message.trim().toLowerCase();

  if (mensaje === "!menu") {
    eventData.cancel = true;

    system.run(() => {
      handleMenu(player);
    });
  }
});

// Función principal
world.beforeEvents.playerBreakBlock.subscribe((eventData) => {
  const player = eventData.player;
  const estaActivo = player.getDynamicProperty(DYNAMIC_PROP_KEY) ?? true;
  if (!estaActivo) return;
  handleBlockBreak(eventData);
});
