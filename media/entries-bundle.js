"use strict";
(() => {
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
          value = this.formateProp(item, prop, value);
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
    // Si l'élément nécessite un traitement particulier de ses propriétés, il doit
    // implémenter cette méthode
    // (pour le moment, c'est seulement le cas pour les exemples)
    static formateProp(item, prop, value) {
      return String(value);
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
      console.log("Message re\xE7u dans le 'notify' du RpcChannel", method, params);
      const notif = { method, params };
      this.sender(notif);
    }
    on(method, handler) {
      console.log("Message re\xE7u dans le 'on' du RpcChannel", method, handler);
      this.handlers.set(method, handler);
    }
  };

  // src/webviews/RpcClient.ts
  function createRpcClient() {
    const vscode = acquireVsCodeApi();
    return new RpcChannel(
      // sender : envoie vers l'extension
      (msg) => vscode.postMessage(msg),
      // receiver : reçoit les messages de l'extension
      (cb) => window.addEventListener("message", (event) => cb(event.data))
    );
  }

  // src/webviews/models/Entry.ts
  var Entry = class _Entry extends ClientItem {
    static minName = "entry";
    static klass = _Entry;
    static get(entryId) {
      const entryData = PanelEntry.allItems.find((item) => item.data.id === entryId);
      const entry = new _Entry(entryData.data);
      console.log("Entr\xE9e trouv\xE9e : ", entry);
      return entry;
    }
    constructor(data) {
      super(data);
      this.id = data.id;
    }
    _obj = void 0;
    id;
    scrollTo() {
      this.isNotVisible && this.setVisible();
      this.obj.scrollIntoView({ behavior: "auto", block: "center" });
      return this;
    }
    select() {
      this.obj.classList.add("selected");
      return this;
    }
    setVisible() {
      this.obj.style.display = "block";
      this.data.display = "block";
    }
    get isNotVisible() {
      return this.data.display === "none";
    }
    get obj() {
      return this._obj || (this._obj = document.querySelector(`main#items > div[data-id="${this.id}"]`));
    }
  };
  var PanelEntry = class extends ClientPanel {
    static minName = "entry";
    static titName = "Entry";
    static get allItems() {
      return Entry.allItems;
    }
    // Méthode de filtrage des entrées
    // Retourne celles qui commencent par +search+
    static searchMatchingItems(searched) {
      const prefixLower = StringNormalizer.toLower(searched);
      const prefixRa = StringNormalizer.rationalize(searched);
      return this.filter((entryData) => {
        return entryData.entree_min.startsWith(prefixLower) || entryData.entree_min_ra.startsWith(prefixRa);
      });
    }
    // Scroll jusqu'à l'élément et le sélectionne
    static scrollToAndSelectEntry(entryId) {
      Entry.get(entryId).scrollTo().select();
    }
  };
  var RpcEntry = createRpcClient();
  RpcEntry.on("populate", (params) => {
    const items = Entry.deserializeItems(params.data);
    console.log("[CLIENT Entry] Items d\xE9s\xE9rialis\xE9", items);
    PanelEntry.populate(items);
  });
  RpcEntry.on("display-entry", (params) => {
    console.log("[CLIENT] Je dois afficher l'entr\xE9e '%s'", params.entry_id);
    PanelEntry.scrollToAndSelectEntry(params.entry_id);
  });
  window.Entry = Entry;
})();
//# sourceMappingURL=entries-bundle.js.map
