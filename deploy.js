const fs = require("fs");
const path = require("path");

const windowsUser = "Lara";
let appDataPath = process.env.LOCALAPPDATA;
if (!appDataPath && process.platform === "linux") {
  appDataPath = `/mnt/c/Users/${windowsUser}/AppData/Roaming`;
}

if (!appDataPath) {
  console.error("❌ Error: No se pudo determinar la ruta de AppData.");
  process.exit(1);
}

const targetPath = path.join(
  appDataPath,
  "Minecraft Bedrock",
  "Users",
  "Shared",
  "games",
  "com.mojang",
  "behavior_packs",
  "MinePlus",
);

console.log(`🚀 Iniciando despliegue hacia:\n📂 ${targetPath}\n`);

try {
  // Verificamos si existe la carpeta destino
  if (!fs.existsSync(path.dirname(targetPath))) {
    console.error(
      "❌ Error: La carpeta de destino no existe. Verifica la ruta.",
    );
    process.exit(1);
  }

  // Eliminamos la versión anterior si existe
  if (fs.existsSync(targetPath)) {
    console.log("🗑️ Eliminando versión anterior...");
    fs.rmSync(targetPath, {
      recursive: true,
      force: true,
      maxRetries: 5,
      retryDelay: 300,
    });
  }

  // Copiamos la nueva versión
  console.log("📦 Copiando nuevos archivos...");
  fs.cpSync("./src", targetPath, { recursive: true });

  console.log("✅ ¡Despliegue exitoso!");
  console.log("👉 Entra al juego y ejecuta /reload para aplicar los cambios.");
} catch (error) {
  console.error("\n❌ Ocurrió un error durante el despliegue:");
  if (error.code === "EBUSY") {
    console.error(
      "⚠️ Error: Minecraft tiene bloqueados los archivos. Cierra el mundo antes de hacer deploy.",
    );
  } else {
    console.error(error.message);
  }
  process.exit(1);
}
