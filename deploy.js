const fs = require('fs');
const path = require('path');

let appDataPath = process.env.LOCALAPPDATA;
if (!appDataPath && process.platform === 'linux') {
    const windowsUser = 'Lara'; 
    appDataPath = `/mnt/c/Users/${windowsUser}/AppData/Local`;
}

if (!appDataPath) {
    console.error("No se pudo determinar la ruta de AppData.");
    process.exit(1);
}

// Ruta de Minecraft
const targetPath = path.join(
    appDataPath,
    'Packages',
    'Microsoft.MinecraftUWP_8wekyb3d8bbwe',
    'LocalState',
    'games',
    'com.mojang',
    'development_behavior_packs',
    'MinePlus'
);
console.log('Compilando...');

try {
    // Sustituye versiones anteriores
    if (fs.existsSync(targetPath)) {
        fs.rmSync(targetPath, { recursive: true, force: true });
    }
    
    // Copia el mod al directorio de Minecraft
    fs.cpSync('./src', targetPath, { recursive: true });
    console.log('Mod Listo.');
} catch (error) {
    console.error('Ocurrió un error:', error.message);
}