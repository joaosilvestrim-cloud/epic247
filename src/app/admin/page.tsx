import { redirect } from "next/navigation";

// O admin oficial é o 2.0. O do Ciclo 1 fica em /admin/antigo, só para consulta.
export default function AdminRaiz() {
  redirect("/admin/epic");
}
