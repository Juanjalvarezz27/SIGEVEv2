import { def } from "./app/initDb";

//Funcion def que se definio para la data del initDb
export async function register() {
  await def();
}
