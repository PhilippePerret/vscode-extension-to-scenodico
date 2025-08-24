"use strict";
(() => {
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

  // src/webviews/ClientPanel.ts
  var ClientPanel = class {
    static _container;
    static _itemTemplate;
    static get container() {
      return this._container || (this._container = document.querySelector("main#items"));
    }
    static get itemTemplate() {
      return this._itemTemplate || (this._itemTemplate = document.querySelector("template#item-template"));
    }
    static cloneItemTemplate() {
      return this.itemTemplate.content.cloneNode(true);
    }
  };

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

  // src/webviews/entries/Entry.ts
  var Entry = class _Entry extends ClientItem {
    static minName = "entry";
    static klass = _Entry;
    // /**
    //  * Recherche d'entrées par préfixe (optimisée)
    //  * Méthode spécifique Entry
    //  */
    // protected static searchMatchingItems(prefix: string): CachedEntryData[] {
    //   const prefixLower = StringNormalizer.toLower(prefix);
    //   const prefixRa = StringNormalizer.rationalize(prefix);
    //   return this.filter((entry: any) => {
    //     return entry.entree_min.startsWith(prefixLower) || 
    //            entry.entree_min_ra.startsWith(prefixRa);
    //   }) as CachedEntryData[];
    // }
  };
  var PanelEntry = class extends ClientPanel {
    static minName = "entry";
    static populate(items) {
      items.forEach((item, index) => {
        console.log("Je dois \xE9crire l'item", item.data);
        const data = item.data;
        const clone = this.cloneItemTemplate();
        const mainElement = clone.querySelector("." + this.minName);
        if (mainElement) {
          mainElement.setAttribute("data-id", data.id);
          mainElement.setAttribute("data-index", index.toString());
        }
        Object.keys(data).forEach((prop) => {
          const value = data[prop];
          clone.querySelectorAll(`[data-prop="${prop}"]`).forEach((element) => {
            if (value.startsWith("<")) {
              element.innerHTML = value;
            } else {
              element.textContent = value;
            }
          });
        });
        this.container && this.container.appendChild(clone);
      });
    }
  };
  var RpcEntry = createRpcClient();
  RpcEntry.on("populate", (params) => {
    const items = Entry.deserializeItems(params.data);
    console.log("[CLIENT Entry] Items d\xE9s\xE9rialis\xE9", items);
    PanelEntry.populate(items);
  });
  window.Entry = Entry;
})();
//# sourceMappingURL=entries-bundle.js.map
