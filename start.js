// start.js
import { exec } from 'child_process'
//const { exec } = require('child_process');

const startVite = () => {
  exec('vite', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error starting Vite: ${error}`);
    } else {
      console.log(stdout);
    }
  });
};

const startProxyServer = () => {
  exec('node src/proxy-server.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error starting proxy-server.js: ${error}`);
    } else {
      console.log(stdout);
    }
  });
};

startVite();
startProxyServer();
