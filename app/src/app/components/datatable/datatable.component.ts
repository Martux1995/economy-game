import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DTEvent, DTHeaderData, DTBodyData, DTButtonData, DTInputData } from 'src/app/interfaces/dataTable';

@Component({
  selector: 'custom-datatable',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.scss']
})
export class DatatableComponent implements OnInit {

  // DATOS OBLIGATORIOS
  @Input() data:DTBodyData[];
  @Input() headers:DTHeaderData[];
  @Output() eventHandler:EventEmitter<DTEvent> = new EventEmitter<DTEvent>();

  // DATOS OPCIONALES
  @Input() rowIdName:string = 'id';
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
    this.checkData();
    
    this.dataFiltered = this.data;
    this.totalData = this.data.length;
    
    this.updateTableData();
  }

  checkProperties () {
    this.headers.forEach(c => {
      if (!c.hide) c.hide = false;

      if (c.type == 'input') {
        if (!c.input)
          c.input = 'text';
        else if (c.input == 'switch' && !c.props) 
          c.props = {};
      }
      
      if (c.type == 'button' && !c.props) {
          c.props = {}
      }
    });

  }
  
  checkData() {
    let buttonHeads = this.headers.filter(d => d.type == "button");
    let inputHeads = this.headers.filter(d => d.type == "input");

    this.data.forEach(r => {
      buttonHeads.forEach(h => {
        if (typeof (r[h.id] as DTButtonData).action === "undefined") {
          throw Error('button column needs action string id to work');
        }

        let x = r[h.id] as DTButtonData | DTButtonData[];
        
        if (x instanceof Array) {
          x.forEach(b => {
            if (typeof b.hide === "undefined")    b.hide = false;
            if (typeof b.disabled === "undefined") b.disabled = false;
          })
        } else {
          if (typeof x.hide ==="undefined")    x.hide = false;
          if (typeof x.disabled ==="undefined") x.disabled = false;
        }
      });

      inputHeads.forEach(h => {
        if (typeof (r[h.id] as DTInputData).control === "undefined") {
          throw Error('input column needs FormControl to work');
        }
        if (typeof (r[h.id] as DTInputData).errorText === "undefined")
          (r[h.id] as DTInputData).errorText = "";
        if (typeof (r[h.id] as DTInputData).disabled === "undefined")
          (r[h.id] as DTInputData).disabled = false;
      });

    });
  }

  ngOnChanges() {
    this.inputFilter();
  }

  onClickAction(action:string,id:string) {
    this.eventHandler.emit({action: action, id: id});
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