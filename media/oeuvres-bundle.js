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
    static allItems;
    static deserializeItems(items) {
      this.allItems = items.map((item) => new this.klass(JSON.parse(item)));
      return this.allItems;
    }
    constructor(itemData) {
      this.data = itemData;
    }
  };

  // src/webviews/ClientPanel.ts
  var ClientPanel = class {
    static minName;
    static titName;
    static _container;
    static _itemTemplate;
    static _searchInput;
    static get allItems() {
      return [];
    }
    static get container() {
      return this._container || (this._container = document.querySelector("main#items"));
    }
    static get itemTemplate() {
      return this._itemTemplate || (this._itemTemplate = document.querySelector("template#item-template"));
    }
    static get searchInput() {
      return this._searchInput || (this._searchInput = document.querySelector("#search-input"));
    }
    static cloneItemTemplate() {
      return this.itemTemplate.content.cloneNode(true);
    }
    static populate(items) {
      this.container.innerHTML = "";
      items.forEach((item, index) => {
        const data = item.data;
        const clone = this.cloneItemTemplate();
        const mainElement = clone.querySelector("." + this.minName);
        if (mainElement) {
          mainElement.setAttribute("data-id", data.id);
          mainElement.setAttribute("data-index", index.toString());
        }
        Object.keys(data).forEach((prop) => {
          let value = data[prop];
          value = String(value);
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
      this.afterDisplayItems();
      this.observePanel();
    }
    // Méthode appelée après l'affichage des éléments et avant
    // l'observation du panneau
    static afterDisplayItems() {
    }
    // Attention, certains panneaux ont leur propre méthode, qui peut 
    // aussi appeler celle-ci
    static observePanel() {
      const Input = this.searchInput;
      Input.addEventListener("input", this.filterItems.bind(this));
      Input.addEventListener("keyup", this.filterItems.bind(this));
    }
    static filterItems(ev) {
      const Input = this.searchInput;
      const searched = Input.value.trim();
      const allCount = this.allItems.length;
      const matchingItems = this.searchMatchingItems(searched);
      const matchingCount = matchingItems.length;
      console.log('[CLIENT %s] Filtering with "%s" - %i founds / %i', this.titName, searched, matchingCount, allCount);
      const matchingIds = new Set(matchingItems.map((item) => item.data.id));
      this.allItems.forEach((item) => {
        const display = matchingIds.has(item.data.id) ? "block" : "none";
        if (item.data.display !== display) {
          const obj = document.querySelector(`main#items > div.item[data-id="${item.data.id}"]`);
          obj.style.display = display;
          item.data.display = display;
          item.data.selected = false;
        }
        ;
      });
    }
    // Méthode de filtrage qui reçoit les évènements Input
    // Fonction de recherche qui doit être surclassée par toutes les
    // classes héritière
    static searchMatchingItems(search) {
      return [];
    }
    static filter(filtre) {
      const result = [];
      this.allItems.forEach((item) => {
        filtre(item.data) && result.push(item);
      });
      return result;
    }
  };

  // src/bothside/StringUtils.ts
  var StringNormalizer = class {
    /**
     * Normalise une chaîne en minuscules
     */
    static toLower(text) {
      return text.toLowerCase();
    }
    /**
     * Normalise une chaîne en supprimant les accents et diacritiques
     * TODO: À améliorer avec une vraie fonction de normalisation
     */
    static rationalize(text) {
      return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "");
    }
  };

  // src/webviews/models/Oeuvre.ts
  var Oeuvre = class _Oeuvre extends ClientItem {
    static minName = "oeuvre";
    static klass = _Oeuvre;
  };
  var PanelOeuvre = class extends ClientPanel {
    static minName = "oeuvre";
    static titName = "Oeuvre";
    static get allItems() {
      return Oeuvre.allItems;
    }
    static searchMatchingItems(searched) {
      const searchLower = StringNormalizer.toLower(searched);
      return this.filter((oeuvreData) => {
        return oeuvreData.titresLookUp.some((titre) => {
          return titre.substring(0, searchLower.length) === searchLower;
        });
      });
    }
  };
  var rpcOeuvre = createRpcClient();
  rpcOeuvre.on("populate", (params) => {
    const items = Oeuvre.deserializeItems(params.data);
    console.log("[CLIENT-Oeuvres] Items d\xE9s\xE9rialis\xE9s", items);
    PanelOeuvre.populate(items);
  });
  window.Oeuvre = Oeuvre;
})();
//# sourceMappingURL=oeuvres-bundle.js.map
