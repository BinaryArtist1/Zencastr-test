export interface KeysResponse {
  ok: boolean;
  keys: string[];
}
export interface ValueResponse {
  ok: boolean;
  value?: any;
}
export interface OkResponse {
  ok: boolean;
}

function asConnErr(err: any) {
  // normalize network errors so client can detect them
  const e: any = err instanceof Error ? err : new Error(String(err));
  e.code = err?.code || err?.cause?.code || "ECONNREFUSED";
  e.name = "KaodisConnectionError";
  return e;
}

async function json<T>(p: Promise<Response>): Promise<T> {
  const r = await p;
  return r.json() as Promise<T>;
}

export class KaodisClient {
  constructor(private baseUrl: string) {}

  async set(key: string, value: any): Promise<OkResponse> {
    try {
      return await json<OkResponse>(
        fetch(this.baseUrl + "/set", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ key, value }),
        })
      );
    } catch (err) {
      throw asConnErr(err);
    }
  }

  async get(key: string): Promise<ValueResponse> {
    try {
      return await json<ValueResponse>(
        fetch(this.baseUrl + "/get/" + encodeURIComponent(key))
      );
    } catch (err) {
      throw asConnErr(err);
    }
  }

  async del(key: string): Promise<OkResponse> {
    try {
      return await json<OkResponse>(
        fetch(this.baseUrl + "/del/" + encodeURIComponent(key), {
          method: "DELETE",
        })
      );
    } catch (err) {
      throw asConnErr(err);
    }
  }

  async keys(): Promise<KeysResponse> {
    try {
      return await json<KeysResponse>(fetch(this.baseUrl + "/keys"));
    } catch (err) {
      throw asConnErr(err);
    }
  }
}
