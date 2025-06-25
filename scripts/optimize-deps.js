/**
 * Script para optimizar dependencias y purgar módulos no utilizados
 * Ejecuta este script con: node scripts/optimize-deps.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ruta al directorio raíz del proyecto
const rootDir = path.resolve(__dirname, '..');

// Función para ejecutar comandos y mostrar output
function executeCommand(command) {
  console.log(`Ejecutando: ${command}`);
  try {
    const output = execSync(command, { 
      cwd: rootDir, 
      stdio: 'pipe', 
      encoding: 'utf-8'
    });
    return { success: true, output };
  } catch (error) {
    console.error(`Error al ejecutar: ${command}`);
    console.error(error.message);
    return { success: false, error: error.message };
  }
}

// Analizar el archivo package.json
function analyzePackageJson() {
  const packageJsonPath = path.join(rootDir, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.error('No se encontró el archivo package.json');
    return null;
  }
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    return packageJson;
  } catch (error) {
    console.error('Error al analizar package.json:', error);
    return null;
  }
}

// Purgar cache de npm
function purgeNpmCache() {
  console.log('Purgando caché de npm...');
  return executeCommand('npm cache clean --force');
}

// Eliminar node_modules
function removeNodeModules() {
  const nodeModulesPath = path.join(rootDir, 'node_modules');
  
  if (fs.existsSync(nodeModulesPath)) {
    console.log('Eliminando node_modules...');
    try {
      if (process.platform === 'win32') {
        executeCommand('rmdir /s /q node_modules');
      } else {
        executeCommand('rm -rf node_modules');
      }
      return true;
    } catch (error) {
      console.error('Error al eliminar node_modules:', error);
      return false;
    }
  }
  
  return true;
}

// Eliminar archivos de bloqueo
function removeLockFiles() {
  const lockFiles = [
    path.join(rootDir, 'package-lock.json'),
    path.join(rootDir, 'yarn.lock'),
    path.join(rootDir, 'pnpm-lock.yaml')
  ];
  
  lockFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`Eliminando ${path.basename(file)}...`);
      try {
        fs.unlinkSync(file);
      } catch (error) {
        console.error(`Error al eliminar ${path.basename(file)}:`, error);
      }
    }
  });
}

// Instalar dependencias con producción optimizada
function installDependencies() {
  console.log('Instalando dependencias optimizadas...');
  return executeCommand('npm install --prefer-offline --no-audit --production=false');
}

// Ejecutar auditoría de seguridad
function runSecurityAudit() {
  console.log('Ejecutando auditoría de seguridad...');
  return executeCommand('npm audit fix');
}

// Optimizar para producción
function optimizeForProduction() {
  console.log('Optimizando para producción...');
  // Construir con optimizaciones
  const buildResult = executeCommand('npm run build');
  
  if (buildResult.success) {
    console.log('Construcción completada con éxito');
  } else {
    console.error('Error en la construcción');
    return false;
  }
  
  return true;
}

// Función principal
async function main() {
  console.log('=== Iniciando optimización de dependencias ===');
  
  const packageJson = analyzePackageJson();
  if (!packageJson) {
    console.error('No se pudo analizar el package.json, abortando...');
    return;
  }
  
  // 1. Purgar caché
  purgeNpmCache();
  
  // 2. Eliminar node_modules y archivos de bloqueo
  removeNodeModules();
  removeLockFiles();
  
  // 3. Instalar dependencias frescas
  const installResult = installDependencies();
  if (!installResult.success) {
    console.error('Error al instalar dependencias');
    return;
  }
  
  // 4. Ejecutar auditoría de seguridad
  runSecurityAudit();
  
  // 5. Optimizar para producción
  const productionReady = optimizeForProduction();
  
  if (productionReady) {
    console.log('\n=== Optimización completada con éxito ===');
    console.log('El proyecto ahora está optimizado para producción');
  } else {
    console.error('\n=== La optimización no se completó correctamente ===');
    console.log('Revisa los errores anteriores y vuelve a intentarlo');
  }
}

// Ejecutar la función principal
main().catch(error => {
  console.error('Error no controlado:', error);
  process.exit(1);
}); 