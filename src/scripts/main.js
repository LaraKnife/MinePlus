import { world, system, BlockPermutation } from "@minecraft/server";
import { handleMenu } from "./menu.js";
import { handleBlockBreak } from "./autocolect.js";
import { handleHomeCommand, handleSetHomeCommand } from "./home.js";

// Dynamic Property Key
export const DYNAMIC_PROP_KEY = "mineplus:auto_farm";

// Comandos
world.beforeEvents.chatSend.subscribe((eventData) => {
  const player = eventData.sender;
  const mensaje = eventData.message.trim().toLowerCase();

  // Comando Menu
  if (mensaje === "!menu") {
    eventData.cancel = true;

    system.runTimeout(() => {
      handleMenu(player);
    }, 10);
    // Comando SetHome
  } else if (mensaje === "!sethome") {
    eventData.cancel = true;

    system.run(() => {
      handleSetHomeCommand(player);
    });
    // Comando Home
  } else if (mensaje === "!home") {
    eventData.cancel = true;

    system.run(() => {
      handleHomeCommand(player);
    });
  }
});

// Función principal
world.afterEvents.playerBreakBlock.subscribe((eventData) => {
  const player = eventData.player;
  const estaActivo = player.getDynamicProperty(DYNAMIC_PROP_KEY) ?? true;
  if (!estaActivo) return;
  handleBlockBreak(eventData);
});
