import { system } from "@minecraft/server";
import { handleMenu } from "./menu.js";
import { handleTPACommand, handleTPAResponse } from "./tpa.js";
import {
  handleSetHomeCommand,
  handleHomeCommand,
  handleDeleteHomeCommand,
} from "./home.js";

const commands = {
  "!menu": (player) => {
    system.runTimeout(() => handleMenu(player), 10);
  },

  "!sethome": (player, homeName) => {
    system.run(() => handleSetHomeCommand(player, homeName || "home"));
  },

  "!home": (player, homeName) => {
    system.run(() => handleHomeCommand(player, homeName || "home"));
  },

  "!h": (player, homeName) => {
    system.run(() => handleHomeCommand(player, homeName || "home"));
  },

  "!deletehome": (player, homeName) => {
    system.run(() => handleDeleteHomeCommand(player, homeName || "home"));
  },

  "!tpa": (player, targetPlayer) => {
    system.run(() => {
      if (!targetPlayer)
        return player.sendMessage(
          "§c[MinePlus] Usa: §e!tpa NombreDelJugador§c.",
        );
      const cleanTargetPlayer = targetPlayer.replace("@", "");
      handleTPACommand(player, cleanTargetPlayer);
    });
  },

  "!y": (player) => {
    system.run(() => handleTPAResponse(player, true));
  },

  "!n": (player) => {
    system.run(() => handleTPAResponse(player, false));
  },
};

export function handleCommand(eventData) {
  const player = eventData.sender;
  const message = eventData.message.trim().toLowerCase();
  const args = message.split(/\s+/);
  const command = args.shift();
  const param = args.join(" ").trim();
  const executor = commands[command];

  if (executor) {
    eventData.cancel = true;
    executor(player, param);
  }
}
