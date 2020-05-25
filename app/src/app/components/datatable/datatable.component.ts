import { Component, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

export interface InputData {
  control: FormControl;
  errorText: string;
}

export interface SwitchProps {
  trueText?: string;
  trueColor?: string;
  falseText?: string;
  falseColor?: string;
}

export interface ButtonProps {
  text?: string;
  classes?: string;
  action?(id:any): any;
  disableCondition?(id:any):boolean;
}

export interface DataTableHeaderData {
  id:string;
  name:string;
  hide?:boolean;
  type:'text'|'input'|'button';
  input?: 'text'|'number'|'email'|'switch';
  props?:SwitchProps|ButtonProps|ButtonProps[];
}

@Component({
  selector: 'custom-datatable',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.scss']
})
export class DatatableComponent implements OnInit {

  @Input() data:any[];
  @Input() headers:DataTableHeaderData[];

  @Input() maxRowsPerPage:number = 10;
  @Input() paginatorLimit:number = 5;

  @Input() headerClass:string = 'text-center text-white bg-primary';
  @Input() bodyClass:string = 'text-center';

  @Input() showTextFilter:boolean = true;

  // Valores del filtro de texto para todas las columnas
  text = new FormControl('');
  textFilterValues:string[] = [];

  // Indican la columna que se está ordenando alfabeticamente y el orden (ASC - DESC)
  headFilter:string = '';
  ascOrder:boolean = false;

  // El número de página que se está mostrando
  actualPage:number = 1;
  
  // Los datos que se estan mostrando en el momento
  showData:any[];

  // la cantidad de datos finales
  totalData:number;

  // Los datos que se están filtrando
  dataFiltered:any[];

  constructor() { }

  ngOnInit(): void {
    this.checkProperties();

    this.dataFiltered = this.data;
    this.totalData = this.data.length;

    this.updateTableData();
  }

  checkProperties () {
    this.headers.forEach(c => {
      if (!c.hide) c.hide = false;

      if (c.type == 'input') {
        if (!c.input)                             c.input = 'text';
        else if (c.input == 'switch' && !c.props) c.props = {};
      }
      
      if (c.type == 'button') {
        if (!c.props) c.props = {}
        if (c.props instanceof Array)
          c.props.map(h => {
            if (!h.action)            h.action = () => {};
            if (!h.disableCondition)  h.disableCondition = () => false;
          })
        else {
          let p = c.props as ButtonProps;
          if (!p.action)            p.action = () => {};
          if (!p.disableCondition)  p.disableCondition = () => false;
        }
      }
    });
  }

  ngOnChanges() {
    this.inputFilter();
  }

  updateTableData() {
    let min = (this.actualPage - 1) * this.maxRowsPerPage;
    let max = min + this.maxRowsPerPage;
    
    this.showData = this.dataFiltered.slice(min,max);
  }

  private inputFilter() {
    let special;
    if (this.textFilterValues.length > 0) {
      special = this.data.filter( r => {
        // Para cada uno de los elementos de la fila
        let correct = false;
        Object.keys(r).forEach( key => {
          // Si no existe el campo en el header o Si el campo es un input, ignorarlo
          let headData = this.headers.find(h => h.id == key);
          if ( !headData || headData.type == 'input' )  return;
          // Para cada uno de los textos del filtro
          for (const text of this.textFilterValues) {
            // Si el valor que se está buscando es un string vacío, ignorar
            if (text === "")  continue;
            // Si el valor de la columna contiene el texto a buscar, esta correcto.
            if (String(r[key]).includes(text)) {
              correct = true; break;
            }
          }
        });
        return correct;
      });
    } else {
      special = this.data;
    }
    this.totalData = special.length;
    this.actualPage = Math.min(this.actualPage,Math.floor((this.totalData-1)/this.maxRowsPerPage)+1)
    this.actualPage = this.actualPage == 0 ? 1 : this.actualPage;
    this.dataFiltered = special;

    this.sortAlphabetically();
  }

  // Ordena de mayor a menor
  private sortAlphabetically() {
    if (this.headFilter != '')
      this.dataFiltered.sort((a:any,b:any) => {
        if (a[this.headFilter] > b[this.headFilter]) {
          return this.ascOrder ? -1 : 1;
        } else {
          return this.ascOrder ? 1 : -1;
        }
      });
    this.updateTableData();
  }

  // On change Text Input
  textFilter (value:string) {
    this.textFilterValues = (value != '' ? value.split(' ') : []);
    this.inputFilter();
  }

  // On press a header
  onPressHeader( val:string ) {
    if (this.headers.find(h => h.id == val).type != 'text') return;

    this.ascOrder = !this.ascOrder
    this.headFilter = val;

    this.sortAlphabetically();
  }

  // On Change Page
  onPageChange(event) {
    if (event.page != this.actualPage) {
      this.actualPage = event.page;
      this.updateTableData();
    }
  }

  isArray(val:any) {
    return (val instanceof Array);
  }
}