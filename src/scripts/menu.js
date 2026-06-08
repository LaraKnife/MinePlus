import { system } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { DYNAMIC_PROP_KEY } from "./main.js";

export function handleMenu(player) {
  const estadoActual = player.getDynamicProperty(DYNAMIC_PROP_KEY) ?? true;

  const form = new ModalFormData();
  form.title("§l§2MinePlus v0.0.2§r");
  form.toggle("Cosecha e Inventario Automático", estadoActual);

  form
    .show(player)
    .then((response) => {
      if (response.canceled) return;

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
