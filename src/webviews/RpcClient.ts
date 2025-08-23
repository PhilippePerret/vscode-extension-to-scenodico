import { RpcChannel } from "../bothside/RpcChannel";

export function createRpcClient() {
  return new RpcChannel(
    (msg) => window.parent.postMessage(msg, "*"),
    (cb) => window.addEventListener("message", (event) => cb(event.data))
  );
}
