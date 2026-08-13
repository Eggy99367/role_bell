import axios from "axios";

const WORKER_URL = import.meta.env.VITE_WORKER_URL;

export async function verifyWebContent(url: string): Promise<boolean> {
  try {
    const response = await axios.get(WORKER_URL, { params: { url } });
    console.log(response.data.content);
    return response.data.ok === true;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(`URL verify error: ${err.message}`);
    }
    return false;
  }
}
