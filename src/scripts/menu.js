import { system, world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { PROPERTIES } from "./constants.js";

export function handleMenu(player) {
  const autoCollectState =
    player.getDynamicProperty(PROPERTIES.AUTO_COLLECT) ?? true;
  const autoFarmState = player.getDynamicProperty(PROPERTIES.AUTO_FARM) ?? true;

  const isAdmin = player.isOp();
  const maxHomesActual =
    world.getDynamicProperty(PROPERTIES.GLOBAL_MAX_HOMES) ?? 3; // 3 por defecto

  const form = new ModalFormData();
  form.title("§l§2MinePlus V1.5.0 Beta§r");

  form.toggle("Recolección Automática (Aspiradora)", autoCollectState);
  form.toggle("Replantado Automático", autoFarmState);

  // El slider solo aparece si es admin. Saltos de 1 en 1, min 1, max 10.
  if (isAdmin) {
    form.slider(
      "Límite de Homes (Global del Servidor)",
      1,
      10,
      1,
      maxHomesActual,
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

        // Desestructuramos en orden: [toggle1, toggle2, slider(si existe)]
        const [nuevoAutoCollect, nuevoAutoFarm, nuevoMaxHomes] =
          response.formValues;

        // Guardamos configuraciones individuales
        player.setDynamicProperty(AUTO_COLLECT_KEY, nuevoAutoCollect);
        player.setDynamicProperty(AUTO_FARM_KEY, nuevoAutoFarm);

        player.sendMessage(
          `§a[MinePlus] Autorecolección: ${nuevoAutoCollect ? "Activada" : "Desactivada"}.`,
        );
        player.sendMessage(
          `§a[MinePlus] Replantado: ${nuevoAutoFarm ? "Activado" : "Desactivado"}.`,
        );

        // Guardamos configuración global si es Admin y hubo un cambio
        if (
          isAdmin &&
          nuevoMaxHomes !== undefined &&
          nuevoMaxHomes !== maxHomesActual
        ) {
          world.setDynamicProperty(GLOBAL_MAX_HOMES, nuevoMaxHomes);
          player.sendMessage(
            `§b[MinePlus] Límite global de Homes actualizado a: ${nuevoMaxHomes}.`,
          );
        }
      })
      .catch((error) => console.error("Error al mostrar el menú: ", error));
  }

  renderForm();
}
