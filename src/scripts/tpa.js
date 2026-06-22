import { world, system } from "@minecraft/server";

const pendingTPA = new Map();

export function handleTPACommand(player, targetName) {
  if (player.name === targetName) {
    player.sendMessage(
      "§c[MinePlus] No puedes enviarte una solicitud de teletransporte a ti mismo.",
    );
    return;
  }

  const playerList = world.getPlayers();
  const targetPlayer = playerList.find(
    (p) => p.name.toLowerCase() === targetName.toLowerCase(),
  );

  if (!targetPlayer) {
    player.sendMessage(
      `§c[MinePlus] No se encontró el jugador '${targetName}'.`,
    );
    return;
  }

  if (pendingTPA.has(targetPlayer.name)) {
    player.sendMessage(
      `§c[MinePlus] El jugador '${targetPlayer.name}' ya tiene una solicitud de teletransporte pendiente.`,
    );
    return;
  }

  const timeoutId = system.runTimeout(() => {
    if (pendingTPA.has(targetPlayer.name)) {
      pendingTPA.delete(targetPlayer.name);
      player.sendMessage(
        `§c[MinePlus] Tu solicitud de TP a §e${targetPlayer.name}§c ha expirado.`,
      );
      targetPlayer.sendMessage(
        `§c[MinePlus] La solicitud de TP de §e${player.name}§c ha expirado.`,
      );
    }
  }, 600);

  pendingTPA.set(targetPlayer.name, { player: player, timeoutId: timeoutId });
  player.sendMessage(
    `§a[MinePlus] Solicitud enviada a §e${targetPlayer.name}§a. Tienen 30 segundos para aceptar.`,
  );
  targetPlayer.sendMessage(
    `§b[MinePlus] §e${player.name}§b quiere teletransportarse hacia ti.\nEscribe §a!y§b para aceptar o §c!n§b para rechazar.`,
  );
}

export function handleTPAResponse(targetPlayer, isAccepted) {
  if (!pendingTPA.has(targetPlayer.name)) {
    targetPlayer.sendMessage(
      "§c[MinePlus] No tienes ninguna solicitud de teletransporte pendiente.",
    );
    return;
  }

  const requestData = pendingTPA.get(targetPlayer.name);
  pendingTPA.delete(targetPlayer.name);
  system.clearRun(requestData.timeoutId);

  const sender = requestData.player;

  const senderOnline = world
    .getPlayers()
    .find((p) => p.name.toLowerCase() === sender.name.toLowerCase());

  if (!isAccepted) {
    targetPlayer.sendMessage(
      `§c[MinePlus] Has rechazado la solicitud de TP de §e${sender.name}§c.`,
    );
    if (senderOnline) {
      senderOnline.sendMessage(
        `§c[MinePlus] Tu solicitud de TP a §e${targetPlayer.name}§c ha sido rechazada.`,
      );
    }
    return;
  }

  if (!senderOnline) {
    targetPlayer.sendMessage(
      `§c[MinePlus] El jugador §e${sender.name}§c ya no está en línea.`,
    );
    return;
  }

  senderOnline.teleport(targetPlayer.location, targetPlayer.dimension);
  targetPlayer.sendMessage(
    `§a[MinePlus] Aceptaste la solicitud. §e${sender.name}§a ha sido teletransportado.`,
  );
  senderOnline.sendMessage(
    `§a[MinePlus] §e${targetPlayer.name}§a aceptó tu solicitud.`,
  );
}
