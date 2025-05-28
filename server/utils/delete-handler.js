import axios from "axios";

export default async function removeContainer(name) {
 axios.delete(`http://localhost:8080/bridges/${name}`);
}