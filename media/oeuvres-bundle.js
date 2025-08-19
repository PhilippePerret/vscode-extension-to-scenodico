"use strict";
(() => {
  // src/webviews/CacheManager.ts
  var CacheManager = class {
    _cache = /* @__PURE__ */ new Map();
    _isBuilt = false;
    _isPrepared = false;
    prepareCacheWithData(rawData, prepareItemForCacheMethod, debugName) {
      this._cache.clear();
      rawData.forEach((item) => {
        this._cache.set(item.id, prepareItemForCacheMethod(item));
      });
      this._isPrepared = true;
      console.log(`Cache pr\xE9par\xE9 pour ${debugName}: ${this._cache.size} \xE9l\xE9ments`);
    }
    /**
     * Construit le cache à partir des données brutes
     * @param rawData - Données brutes de la base de données
     * @param prepareFunction - Fonction de préparation des données pour le cache
     * @param debugName - Nom pour les logs de debug
     */
    buildCache(finalizeCachedItemMethod, debugName) {
      this._cache.forEach((item) => {
        this._cache.set(item.id, finalizeCachedItemMethod(item));
      });
      this._isBuilt = true;
      console.log(`Cache construit pour ${debugName} \xE9l\xE9ments`);
    }
    /**
     * Récupère un élément par son ID
     * @param id - ID de l'élément à récupérer
     * @returns L'élément trouvé ou null
     */
    get(id) {
      return this._cache.get(id) || null;
    }
    /**
     * Récupère tous les éléments du cache sous forme d'array
     * @returns Array de tous les éléments cachés
     */
    getAll() {
      return Array.from(this._cache.values());
    }
    /**
     * Récupère toutes les clés (IDs) du cache
     * @returns Array de tous les IDs
     */
    getAllIds() {
      return Array.from(this._cache.keys());
    }
    /**
     * Itère sur tous les éléments du cache
     * @param callback - Fonction appelée pour chaque élément
     */
    forEach(callback) {
      this._cache.forEach((item, id) => callback(item, id));
    }
    /**
     * Filtre les éléments du cache
     * @param predicate - Fonction de filtrage
     * @returns Array des éléments qui correspondent au critère
     */
    filter(predicate) {
      const result = [];
      this._cache.forEach((item, id) => {
        if (predicate(item, id)) {
          result.push(item);
        }
      });
      return result;
    }
    /**
     * Cherche un élément selon un critère
     * @param predicate - Fonction de recherche
     * @returns Premier élément trouvé ou null
     */
    find(predicate) {
      for (const [id, item] of this._cache) {
        if (predicate(item, id)) {
          return item;
        }
      }
      return null;
    }
    /**
     * Vide le cache
     */
    clear() {
      this._cache.clear();
      this._isBuilt = false;
    }
    /**
     * Vérifie si le cache est construit
     */
    get isBuilt() {
      return this._isBuilt;
    }
    /**
     * Retourne la taille du cache
     */
    get size() {
      return this._cache.size;
    }
    /**
     * Vérifie si un ID existe dans le cache
     * @param id - ID à vérifier
     */
    has(id) {
      return this._cache.has(id);
    }
  };

  // src/webviews/CacheTypes.ts
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

  // src/webviews/CommonClassItem.ts
  var CommonClassItem = class {
    static _container = null;
    static _template = null;
    // Propriétés qui doivent être définies par les classes filles
    static minName;
    static ERRORS;
    // Cache manager - chaque classe fille doit fournir sa propre instance
    static get cacheManager() {
      throw new Error("cacheManager getter must be implemented by subclass");
    }
    static get container() {
      return this._container || (this._container = document.querySelector("main#items"));
    }
    static get template() {
      return this._template || (this._template = document.querySelector("template#item-template"));
    }
    static error(errorId) {
      const errors = this.ERRORS;
      return errors?.[errorId] || `Unknown error: ${errorId}`;
    }
    /**
     * Formate une propriété pour l'affichage
     * DOIT être surchargée par chaque classe fille
     */
    static formateProp(prop, value) {
      throw new Error("formateProp must be implemented by subclass");
    }
    /**
     * Prépare un item pour le cache de recherche
     * DOIT être surchargée par chaque classe fille
     */
    static prepareItemForCache(item) {
      throw new Error("prepareItemForCache must be implemented by subclass");
    }
    // Doit être écrasé par chaque classe fille (il semble que je doive
    // faire comme ça pour ne pas avoir d'erreur d'absence de méthode)
    static searchMatchingItems(searched) {
      throw new Error(`La m\xE9thode searchMatchingItems doit \xEAtre impl\xE9ment\xE9e par la classe ${this.name}`);
    }
    /**
     * Construit le cache à partir des données en base de données
     * Dans un premier temps, les données sont mises telle quelles
     * Puis, une fois qu'elles seront toutes chargées (pour tous les
     * éléments) on pourra préparer chaque item.
     */
    static buildCache(bddData) {
      console.log(`[${this.name}] buildCache called with ${bddData.length} items`);
      try {
        this.cacheManager.prepareCacheWithData(
          bddData,
          (item) => this.prepareItemForCache(item),
          this.minName
        );
        console.log(`[${this.name}] Cache built successfully, size: ${this.cacheSize}`);
      } catch (error) {
        console.error(`[${this.name}] Cache build failed:`, error);
        throw error;
      }
    }
    /**
     * Finalise les données mises en cache, maintenant qu'elles ont été
     * chargées pour tous les éléments
     */
    static finalizeCachedData() {
      const items = this.getAll();
      console.error(`[WEBVIEW] Il faut que je finalise les donn\xE9es ${this.minName}`);
      return this;
    }
    /**
     * Peuple le panneau de l'élément avec les données mises en cache
     */
    static populatePanel() {
      const container = this.container;
      container.innerHTML = "";
      const items = this.getAll();
      if (items.length === 0) {
        container.innerHTML = `<div class="no-${this.minName}">${this.error("no-items")}</div>`;
        return this;
      }
      items.forEach((item, index) => {
        const clone = this.template.content.cloneNode(true);
        const mainElement = clone.querySelector("." + this.minName);
        if (mainElement) {
          if (item.id) {
            mainElement.setAttribute("data-id", item.id);
          }
          mainElement.setAttribute("data-index", index.toString());
        }
        Object.keys(item).forEach((prop) => {
          const elements = clone.querySelectorAll(`[data-prop="${prop}"]`);
          elements.forEach((element) => {
            element.textContent = this.formateProp(prop, item[prop]);
          });
        });
        container.appendChild(clone);
      });
      this.afterDisplayItems();
      return this;
    }
    /**
     * Méthode qui observe le panneau, à commencer par la captation des
     * touches et le champ de recherche/filtrage
     * TODO Mettre un picto filtrage devant le champ
     * 
     */
    static observePanel() {
      const searchInput = document.querySelector("#search-input");
      const DomItemsState = {};
      this.getAll().forEach((item) => DomItemsState[item.id] = "block");
      const filterEntries = () => {
        const searchTerm = searchInput.value.trim();
        const allItems = this.getAll();
        const allCount = allItems.length;
        console.log(`[SEARCH ENTRY] Filtering with term: "${searchTerm}", total entries: ${allCount}`);
        const matchingItems = this.searchMatchingItems(searchTerm);
        const matchingCount = matchingItems.length;
        console.log("[SEARCH ENTRY] Cache search found %i matches / %i", matchingCount, allCount);
        const matchingIds = new Set(matchingItems.map((item) => item.id));
        allItems.forEach((item) => {
          const display = matchingIds.has(item.id) ? "block" : "none";
          if (DomItemsState[item.id] !== display) {
            const domObj = document.querySelector(`main#items > div.item[data-id="${item.id}"]`);
            domObj.style.display = display;
            DomItemsState[item.id] = display;
          }
        });
        console.log(`[SEARCH ${this.minName}] Result:  %i shown, %i hidden`, matchingCount, allCount - matchingCount);
      };
      searchInput.addEventListener("input", filterEntries);
      searchInput.addEventListener("keyup", filterEntries);
      return this;
    }
    /**
     * Récupère un élément par son ID
     * @param id - ID de l'élément à récupérer
     */
    static get(id) {
      if (this.cacheManager.isBuilt === true) {
        console.info("cache manager des oeuvre", this.cacheManager);
        throw new Error("Pour s'arr\xEAter l\xE0");
      }
      return this.cacheManager.get(id);
    }
    /**
     * Récupère tous les éléments du cache
     */
    static getAll() {
      return this.cacheManager.getAll();
    }
    /**
     * Itère sur tous les éléments du cache
     * @param callback - Fonction appelée pour chaque élément
     */
    static forEach(callback) {
      this.cacheManager.forEach(callback);
    }
    /**
     * Filtre les éléments du cache
     * @param predicate - Fonction de filtrage
     */
    static filter(predicate) {
      return this.cacheManager.filter(predicate);
    }
    /**
     * Efface le cache
     */
    static clearCache() {
      this.cacheManager.clear();
    }
    /**
     * Vérifie si le cache est construit
     */
    static get isCacheBuilt() {
      return this.cacheManager.isBuilt;
    }
    /**
     * Retourne la taille du cache
     */
    static get cacheSize() {
      return this.cacheManager.size;
    }
    /**
     * Récupère le cache (pour compatibilité avec les tests existants)
     * @deprecated Utiliser les nouvelles méthodes get(), getAll(), etc.
     */
    static get searchCache() {
      const manager = this.cacheManager;
      return manager.isBuilt ? manager.getAll() : null;
    }
    /**
     * Post-traitement après affichage des éléments
     * Doit être surclassé par les méthodes propres aux différents panneaux
     */
    static afterDisplayItems() {
      return true;
    }
  };

  // src/webviews/oeuvres/Oeuvre.ts
  var Oeuvre = class extends CommonClassItem {
    static minName = "oeuvre";
    static REG_ARTICLES = /\b(an|a|the|le|la|les|l'|de|du)\b/i;
    // Cache manager spécifique aux oeuvres
    static _cacheManagerInstance = new CacheManager();
    static get cacheManager() {
      return this._cacheManagerInstance;
    }
    // pour test
    static get cacheManagerForced() {
      return this.cacheManager;
    }
    static ERRORS = {
      "no-items": "Aucune \u0153uvre dans la base, bizarrement\u2026"
    };
    static formateProp(prop, value) {
      switch (prop) {
        case "annee":
          return value ? value.toString() : "";
        default:
          return value || "";
      }
    }
    /**
     * Prépare une œuvre pour le cache de recherche
     * SEULE méthode spécifique - le reste hérite de CommonClassItem !
     */
    static prepareItemForCache(oeuvre) {
      const titres = [];
      if (oeuvre.titre_francais) {
        titres.push(StringNormalizer.rationalize(oeuvre.titre_francais));
      }
      if (oeuvre.titre_original) {
        titres.push(StringNormalizer.rationalize(oeuvre.titre_original));
      }
      if (oeuvre.titre_affiche) {
        titres.push(StringNormalizer.rationalize(oeuvre.titre_affiche));
      }
      titres.forEach((titre) => {
        if (titre.match(this.REG_ARTICLES)) {
          titres.push(titre.replace(this.REG_ARTICLES, ""));
        }
      });
      const uniqTitres = [];
      titres.forEach((titre) => {
        if (uniqTitres.includes(titre)) {
          return;
        }
        uniqTitres.push(titre);
      });
      const titresLookUp = uniqTitres.map((titre) => StringNormalizer.toLower(titre));
      return {
        id: oeuvre.id,
        titre_affiche: oeuvre.titre_affiche,
        titre_original: oeuvre.titre_original,
        titre_francais: oeuvre.titre_francais,
        titres,
        titresLookUp,
        annee: oeuvre.annee,
        auteurs: oeuvre.auteurs
      };
    }
    /**
     * Recherche d'œuvres par titre (optimisée)
     * Méthode spécifique Oeuvre
     */
    static searchMatchingItems(searchTerm) {
      const searchLower = StringNormalizer.toLower(searchTerm);
      return this.filter((oeuvre) => {
        return oeuvre.titresLookUp.some((titre) => {
          const res = titre.startsWith(searchLower);
          console.log("Le titre %s r\xE9pond %s avec %s", oeuvre.titre_affiche, res, searchLower);
          return res;
        });
      });
    }
  };
})();
//# sourceMappingURL=oeuvres-bundle.js.map
