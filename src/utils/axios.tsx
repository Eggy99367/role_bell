import axios from "axios";

const WORKER_URL = import.meta.env.VITE_WORKER_URL;

export async function verifyWebContent(url: string): Promise<{ ok: boolean, content: string }> {
  try {
    const response = await axios.get(WORKER_URL, { params: { url } });
    console.log(response.data.content);
    return {ok: response.data.ok === true, content: response.data.content};
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(`URL verify error: ${err.message}`);
    }
    return {ok: false, content: ""};
  }
}

export async function triggerCheck(trackerId: string): Promise<void> {
  try {
    await axios.get(`${WORKER_URL}/check`, { params: { id: trackerId } });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(`Trigger check error: ${err.message}`);
    }
  }
}
