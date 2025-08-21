import { Entry } from '../../models/Entry';
import { PanelClass } from './panelClass';

export class PanelClassDico extends PanelClass {
  protected _type = 'dictionnaire';
  protected _title = 'Dictionnaire';
  protected _classe = Entry ;
  protected _column = 1 ;

}