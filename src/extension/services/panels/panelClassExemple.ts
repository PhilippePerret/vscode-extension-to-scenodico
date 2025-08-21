import { PanelClass } from './panelClass';
import { Exemple } from '../../models/Exemple';

export class PanelClassExemple extends PanelClass {
  protected _type = 'exemple' ;
  protected _title = 'Exemple' ;
  protected _classe = Exemple ;
  protected _column = 3 ;

}