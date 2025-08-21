import { Entry } from './Entry';
import { Oeuvre } from './Oeuvre';
import { Exemple } from './Exemple';

export type TypeUnionElement = Entry | Oeuvre | Exemple;

export type TypeUnionClasse = typeof Entry | typeof Oeuvre | typeof Exemple;