import { PanelClass } from './panelClass';
import { Oeuvre } from '../../models/Oeuvre';

export class PanelClassOeuvre extends PanelClass {
  protected _type = 'oeuvre' ;
  protected _title = 'Œuvre' ; 
  protected _classe = Oeuvre ;
  protected _column = 2 ;

}