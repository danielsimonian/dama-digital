import { execSync, spawn } from 'child_process';
import os from 'os';

// Pega o IP local
function getLocalIP() {
  try {
    // Tenta en0 primeiro (Wi-Fi no Mac)
    return execSync('ipconfig getifaddr en0').toString().trim();
  } catch {
    try {
      // Fallback: en1
      return execSync('ipconfig getifaddr en1').toString().trim();
    } catch {
      // Fallback genérico (Linux/Windows)
      const interfaces = os.networkInterfaces();
      for (const iface of Object.values(interfaces)) {
        for (const config of iface) {
          if (config.family === 'IPv4' && !config.internal) {
            return config.address;
          }
        }
      }
      return null;
    }
  }
}

const ip = getLocalIP();

if (ip) {
  console.log(`   💻 Local:   http://localhost:3000`);
  console.log(`   📱 Celular: http://${ip}:3000\n`);
} else {
  console.log('\n⚠️  Não foi possível detectar o IP da rede.\n');
}

// Inicia o next dev normalmente
const next = spawn('next', ['dev', '--hostname', '0.0.0.0'], {
  stdio: 'inherit',
  shell: true,
});

next.on('exit', (code) => process.exit(code));