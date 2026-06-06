import { world, system, BlockPermutation, DynamicPropertiesDefinition } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";

// Cultivos soportados
const CONFIG_CULTIVOS = {
    "minecraft:wheat": { propiedad: "growth", max: 7 },
    "minecraft:carrots": { propiedad: "growth", max: 7 },
    "minecraft:potatoes": { propiedad: "growth", max: 7 },
    "minecraft:beetroot": { propiedad: "growth", max: 3 },
    "minecraft:nether_wart": { propiedad: "age", max: 3 },
    "minecraft:sweet_berry_bush": { propiedad: "growth", max: 3 },
    "minecraft:cocoa": { propiedad: "growth", max: 2 },
    "minecraft:torchflower_crop": { propiedad: "growth", max: 2 },
    "minecraft:pitcher_crop": { propiedad: "growth", max: 4 }
};

const DYNAMIC_PROP_KEY = "mineplus:auto_farm";
world.afterEvents.worldInitialize.subscribe((event) => {
    const def = new DynamicPropertiesDefinition();
    def.defineBoolean(DYNAMIC_PROP_KEY);
    event.registerDynamicProperties(def, "minecraft:player");
});

// Comando Menu
world.beforeEvents.chatSend.subscribe((eventData) => {
    const player = eventData.sender;
    const mensaje = eventData.message.trim().toLowerCase();

    if (mensaje === "!menu") {
        eventData.cancel = true;

        system.run(() => {
            abrirMenuConfiguracion(player);
        });
    }
});

// Menu
function abrirMenuConfiguracion(player) {
    const estadoActual = player.getDynamicProperty(DYNAMIC_PROP_KEY) ?? true;

    const form = new ModalFormData();
    form.title("§l§2MinePlus v0.0.1§r");
    form.toggle("Cosecha e Inventario Automático", estadoActual);

    form.show(player).then((response) => {
        if (response.canceled) return;

        const [nuevoEstado] = response.formValues;
        player.setDynamicProperty(DYNAMIC_PROP_KEY, nuevoEstado);

        if (nuevoEstado) {
            player.sendMessage("§a[MinePlus] Activado.");
        } else {
            player.sendMessage("§c[MinePlus] Desactivado.");
        }
    }).catch((error) => {
        console.error("Error al renderizar el formulario: ", error);
    });
}

world.beforeEvents.playerBreakBlock.subscribe((eventData) => {
    const player = eventData.player;
    const block = eventData.block;
    const dimension = block.dimension;
    const location = block.location;
   
    const estaActivo = player.getDynamicProperty(DYNAMIC_PROP_KEY) ?? true;
    if (!estaActivo) return;

    const equipo = player.getComponent("minecraft:equipment_inventory");
    const herramienta = equipo?.getEquipment("Mainhand");
    const itemsQueSoltara = block.permutation.getDrops(herramienta); // Respeta encantamientos

    // Autorrecolección
    if (itemsQueSoltara && itemsQueSoltara.length > 0) {
        eventData.cancel = true;

        const inventario = player.getComponent("minecraft:inventory")?.container;
        if (!inventario) return;

        for (const itemStack of itemsQueSoltara) {
            try {
                const itemSobrante = inventario.addItem(itemStack);
                // Inventario lleno
                if (itemSobrante && itemSobrante.amount > 0) {
                    dimension.spawnItem(itemSobrante, location);
                }
            } catch (e) {
                dimension.spawnItem(itemStack, location);
            }
        }

        // Replantado
        const configCultivo = CONFIG_CULTIVOS[block.typeId];
        if (configCultivo) {
            const estadosOriginales = block.permutation.getStates();
            const etapaActual = estadosOriginales[configCultivo.propiedad];

            // Replanta si el cultivo ha crecido por completo
            if (etapaActual === configCultivo.max) {
                const tipoDeBloque = block.typeId;

                system.run(() => {
                    const bloqueActual = dimension.getBlock(location);
                    if (!bloqueActual) return;

                    bloqueActual.setType("minecraft:air");

                    const nuevosEstados = { ...estadosOriginales };
                    nuevosEstados[configCultivo.propiedad] = 0;

                    bloqueActual.setType(tipoDeBloque);
                    const nuevaPermutacion = BlockPermutation.resolve(tipoDeBloque, nuevosEstados);
                    bloqueActual.setPermutation(nuevaPermutacion);
                    
                    // Sonido cosecha
                    dimension.runCommand(`playsound item.crop.plant @a[r=15] ${location.x} ${location.y} ${location.z} 0.4 1.1`);
                });
            } else {
                // Cultivo sin madurar
                system.run(() => {
                    const bloqueActual = dimension.getBlock(location);
                    if (bloqueActual) bloqueActual.setType("minecraft:air");
                });
            }
        } else {
            // Bloques no cultivables
            system.run(() => {
                const bloqueActual = dimension.getBlock(location);
                if (bloqueActual) bloqueActual.setType("minecraft:air");
            });
        }
    }
});