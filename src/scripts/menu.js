import { system, world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { PROPERTIES } from "./constants.js";

export function handleMenu(player) {
  const autoCollectState = Boolean(
    player.getDynamicProperty(PROPERTIES.AUTO_COLLECT) ?? true,
  );
  const autoFarmState = Boolean(
    player.getDynamicProperty(PROPERTIES.AUTO_FARM) ?? true,
  );

  const isAdmin =
    (typeof player.isOp === "function"
      ? player.isOp()
      : player.isOp === true) || player.hasTag("admin");
  const maxHomesActual =
    world.getDynamicProperty(PROPERTIES.GLOBAL_MAX_HOMES) ?? 3; // 3 por defecto

  const form = new ModalFormData();
  form.title("§l§2MinePlus V1.5.3 Beta§r");

  form.toggle("Recolección Automática (Aspiradora)", {
    defaultValue: autoCollectState,
  });
  form.toggle("Replantado Automático", { defaultValue: autoFarmState });

  // El slider solo aparece si es admin. Saltos de 1 en 1, min 1, max 10.
  if (isAdmin) {
    form.slider(
      "Límite de Homes (Global del Servidor)",
      1, // Valor Mínimo
      10, // Valor Máximo
      {
        valueStep: 1,
        defaultValue: maxHomesActual,
      },
    );
  }

  player.sendMessage("§e[MinePlus] Cierra el chat para ver el menú...");

  function renderForm() {
    form
      .show(player)
      .then((response) => {
        if (response.canceled && response.cancelationReason === "UserBusy") {
          system.runTimeout(renderForm, 10);
          return;
        }

        if (response.canceled || !response.formValues) return;

        const [nuevoAutoCollect, nuevoAutoFarm, nuevoMaxHomes] =
          response.formValues;

        player.setDynamicProperty(PROPERTIES.AUTO_COLLECT, nuevoAutoCollect);
        player.setDynamicProperty(PROPERTIES.AUTO_FARM, nuevoAutoFarm);

        player.sendMessage(
          `§a[MinePlus] Autorecolección: ${nuevoAutoCollect ? "Activada" : "Desactivada"}.`,
        );
        player.sendMessage(
          `§a[MinePlus] Replantado: ${nuevoAutoFarm ? "Activado" : "Desactivado"}.`,
        );

        if (
          isAdmin &&
          nuevoMaxHomes !== undefined &&
          nuevoMaxHomes !== maxHomesActual
        ) {
          world.setDynamicProperty(PROPERTIES.GLOBAL_MAX_HOMES, nuevoMaxHomes);
          player.sendMessage(
            `§b[MinePlus] Límite global de Homes actualizado a: ${nuevoMaxHomes}.`,
          );
        }
      })
      .catch((error) => console.error("Error al mostrar el menú: ", error));
  }

  renderForm();
}
