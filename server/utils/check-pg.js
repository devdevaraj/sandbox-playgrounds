import net from 'net';

export default function waitForPort(host, port, timeout = 30000, interval = 300) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const checkPort = () => {
      const socket = net.createConnection(port, host);

      socket.once('connect', () => {
        socket.end();
        resolve(true); // Port is open
      });

      socket.once('error', () => {
        socket.destroy();
        if (Date.now() - startTime > timeout) {
          reject(new Error('Timeout waiting for port'));
        } else {
          setTimeout(checkPort, interval); // Retry after interval
        }
      });
    };

    checkPort();
  });
}
