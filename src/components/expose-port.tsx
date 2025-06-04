import axios from "axios";
import { memo, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

function ExposePort({ vmID }: { vmID: string }) {
 const [popup, setPopup] = useState(false);
 const [ports, setPorts] = useState<{ [key: string]: string }[]>([]);
 const [port, setPort] = useState<number | null>(null);
 const { id } = useParams();

 const updatePortList = () => {
  axios.get(`/api/v1/port/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }).then(res => {
   setPorts(res.data.list);
  }).catch(console.log);
 }
 useEffect(() => {
  updatePortList();
 }, [vmID]);

 const exposeHandler = () => {
  axios.post(`/api/v1/port/${id}/${vmID}/${port}`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
   .then(() => {
    toast.success("Port added");
    updatePortList();
   }).catch(console.log);
 }

 const deleteHandler = (id: string) => {
  axios.delete(`/api/v1/port/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
   .then(() => {
    toast.success("Port deleted");
    updatePortList();
   }).catch(console.log);
 }

 console.log(ports, port);

 return (
  <>
   <button onClick={() => setPopup(!popup)}>
    port
   </button>
   {popup && <main className="fixed inset-0 z-30 bg-[#2226] flex items-center justify-center">
    <section className="h-4/6 w-4/6 bg-blue-950 rounded-lg relative shadow-2xl p-4">
     <aside onClick={() => setPopup(!popup)} className="absolute top-2 right-4">
      X
     </aside>
     <section>
      <aside className="flex">
       <input
        className="bg-white text-black"
        type="number"
        onInput={e => setPort(Number((e.target as HTMLInputElement).value))} />
       <button
        className="bg-blue-700"
        onClick={exposeHandler}>
        expose
       </button>
      </aside>
      <aside>
       <table>
        <thead>
         <tr>
          <th>No</th>
          <th>VM</th>
          <th>URL</th>
          <th>port</th>
          <th>Action</th>
         </tr>
        </thead>
        <tbody>
         {ports.map((e, i) => (
          <tr key={i}>
           <td>{i + 1}</td>
           <td>{e.vm}</td>
           <td>{e.subdomain}</td>
           <td>{e.port}</td>
           <td>
            <button onClick={() => deleteHandler(e._id)}>delete</button>
           </td>
          </tr>
         ))}
        </tbody>
       </table>
      </aside>
     </section>
    </section>
   </main>}
  </>
 );
}

export default memo(ExposePort);