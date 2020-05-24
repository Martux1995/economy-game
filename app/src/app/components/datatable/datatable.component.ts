import { Component, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

// TODO: ERROR AL VACIAR Y ESCRIBIR NUEVAMENTE EL SHOWDATA

@Component({
  selector: 'custom-datatable',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.scss']
})
export class DatatableComponent implements OnInit {

  @Input() data:{}[];
  @Input() headers:{name:string, prop:string}[];

  @Input() maxRowsPerPage:number = 10;
  @Input() paginatorLimit:number = 5;

  @Input() headerClass:string = 'text-center text-white bg-primary';
  @Input() bodyClass:string = 'text-center';

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
    this.dataFiltered = this.data;
    this.totalData = this.data.length;
    this.updateTableData();
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
          // Para cada uno de los textos del filtro
          for (const text of this.textFilterValues) {
            if (text === "")  break;
            // Si existe la clave y el valor de la columna contiene el texto a buscar, esta correcto.
            if (this.headers.find(d => d.prop == key) && r[key].includes(text)) {
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
}
