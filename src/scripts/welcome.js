import { system } from "@minecraft/server";

export function handleWelcomeMessage(eventData) {
  const { player, initialSpawn } = eventData;

  if (initialSpawn) {
    // Retraso de 2 segundos
    system.runTimeout(() => {
      player.sendMessage("§8========== MinePlus V1.5.3 Beta ==========");
      player.sendMessage(`§a§l¡Bienvenido ${player.name}!§r`);
      player.sendMessage("§eComandos disponibles:");
      player.sendMessage("§b!sethome 'nombre' §7- Guarda tu ubicación actual.");
      player.sendMessage(
        "§b!home / !h  'nombre' §7- Viaja a un home guardado.",
      );
      player.sendMessage("§b!homes §7- Muestra tu lista de homes.");
      player.sendMessage("§b!delhome 'nombre' §7- Elimina un hogar.");
      player.sendMessage(
        "§b!tpa 'jugador' §7- Solicita teletransportarte a alguien.",
      );
      player.sendMessage("§b!menu §7- Menú de configuración.");
      player.sendMessage("§8======================================");
    }, 40);
  }
}
