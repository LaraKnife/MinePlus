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
      `§c[MinePlus] Has alcanzado el límite de ${maxHomes} homes. Usa !deletehome para hacer espacio.`,
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
  const homes = getPlayerHomes(player);
  const homeData = homes[homeName];

  if (!homeData) {
    player.sendMessage(
      `§c[MinePlus] No tienes ningún home guardado como '§e${homeName}§c'.`,
    );
    return;
  }

  const dimension = world.getDimension(homeData.dimension);
  player.teleport(
    { x: homeData.x, y: homeData.y, z: homeData.z },
    { dimension: dimension },
  );
  player.sendMessage(`§a[MinePlus] Teletransportando a '§e${homeName}§a'.`);
}

export function handleDeleteHomeCommand(player, homeName) {
  const homes = getPlayerHomes(player);

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
