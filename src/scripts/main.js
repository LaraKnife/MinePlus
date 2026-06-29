import { world } from "@minecraft/server";
import { handleBlockBreak } from "./autocollect.js";
import { handleCommand } from "./commands.js";
import { handleWelcomeMessage } from "./welcome.js";

// Enrutador de Comandos
world.beforeEvents.chatSend.subscribe((eventData) => {
  handleCommand(eventData);
});

// Evento de rompimiento de bloque
world.afterEvents.playerBreakBlock.subscribe((eventData) => {
  handleBlockBreak(eventData);
});

// Bienvenida al server
world.afterEvents.playerSpawn.subscribe((eventData) => {
  handleWelcomeMessage(eventData);
});
