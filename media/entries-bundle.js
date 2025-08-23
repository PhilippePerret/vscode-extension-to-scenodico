"use strict";
(() => {
  // src/bothside/UniversalDicoElement.ts
  var UniversalDicoElement = class {
    // autorise `this[k]' dans le constructeur
    // Le constructeur reçoit toujours un objet contenant
    // Les données. Dans un cas (extension) ce sont les données
    // provenant de la base de données, dans l'autre cas (webview)
    // ce sont les données cachées et préparées
    constructor(data) {
      for (const k in data) {
        if (Object.prototype.hasOwnProperty.call(data, k)) {
          this[k] = data[k];
        }
      }
    }
  };

  // src/bothside/UOeuvre.ts
  var UOeuvre = class extends UniversalDicoElement {
    static names = {
      min: { sing: "\u0153uvre", plur: "\u0153uvres" },
      maj: { sing: "\u0152UVRE", plur: "\u0152UVRES" },
      tit: { sing: "\u0152uvre", plur: "\u0152uvres" },
      tech: { sing: "oeuvre", plur: "oeuvres" }
    };
    // Mettre en forme les auteurs
    static mef_auteurs(auteurs) {
      const regauteurs = /(.+?) ([A-Z \-]+?)\(([HF]), (.+?)\)/;
      while (auteurs.match(regauteurs)) {
        auteurs = auteurs.replace(regauteurs, (_, prenom, nom, sexe, fonctions) => {
          return `
        <span class="prenom">${prenom}</span>
        <span class="nom">${nom}</span>
        <span class="sexe">${sexe}</span>
        (<span class="fonctions">${fonctions}</span>)
        `;
        });
      }
      return auteurs.trim();
    }
    constructor(data) {
      super(data);
    }
  };

  // src/webviews/oeuvres/Oeuvre.ts
  var Oeuvre = class extends UOeuvre {
    static minName = "oeuvre";
    // private static readonly REG_ARTICLES = /\b(an|a|the|le|la|les|l'|de|du)\b/i ;
    // // Cache manager spécifique aux oeuvres
    // private static _cacheManagerInstance: CacheManager<OeuvreData, CachedOeuvreData> = new CacheManager();
    // protected static get cacheManager(): CacheManager<OeuvreData, CachedOeuvreData> {
    //   return this._cacheManagerInstance;
    // }
    // // pour test
    // static get cacheManagerForced() { return this.cacheManager ; }
    // static readonly ERRORS = {
    //   'no-items': 'Aucune œuvre dans la base, bizarrement…',
    // };
    // static formateProp(prop: string, value: any): string {
    //   switch(prop) {
    //     case 'annee':
    //       return value ? value.toString() : '';
    //     default:
    //       return value || '';
    //   }
    // }
    // /**
    //  * Prépare une œuvre pour le cache de recherche
    //  * SEULE méthode spécifique - le reste hérite de CommonClassItem !
    //  */
    // static prepareItemForCache(oeuvre: OeuvreData): CachedOeuvreData {
    //   // Créer un array avec tous les titres disponibles
    //   const titres: string[] = [];
    //   if (oeuvre.titre_francais) {
    //     titres.push(StringNormalizer.rationalize(oeuvre.titre_francais));
    //   }
    //   if (oeuvre.titre_original) {
    //     titres.push(StringNormalizer.rationalize(oeuvre.titre_original));
    //   }
    //   if (oeuvre.titre_affiche) {
    //     titres.push(StringNormalizer.rationalize(oeuvre.titre_affiche));
    //   }
    //   // Il faut supprimer les articles dans les titres
    //   titres.forEach(titre => {
    //     if ( titre.match(this.REG_ARTICLES)) {
    //       titres.push(titre.replace(this.REG_ARTICLES, ""));
    //     }
    //   });
    //   const uniqTitres: string[] = [];
    //   titres.forEach(titre => {
    //     if ( uniqTitres.includes(titre) ) { return ; }
    //     uniqTitres.push(titre);
    //   });
    //   // Versions minuscules pour recherche
    //   const titresLookUp = uniqTitres.map(titre => StringNormalizer.toLower(titre));
    //   // console.info("titres min", titresLookUp);
    //   return {
    //     id: oeuvre.id,
    //     titre_affiche: oeuvre.titre_affiche,
    //     titre_original: oeuvre.titre_original,
    //     titre_francais: oeuvre.titre_francais,
    //     titres: titres,
    //     titresLookUp: titresLookUp,
    //     annee: oeuvre.annee,
    //     auteurs: oeuvre.auteurs,
    //     resume: oeuvre.resume
    //   };
    // }
    // static finalizeCachedItem(item: CacheableItem): void {
    //   // rien à faire pour le moment, mais il faut que la fonction
    //   // soit implémentée.
    //   if ( item.titre_affiche !== item.titre_original ) {
    //     item.titre_affiche_formated = item.titre_affiche;
    //   }
    //   if ( item.titre_francais && item.titre_francais !== item.titre_original) {
    //     item.titre_francais_formated = item.titre_francais;
    //   }
    //   // Pour le moment, le résumé reste le même, mais ensuite il sera
    //   // possible de le faire en markdown
    //   item.resume_formated = item.resume;
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
  window.Oeuvre = Oeuvre;

  // src/bothside/UExemple.ts
  var UExemple = class extends UniversalDicoElement {
    static names = {
      min: { sing: "exemple", plur: "exemples" },
      maj: { sing: "EXEMPLE", plur: "EXEMPLES" },
      tit: { sing: "Exemple", plur: "Exemples" },
      tech: { sing: "exemple", plur: "exemples" }
    };
  };

  // src/webviews/exemples/Exemple.ts
  var Exemple = class extends UExemple {
    //   static readonly minName = 'exemple';
    //   // Cache manager spécifique aux exemples
    //   private static _cacheManagerInstance: CacheManager<ExempleData, CachedExempleData> = new CacheManager();
    //   protected static get cacheManager(): CacheManager<ExempleData, CachedExempleData> {
    //     return this._cacheManagerInstance;
    //   }
    //   static readonly ERRORS = {
    //     'no-items': 'Aucun exemple dans la base, bizarrement…',
    //   };
    //   static formateProp(prop: string, value: any): string {
    //     return value || '';
    //   }
    //   /**
    //    * Finalise la donnée pour le cache
    //    */
    //   static finalizeCachedItem(exemple: AnyCachedData): AnyCachedData {
    //     // Résoudre le titre de l'œuvre
    //     let oeuvreTitle: string | undefined;
    //     if (exemple.oeuvre_id) {
    //       try {
    //         if (Oeuvre.isCacheBuilt) {
    //           const oeuvre = Oeuvre.get(exemple.oeuvre_id);
    //           oeuvreTitle = oeuvre ? oeuvre.titre_affiche : undefined;
    //         }
    //       } catch (error) {
    //         console.warn(`[Exemple] Could not resolve oeuvre ${exemple.oeuvre_id}:`, error);
    //       }
    //     }
    //     exemple.oeuvre_titre = oeuvreTitle ;
    //     // Résoudre l'entrée associée
    //     let entryEntree: string | undefined;
    //     try {
    //       if (Entry.isCacheBuilt) {
    //         const entry = Entry.get(exemple.entry_id);
    //         entryEntree = entry ? entry.entree : undefined;
    //       }
    //     } catch (error) {
    //       console.warn(`[Exemple] Could not resolve entry ${exemple.entry_id}:`, error);
    //     }
    //     exemple.entry_entree = entryEntree ;
    //     return exemple;
    //   }
    //   /**
    //    * Prépare un exemple pour le cache de recherche
    //    * SEULE méthode spécifique - le reste hérite de CommonClassItem !
    //    * 
    //    * TODO En fait, il faut une méthode en deux temps :
    //    *  - le premier ne fait que mettre les données de l'item dans
    //    *    la donnée cachée
    //    *  - le deuxième temps, une fois toutes les données de tous les
    //    *    types chargées, prépare les données spéciales qui ont besoin
    //    *    des autres types.
    //    */
    //   static prepareItemForCache(exemple: ExempleData): CachedExempleData {
    //     const contentNormalized = StringNormalizer.toLower(exemple.content);
    //     const contentRationalized = StringNormalizer.rationalize(exemple.content);
    //     return {
    //       id: exemple.id,
    //       content: exemple.content,
    //       content_min: contentNormalized,
    //       content_min_ra: contentRationalized,
    //       oeuvre_id: exemple.oeuvre_id,
    //       oeuvre_titre: undefined,
    //       entry_id: exemple.entry_id,
    //       entry_entree: undefined
    //     };
    //   }
    //   /**
    //    * Filtrage des exemples 
    //    * Méthode spécifique Exemple
    //    * 
    //    * En mode "normal"
    //    * Le filtrage, sauf indication contraire, se fait par rapport aux
    //    * titres de film. Le mécanisme est le suivant : l'user tape un
    //    * début de titres de film. On en déduit les titres grâce à la
    //    * méthode de la classe Oeuvre. On prend l'identifiant et on 
    //    * affiche tous les exemples du film voulu.
    //    * 
    //    * En mode "Entrée", l'utilisateur tape une entrée du dictionnaire
    //    * et la méthode renvoie tous les exemples concernant cette entrée.
    //    * 
    //    * En mode "Contenu", la recherche se fait sur le contenu, partout
    //    * et sur toutes les entrées.
    //    * 
    //    * QUESTION Comment faire la différence entre les différents modes
    //    * de recherche ? peut-être avec un préfix ('content' pour recher-
    //    * che sur le contenu, 'dico:' ou 'entree:' pour la recherche sur 
    //    * les entrées et rien pour la recherche sur le film)
    //    */
    //   protected static searchMatchingItems(searched: string): CachedExempleData[] {
    //     const searchLower = StringNormalizer.toLower(searched);
    //     const searchRa = StringNormalizer.rationalize(searched);
    //     const mode: string = 'by oeuvre' ; // doit pouvoir être déterminé depuis searchLower
    //     switch (mode) {
    //       case 'by oeuvre':
    //         /*
    //         TODO Ça doit être affiné : 
    //         - on appelle la méthode Oeuvre.searchMatchingItems(searchLower) pour
    //           obtenir les oeuvres possibles
    //         - on boucle sur chaque oeuvre pour obtenir les exemples. On retourne 
    //           la liste obtenue.
    //         */
    //         const oeuvreId = 'DITD' ; // à déterminer en fonction du début cherché
    //         return this.getByOeuvre(oeuvreId) as CachedExempleData[];
    //       case 'by entry':
    //         return [] as CachedExempleData[];
    //       case 'by content':
    //         return this.filter((exemple: any) => {
    //           return exemple.content_min.includes(searchLower) ||
    //             exemple.content_min_ra.includes(searchRa);
    //         }) as CachedExempleData[];
    //       default:
    //         return [] ; // ne doit jamais être atteint, juste pour lint
    //     }
    //  }
    //   /**
    //    * Récupère tous les exemples associés à une oeuvre
    //    * Méthode spécifique Exemple
    //    */
    //   static getByOeuvre(oeuvreId: string): CachedExempleData[] {
    //     return this.filter((exemple: any) => exemple.oeuvre_id === oeuvreId) as CachedExempleData[];
    //   }
    //   /**
    //    * Récupère tous les exemples associés à une entrée
    //    * Méthode spécifique Exemple
    //    */
    //   static getByEntry(entryId: string): CachedExempleData[] {
    //     return this.filter((exemple: any) => exemple.entry_id === entryId) as CachedExempleData[];
    //   }
    //   // Méthodes typées pour plus de confort (optionnel)
    //   static get(id: string): CachedExempleData | null {
    //     return super.get(id) as CachedExempleData | null;
    //   }
    //   static getAll(): CachedExempleData[] {
    //     return super.getAll() as CachedExempleData[];
    //   }
    //   /**
    //    * Post-traitement après affichage : ajouter les titres des films
    //    * IMPORTANT: Cette méthode est appelée après l'affichage initial
    //    * 
    //    * Fonctionnement
    //    * --------------
    //    * Pour optimiser le traitement, en considérant qu'on peut avoir
    //    * des milliers d'exemples, on ne passe pas par le DOM mais par
    //    * les données (getAll). Puisqu'elles sont relevées dans l'ordre,
    //    * c'est-à-dire par film, il suffit d'ajouter un titre au premier
    //    * exemple qu'on trouve qui a un film différent du précédent.
    //    * 
    //    */
    //   static afterDisplayItems(): boolean {
    //     console.log('[EXEMPLES] afterDisplayItems - Grouping examples by oeuvre');
    //     const mainConteneur = this.container as HTMLElement | null ;
    //     if ( mainConteneur === null ) {
    //       // Ça ne devrait jamais arriver
    //       console.error('[EXEMPLES] No container found for grouping');
    //       return false;
    //     }
    //     // Film courant
    //     let currentOeuvreId = '' ;
    //     this.cacheManager.getAll().forEach(exemple => {
    //       if ( exemple.oeuvre_id === currentOeuvreId ) { return ; }
    //       // Le film change, il faut mettre un titre avant
    //       const domObj = document.querySelector(`main#items > div.item[data-id="${exemple.id}"]`) as HTMLDivElement ;
    //       currentOeuvreId = exemple.oeuvre_id as string ;
    //       const titleObj = document.createElement('h2');
    //       const oeuvre = this.cacheManager.get(exemple.oeuvre_id as string);
    //       console.log("oeuvre répondant à l'id %s", currentOeuvreId, oeuvre);
    //       if ( !oeuvre ) {
    //         console.log("Oeuvre introuvable, this.cacheManager vaut", this.cacheManager);
    //         throw new Error("L'œuvre devrait être définie.");
    //       }
    //       const titre = oeuvre ? oeuvre.titre_affiche : "œuvre introuvable" ;
    //       console.log("Titre", titre);
    //       titleObj.innerHTML = titre ;
    //        // Ajouter bouton d'ajout d'exemple
    //       const btnAdd = document.createElement('button');
    //       btnAdd.className = 'btn-add';
    //       btnAdd.innerHTML = '<i class="codicon codicon-add"></i>';
    //       btnAdd.setAttribute('data-oeuvre_id', currentOeuvreId);
    //       titleObj.appendChild(btnAdd);
    //       domObj.parentNode?.insertBefore(titleObj, domObj);
    //     });
    //     console.log('[EXEMPLES] Titling completed');
    //     return true;
    //   }
  };
  window.Exemple = Exemple;

  // src/webviews/common.ts
  var vscode = acquireVsCodeApi();
  window.addEventListener("message", (event) => {
    const message = event.data;
    switch (message.command) {
      case "queryDOM":
        queryDOMObject(message);
        break;
      case "queryDOMAll":
        handleQueryDOMAll(message);
        break;
      case "queryDOMVisible":
        handleQueryDOMVisible(message);
        break;
      case "typeInElement":
        handleTypeInElement(message);
        break;
      case "clearAndTypeInElement":
        handleClearAndTypeInElement(message);
        break;
      case "clearElement":
        handleClearElement(message);
        break;
      case "getElementFromParent":
        handleGetElementFromParent(message);
        break;
      case "executeScript":
        handleExecuteScript(message);
        break;
      case "updateContent":
        const targetElement = document.querySelector(message.target);
        if (targetElement) {
          targetElement.innerHTML = message.content;
        }
        break;
    }
  });
  function queryDOMObject(message) {
    const element = document.querySelector(message.selector);
    let elementData = null;
    if (element) {
      elementData = {
        tagName: element.tagName.toLowerCase(),
        textContent: element.textContent || "",
        classList: Array.from(element.classList),
        id: element.id,
        exists: true
      };
    }
    vscode.postMessage({
      command: "domQueryResult",
      selector: message.selector,
      element: elementData
    });
  }
  function createElementData(element) {
    return {
      tagName: element.tagName.toLowerCase(),
      textContent: element.textContent || "",
      classList: Array.from(element.classList),
      id: element.id,
      exists: true
    };
  }
  function handleQueryDOMAll(message) {
    const elements = document.querySelectorAll(message.params.selector);
    const elementsData = Array.from(elements).map(createElementData);
    vscode.postMessage({
      command: "queryDOMAllResult",
      params: message.params,
      result: elementsData
    });
  }
  function handleQueryDOMVisible(message) {
    const elements = document.querySelectorAll(message.params.selector);
    const visibleElements = Array.from(elements).filter((element) => {
      const style = window.getComputedStyle(element);
      return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
    });
    const elementsData = visibleElements.map(createElementData);
    vscode.postMessage({
      command: "queryDOMVisibleResult",
      params: message.params,
      result: elementsData
    });
  }
  function handleTypeInElement(message) {
    const element = document.querySelector(message.params.selector);
    if (element && (element.tagName === "INPUT" || element.tagName === "TEXTAREA")) {
      element.value += message.params.text;
      element.dispatchEvent(new Event("input", { bubbles: true }));
    }
    vscode.postMessage({
      command: "typeInElementResult",
      params: message.params,
      result: null
    });
  }
  function handleClearAndTypeInElement(message) {
    const element = document.querySelector(message.params.selector);
    if (element && (element.tagName === "INPUT" || element.tagName === "TEXTAREA")) {
      element.value = message.params.text;
      element.dispatchEvent(new Event("input", { bubbles: true }));
    }
    vscode.postMessage({
      command: "clearAndTypeInElementResult",
      params: message.params,
      result: null
    });
  }
  function handleClearElement(message) {
    const element = document.querySelector(message.params.selector);
    if (element && (element.tagName === "INPUT" || element.tagName === "TEXTAREA")) {
      element.value = "";
      element.dispatchEvent(new Event("input", { bubbles: true }));
    }
    vscode.postMessage({
      command: "clearElementResult",
      params: message.params,
      result: null
    });
  }
  function handleGetElementFromParent(message) {
    const parentElement = document.getElementById(message.params.parentId);
    let elementData = null;
    if (parentElement) {
      const element = parentElement.querySelector(message.params.selector);
      if (element) {
        elementData = createElementData(element);
      }
    }
    vscode.postMessage({
      command: "getElementFromParentResult",
      params: message.params,
      result: elementData
    });
  }
  function handleExecuteScript(message) {
    let result = null;
    try {
      result = (0, eval)(message.params.script);
    } catch (error) {
      console.error("Script execution error:", error);
      result = error.message;
    }
    vscode.postMessage({
      command: "executeScriptResult",
      params: message.params,
      result
    });
  }
  document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("keydown", (event) => {
    });
    const consoleInput = document.querySelector("#panel-console");
    if (consoleInput) {
      consoleInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          const command = consoleInput.value.trim();
          if (command) {
            vscode.postMessage({
              command: "console-command",
              value: command
            });
            consoleInput.value = "";
          }
        }
      });
    }
  });

  // src/bothside/UEntry.ts
  var UEntry = class extends UniversalDicoElement {
    static names = {
      min: { sing: "entr\xE9e", plur: "entr\xE9es" },
      maj: { sing: "ENTR\xC9E", plur: "ENTR\xC9ES" },
      tit: { sing: "Entr\xE9e", plur: "Entr\xE9es" },
      tech: { sing: "entry", plur: "entries" }
    };
    static GENRES = {
      "nm": "n.m.",
      "nf": "n.f.",
      "np": "n.pl.",
      "vb": "verbe",
      "adj": "adj.",
      "adv": "adv."
    };
    static genre(id) {
      return this.GENRES[id];
    }
    constructor(data) {
      super(data);
    }
  };

  // src/webviews/entries/Entry.ts
  var Entry = class extends UEntry {
    static minName = "entry";
    // static readonly ERRORS = {
    //   'no-items': 'Aucune entrée dans la base, bizarrement…',
    // };
    // }
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
  window.Entry = Entry;
})();
//# sourceMappingURL=entries-bundle.js.map
