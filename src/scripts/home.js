import { world } from "@minecraft/server";
import { PROPERTIES } from "./constants.js";

function getPlayerHomes(player) {
  const dataString = player.getDynamicProperty(PROPERTIES.PLAYER_HOMES_DATA);
  if (!dataString) return {};
  try {
    return JSON.parse(dataString);
  } catch (error) {
    return {};
  }
}

function savePlayerHomes(player, homes) {
  player.setDynamicProperty(
    PROPERTIES.PLAYER_HOMES_DATA,
    JSON.stringify(homes),
  );
}

export function handleSetHomeCommand(player, homeName) {
  const maxHomes = world.getDynamicProperty(PROPERTIES.GLOBAL_MAX_HOMES) ?? 3;
  const homes = getPlayerHomes(player);
  const homeCount = Object.keys(homes).length;

  if (!homes[homeName] && homeCount >= maxHomes) {
    player.sendMessage(
      `§c[MinePlus] Has alcanzado el límite de ${maxHomes} homes. Usa !delhome para hacer espacio.`,
    );
    return;
  }

  homes[homeName] = {
    x: player.location.x,
    y: player.location.y,
    z: player.location.z,
    dimension: player.dimension.id,
  };

  savePlayerHomes(player, homes);
  player.sendMessage(`§a[MinePlus] Home '§e${homeName}§a' establecido.`);
}

export function handleHomeCommand(player, homeName) {
  const maxHomes = world.getDynamicProperty(PROPERTIES.GLOBAL_MAX_HOMES) ?? 3;
  const homes = getPlayerHomes(player);
  const homeKeys = Object.keys(homes);
  const homeData = homes[homeName];
  const homeIndex = homeKeys.indexOf(homeName);

  if (homeKeys.length === 0) {
    player.sendMessage(
      "§c[MinePlus] No tienes ningún home guardado. Usa !sethome 'nombre' para establecer uno.",
    );
    return;
  }

  if (!homeData) {
    player.sendMessage(
      `§c[MinePlus] No tienes ningún home guardado como '§e${homeName}§c'.`,
    );
    return;
  }

  const dimension = world.getDimension(homeData.dimension);

  if (homeIndex >= maxHomes) {
    player.sendMessage(
      `§c[MinePlus] Este home está bloqueado. El límite global es de §e${maxHomes}§c.\n` +
        `§7Tus primeros ${maxHomes} homes están activos. Usa §c!delhome§7 para liberar espacio o revisa tu lista con §a!homes§7.`,
    );
    return;
  }

  player.teleport(
    { x: homeData.x, y: homeData.y, z: homeData.z },
    { dimension: dimension },
  );
  player.sendMessage(`§a[MinePlus] Teletransportando a '§e${homeName}§a'.`);
}

export function handleDeleteHomeCommand(player, homeName) {
  const homes = getPlayerHomes(player);

  if (Object.keys(homes).length === 0) {
    player.sendMessage("§c[MinePlus] No tienes ningún home guardado.");
    return;
  }

  if (!homes[homeName]) {
    player.sendMessage(
      `§c[MinePlus] No se encontró el home '§e${homeName}§c'.`,
    );
    return;
  }

  delete homes[homeName];
  savePlayerHomes(player, homes);
  player.sendMessage(`§a[MinePlus] Home '§e${homeName}§a' eliminado.`);
}

export function handleListHomesCommand(player) {
  const maxHomes = world.getDynamicProperty(PROPERTIES.GLOBAL_MAX_HOMES) ?? 3;
  const homes = getPlayerHomes(player);
  const homeKeys = Object.keys(homes);

  if (homeKeys.length === 0) {
    player.sendMessage("§c[MinePlus] No tienes ningún home guardado.");
    return;
  }

  player.sendMessage(
    `§a[MinePlus] Tus homes guardados (§e${homeKeys.length}/${maxHomes}§a):`,
  );
  homeKeys.forEach((key, index) => {
    if (index < maxHomes) {
      player.sendMessage(`§b- §a${key} §7(Activo)`);
    } else {
      player.sendMessage(`§b- §c${key} §8(Bloqueado)`);
    }
  });
}
