import { UEntry } from "./UEntry";
import { UExemple } from "./UExemple";
import { UOeuvre } from "./UOeuvre";

export type TypeUnionClasse = typeof UEntry | typeof UOeuvre | typeof UExemple;
export type TypeUnionElement = UEntry | UOeuvre | UExemple;
