import { system } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { DYNAMIC_PROP_KEY } from "./main.js";

export function handleMenu(player) {
  const estadoActual = player.getDynamicProperty(DYNAMIC_PROP_KEY) ?? true;

  const form = new ModalFormData();
  form.title("§l§2MinePlus V1 Release§r");
  form.toggle("Cosecha e Inventario Automático", {
    defaultValue: !!estadoActual,
  });

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

        const [nuevoEstado] = response.formValues;
        player.setDynamicProperty(DYNAMIC_PROP_KEY, nuevoEstado);

        if (nuevoEstado) {
          player.sendMessage("§a[MinePlus] Activado.");
        } else {
          player.sendMessage("§c[MinePlus] Desactivado.");
        }
      })
      .catch((error) => {
        console.error("Error al renderizar el formulario: ", error);
      });
  }

  renderForm();
}
