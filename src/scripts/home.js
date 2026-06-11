import { world } from "@minecraft/server";

export function handleSetHomeCommand(player) {
  const homeLocation = player.location;
  const dimension = player.dimension.id;
  const homeData = JSON.stringify({
    dimension,
    x: homeLocation.x,
    y: homeLocation.y,
    z: homeLocation.z,
  });

  world.setDynamicProperty(`home_${player.id}`, homeData);
  player.sendMessage("§a[MinePlus] Home establecido en tu ubicación actual.");
}

export function handleHomeCommand(player) {
  const homeDataString = world.getDynamicProperty(`home_${player.id}`);
  if (!homeDataString) {
    player.sendMessage(
      "§c[MinePlus] No tienes un home establecido. Usa !sethome para establecerlo.",
    );
    return;
  } else {
    const homeData = JSON.parse(homeDataString);
    const dimension = world.getDimension(homeData.dimension);

    player.teleport(
      { x: homeData.x, y: homeData.y, z: homeData.z },
      { dimension: dimension },
    );
    player.sendMessage("§a[MinePlus] Teletransportando...");
  }
}
