import { Component, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

// TODO: ERROR AL VACIAR Y ESCRIBIR NUEVAMENTE EL SHOWDATA

@Component({
  selector: 'custom-datatable',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.scss']
})
export class DatatableComponent implements OnInit {

  @Input() data:any[];
  @Input() headers:any[];

  @Input() maxRowsPerPage:number = 10;
  @Input() paginatorLimit:number = 5;

  @Input() headerClass:string = 'text-center text-white bg-primary';
  @Input() bodyClass:string = 'text-center';

  ascOrder:boolean = false;
  headFilter:string = '';

  actualPage:number = 1;
  
  showData:any[];
  
  text = new FormControl('');
  changin = false;

  dataFiltered:any[];
  textFilterValues:string[] = [];
  firstElement:number;
  lastElement:number;

  constructor() { }

  ngOnInit(): void {
    this.firstElement = 0;
    this.lastElement = this.maxRowsPerPage;
    this.dataFiltered = this.data;
    this.reloadTable();
  }

  reloadTable() {
    this.inputFilter();
    this.sortAlphabetically();
    this.changeTableData();
    this.changin = false;
  }

  private inputFilter() {
    if (this.textFilterValues.length > 0)
      this.dataFiltered = this.data.filter(r => {
        for (const text of this.textFilterValues) {
          try {
            for (const h of this.headers) {
              if (r[h.prop].includes(text)) return true;
            }
            return false;
          } catch (e) {
            return false;
          }
        }
      })
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
  }

  private changeTableData () {
    this.showData = this.dataFiltered.slice(this.firstElement,this.lastElement);
  }

  // On change Text Input
  textFilter (value:string) {
    this.textFilterValues = (value != '' ? value.split(' ') : []);  

    if (!this.changin) this.reloadTable();
  }

  // On press a header
  onPressHeader( val:string ) {
    this.ascOrder = !this.ascOrder
    this.headFilter = val;

    this.reloadTable();
  }

  // On Change Page
  pageChanged(event) {    
    this.actualPage = event.page;
    this.firstElement = (event.page - 1) * this.maxRowsPerPage;
    this.lastElement = this.firstElement + this.maxRowsPerPage;

    if (!this.changin) this.reloadTable();
  }



}
