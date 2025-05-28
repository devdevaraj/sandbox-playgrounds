export const cache = {};

export default function getDestination(path) {
 const parts = path.split("/");
 const id = parts[1];
 const vm = parts[2];
 return `${cache[id]}/${vm}`;
}

export function populate(id, ip) {
 if(!cache[id]) {
  cache[id] = `ws://${ip}:8080`;
 }
}