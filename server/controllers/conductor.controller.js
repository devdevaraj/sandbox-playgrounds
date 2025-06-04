import axios from "axios";
import JSONDB from "../utils/db.js";
import { pgdb } from "./bender.controller.js";

export const openports = new JSONDB("openports")

const ip_map = {
 "vm1": "172.16.0.2",
 "vm2": "172.16.0.3",
 "vm3": "172.16.0.4",
 "vm4": "172.16.0.5",
 "vm5": "172.16.0.6",
};

export async function openPort(req, res) {
 try {
  const pg = pgdb.find({ userid: req.user.id, _id: req.params.id });
  const vm = req.params.vm;
  const port = req.params.port;
  const pg_ip = pg.ip;
  const pg_name = pg.post_name;
  const domain = process.env.PORT_DOMAIN;
  const short_id = simpleHash(vm, port);
  const subdomain = `${pg_name}-${short_id}.${domain}.`
  const DNSresponse = await axios.patch(`http://127.0.0.1:8081/api/v1/servers/localhost/zones/${domain}.`, {
   rrsets: [
    {
     name: subdomain,
     type: "A",
     changetype: "REPLACE",
     records: [
      {
       content: pg_ip,
       disabled: false
      }
     ],
     ttl: 3600
    }
   ]
  }, { headers: { "X-API-Key": process.env.PDNS_KEY } });

  if (DNSresponse.status !== 204) throw new Error("DNS Update failed");

  const containerResponse = await axios.post(`http://${pg_ip}:8080/open-close-port`, {
   key: short_id,
   target: `${ip_map[vm]}:${port}`
  });

  if (containerResponse.status !== 200) throw new Error("Failed to open port");
  const exists = openports.find({ subdomain });
  if (exists) {
   openports.update(exists._id, { pg_id: pg._id, subdomain: subdomain, vm, ip: pg_ip, port, short_id });
  } else {
   openports.write({ pg_id: pg._id, subdomain: subdomain, vm, ip: pg_ip, port, short_id });
  }
  res.json({ msg: "Port opened" });
 } catch (error) {
  console.log(error);
  res.json({ msg: "error" });
 }
}

export async function closePort(req, res) {
 try {
  const openport = openports.find({ _id: req.params.id });
  const domain = process.env.PORT_DOMAIN;
  const DNSresponse = await axios.patch(`http://127.0.0.1:8081/api/v1/servers/localhost/zones/${domain}.`, {
   rrsets: [
    {
     name: openport.subdomain,
     type: "A",
     changetype: "DELETE"
    }
   ]
  }, { headers: { "X-API-Key": process.env.PDNS_KEY } });
  if (DNSresponse.status !== 204) throw new Error("DNS Update failed");

  const containerResponse = await axios.delete(`http://${openport.ip}:8080/open-close-port/${openports.short_id}`);
  if (containerResponse.status !== 200) throw new Error("Failed to open port");

  openports.deleteOne(req.params.id);
  res.json({ msg: "Port closed" });
 } catch (error) {
  console.log(error);
  res.json({ msg: "error" });
 }
}

export async function listPort(req, res) {
 try {
  const id = req.params.id;
  const portList = openports.findMany({ pg_id: id });
  res.json({ msg: "Port list", list: portList });
 } catch (error) {
  console.log(error);
  res.json({ msg: "error" });
 }
}

export async function pgPortClose(pg_id) {
 try {
  const openport = openports.findMany({ pg_id });
  const domain = process.env.PORT_DOMAIN;

  for (const pp of openport) {
   const DNSresponse = await axios.patch(`http://127.0.0.1:8081/api/v1/servers/localhost/zones/${domain}.`, {
    rrsets: [
     {
      name: pp?.subdomain,
      type: "A",
      changetype: "DELETE"
     }
    ]
   }, { headers: { "X-API-Key": process.env.PDNS_KEY } });
   if (DNSresponse.status !== 204) throw new Error("DNS Update failed");
  }
  openports.deleteByField("pg_id", pg_id);
 } catch (error) {
  console.log(error);
 }
}

function simpleHash(value1, value2) {
 const str = `${value1}::${value2}`
 let hash = 0;
 for (let i = 0; i < str.length; i++) {
  hash = (hash << 5) - hash + str.charCodeAt(i);
  hash |= 0;
 }
 return Math.abs(hash).toString(36);
}