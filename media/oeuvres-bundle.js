"use strict";
(() => {
  // src/bothside/RpcChannel.ts
  var RpcChannel = class {
    constructor(sender, receiver) {
      this.sender = sender;
      this.receiver = receiver;
      this.receiver(this.handleMessage.bind(this));
    }
    counter = 0;
    pending = /* @__PURE__ */ new Map();
    handlers = /* @__PURE__ */ new Map();
    handleMessage(msg) {
      if ("id" in msg && "method" in msg) {
        const handler = this.handlers.get(msg.method);
        if (handler) {
          Promise.resolve(handler(msg.params)).then((result) => {
            this.sender({ id: msg.id, result });
          });
        }
      } else if ("id" in msg && "result" in msg) {
        const cb = this.pending.get(msg.id);
        if (cb) {
          cb(msg.result);
          this.pending.delete(msg.id);
        }
      } else if ("method" in msg) {
        const handler = this.handlers.get(msg.method);
        if (handler) {
          handler(msg.params);
        }
      }
    }
    ask(method, params) {
      const id = this.counter++;
      const req = { id, method, params };
      this.sender(req);
      return new Promise((resolve) => {
        this.pending.set(id, resolve);
      });
    }
    notify(method, params) {
      const notif = { method, params };
      this.sender(notif);
    }
    on(method, handler) {
      this.handlers.set(method, handler);
    }
  };

  // src/webviews/RpcClient.ts
  function createRpcClient() {
    return new RpcChannel(
      (msg) => window.parent.postMessage(msg, "*"),
      (cb) => window.addEventListener("message", (event) => cb(event.data))
    );
  }

  // src/webviews/ClientItem.ts
  var ClientItem = class {
    data;
    static klass;
    static deserializeItems(items) {
      return items.map((item) => new this.klass(JSON.parse(item)));
    }
    constructor(itemData) {
      this.data = itemData;
    }
  };

  // src/webviews/oeuvres/Oeuvre.ts
  var Oeuvre = class _Oeuvre extends ClientItem {
    static minName = "oeuvre";
    static klass = _Oeuvre;
    // /**
    //  * Recherche d'œuvres par titre (optimisée)
    //  * Méthode spécifique Oeuvre
    //  */
    // protected static searchMatchingItems(searchTerm: string): CachedOeuvreData[] {
    //   const searchLower = StringNormalizer.toLower(searchTerm);
    //   return this.filter((oeuvre: any) => {
    //     return oeuvre.titresLookUp.some((titre: string) => {
    //       const res: boolean = titre.startsWith(searchLower);
    //       console.log("Le titre %s répond %s avec %s", oeuvre.titre_affiche, res, searchLower);
    //       return res ;
    //     });
    //   }) as CachedOeuvreData[];
    // }
  };
  var rpcOeuvre = createRpcClient();
  rpcOeuvre.on("populate", (params) => {
    const items = Oeuvre.deserializeItems(params.data);
    console.log("[CLIENT-Oeuvres] Items d\xE9s\xE9rialis\xE9s", items);
  });
  window.Oeuvre = Oeuvre;
})();
//# sourceMappingURL=oeuvres-bundle.js.map
