import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CiudadService } from 'src/app/services/ciudad.service';
import { FormControl, FormGroup } from '@angular/forms';
import { TeacherService } from 'src/app/services/teacher.service';
import { ErrorResponse } from 'src/app/interfaces/response';
import { GeneralService } from 'src/app/services/general.service';
import { Ciudad, ProductData, CiudadData } from 'src/app/interfaces/teacher';
import { DateTime } from 'luxon';
import { LoginService } from 'src/app/services/login.service';
import { DTHeaderData, DTBodyData, DTEvent } from 'src/app/interfaces/dataTable';

@Component({
  selector: 'app-profesor-ciudad',
  templateUrl: './profesor-ciudad.component.html',
  styleUrls: ['./profesor-ciudad.component.scss']
})
export class ProfesorCiudadComponent implements OnInit {

  public idCiudad: number;

  public cityName: string;
  public gameName: string;
  
  // GENERAL TAB DATA
  public ciudadData: FormGroup;
  public collapsedGeneralHelp:boolean = true;
  public editingGeneralData:boolean = false;
  public generalChanged:boolean = false;

  // PRODUCT LIST TAB DATA
  public productList:DTBodyData[] = [];
  public productListBackup:{
    idProducto:number,
    precioCompra:number,
    precioVenta:number
  }[] = [];
  
  public productListHeaders:DTHeaderData[] = [
      { id:'idProducto',      name:'ID',            type:'text',  hide:true },
      { id:'nombreProducto',  name:'Nombre',        type:'text' },
      { id:'bloques',         name:'Bloques',       type:'text',  hide:true },
      { id:'stockActual',     name:'Stock Actual',  type:'input', input:'number' },
      { id:'precioMin',       name:'Precio Mínimo', type:'input', input:'number' },
      { id:'precioMax',       name:'Precio Máximo', type:'input', input:'number' },
      { id:'stockMax',        name:'Stock Máximo',  type:'input', input:'number' },
      { id:'factorVenta',     name:'Factor venta',  type:'input', input:'float' },
      { id:'precioCompra',    name:'Precio Compra', type:'text' },
      { id:'precioVenta',     name:'Precio Venta',  type:'text' }
  ];

  // HISTORIC LIST TAB DATA
  public buyHistoricData:[] = [];
  public buyHistoricHeaders:[] = [];

  constructor(
    private actRoute: ActivatedRoute,
    private router: Router,
    private loginService:LoginService,
    private genServ: GeneralService,
    private teacherService: TeacherService
  ) {
    this.getCityData();
  }

  ngOnInit(): void { }

  // ----------------------------------------------
  //          PESTAÑA INFORMACION GENERAL
  // ----------------------------------------------
  
  getCityData() {
    this.genServ.showSpinner();
    this.teacherService.getTeacherCityData(this.actRoute.snapshot.params.cityId).subscribe(resp => {
      this.getGameData(resp.data.idJuego);
      this.getProductsData(resp.data.idCiudad);
      
      this.idCiudad = resp.data.idCiudad;
      this.cityName = resp.data.nombreCiudad;
      this.ciudadData = new FormGroup({
        nombreCiudad: new FormControl(resp.data.nombreCiudad),
        descripcion: new FormControl(resp.data.descripcion),
        horaAbre: new FormControl(DateTime.fromFormat(resp.data.horaAbre,'HH:mm:ss').toJSDate()),
        horaCierre: new FormControl(DateTime.fromFormat(resp.data.horaCierre,'HH:mm:ss').toJSDate())
      })
      
      this.ciudadData.disable();

      this.genServ.hideSpinner();
    }, (err:ErrorResponse) => {
      if (err.status == 400) {
        switch (err.error.code) {
          case 2501: {
            this.genServ.showToast("DATOS INCORRECTOS",`Corrija los errores indicados en el formulario.`,"warning");
            break;
          }
          default: {
            this.genServ.showToast("ERROR",`${err.error.msg}<br>Código: ${err.error.code}`,"danger");
          }
        }
      } else {
        this.genServ.showToast("ERROR DESCONOCIDO",`Error interno del servidor.`,"danger");
        console.log(err);
      }
      this.genServ.hideSpinner();
    });
  }

  getGameData(gameId:number) {
    this.genServ.showSpinner();
    this.teacherService.getGameById(gameId).subscribe(resp => {
      this.gameName = `${resp.data.nombre} [${resp.data.semestre}]`;
      this.genServ.hideSpinner();
    }, (err:ErrorResponse) => {
      if (err.status == 400) {
        switch (err.error.code) {
          case 2701: case 2803: case 2901: case 2902: case 2903: {
            this.loginService.setLogout();
            this.genServ.showToast("SESIÓN EXPIRADA",`La sesión ha expirado. Vuelva a iniciar sesión.`,"danger");
            break;
          }
          default: {
            this.genServ.showToast("ERROR",`${err.error.msg}<br>Código: ${err.error.code}`,"danger");
          }
        }
      } else {
        this.genServ.showToast("ERROR DESCONOCIDO",`Error interno del servidor.`,"danger");
        console.log(err);
      }
      this.genServ.hideSpinner();
    });
  }

  toggleGeneralData() {
    this.editingGeneralData = !this.editingGeneralData;
    if (this.editingGeneralData) {
      this.ciudadData.enable();
    } else {
      this.ciudadData.disable();
    }
  }

  saveGeneralData() {
    this.genServ.showSpinner();
    let formData = this.ciudadData.value;

    let open = DateTime.fromJSDate(formData.horaAbre)
    let close = DateTime.fromJSDate(formData.horaCierre);

    if (open > close) {
      this.genServ.showToast('ERROR','La hora de apertura no puede ser mayor que la hora de cierre','danger');
      return;
    }

    let data:CiudadData = {
      nombreCiudad: formData.nombreCiudad,
      descripcion: formData.descripcion,
      horaAbre: open.toFormat('HH:mm:ss'),
      horaCierre: close.toFormat('HH:mm:ss')
    };
    this.teacherService.updateTeacherCityData(this.idCiudad, data).subscribe(resp => {
      this.genServ.showToast('CORRECTO','Datos de la ciudad modificados exitosamente','success');
      this.toggleGeneralData();
      this.genServ.hideSpinner();
    }, (err:ErrorResponse) => {
      if (err.status == 400) {
        switch (err.error.code) {
          case 2501: {
            this.genServ.showToast("DATOS INCORRECTOS",`Corrija los errores indicados en el formulario.`,"warning");
            break;
          }
          case 2701: case 2803: case 2901: case 2902: case 2903: {
            this.loginService.setLogout();
            this.genServ.showToast("SESIÓN EXPIRADA",`La sesión ha expirado. Vuelva a iniciar sesión.`,"danger");
            break;
          }
          default: {
            this.genServ.showToast("ERROR",`${err.error.msg}<br>Código: ${err.error.code}`,"danger");
          }
        }
      } else {
        this.genServ.showToast("ERROR DESCONOCIDO",`Error interno del servidor.`,"danger");
        console.log(err);
      }
      this.genServ.hideSpinner();
    });
  }

  // ----------------------------------------------
  //               PESTAÑA PRODUCTOS
  // ----------------------------------------------

  getProductsData(idCiudad:number) {
    this.genServ.showSpinner();
    this.teacherService.getTeacherCityProductsData(idCiudad).subscribe(resp => {
      this.productList = resp.data.map(p => {
        return {
          idProducto: p.idProducto,
          nombreProducto: p.nombreProducto,
          bloques: p.bloques,
          stockActual: { control: new FormControl(p.stockActual) },
          precioMin: { control: new FormControl(p.precioMin) },
          precioMax: { control: new FormControl(p.precioMax) },
          stockMax: { control: new FormControl(p.stockMax) },
          factorVenta: { control: new FormControl(p.factorVenta) },
          precioCompra: `$ ${p.precioCompra}`,
          precioVenta: `$ ${p.precioVenta}`
        }
      });
      this.productListBackup = resp.data.map(p => {
        return {
          idProducto: p.idProducto,
          precioCompra: p.precioCompra,
          precioVenta: p.precioVenta
        }
      })
      this.genServ.hideSpinner();
    }, (err:ErrorResponse) => {
      if (err.status == 400) {
        switch (err.error.code) {
          case 2701: case 2803: case 2901: case 2902: case 2903: {
            this.loginService.setLogout();
            this.genServ.showToast("SESIÓN EXPIRADA",`La sesión ha expirado. Vuelva a iniciar sesión.`,"danger");
            break;
          }
          default: {
            this.genServ.showToast("ERROR",`${err.error.msg}<br>Código: ${err.error.code}`,"danger");
          }
        }
      } else {
        this.genServ.showToast("ERROR DESCONOCIDO",`Error interno del servidor.`,"danger");
        console.log(err);
      }
      this.genServ.hideSpinner();
    });
  }

  dtProductsHandler(event:DTEvent) {
    if (event.action == 'changeInput') {
      let product = this.productList.find(p => p.idProducto == event.id);
      let backup = this.productListBackup.find(p => p.idProducto == event.id);
      if (product && backup) {        

        let buyPrice = this.newBuyPrice(Number(event.id));
        if (buyPrice > backup.precioCompra) {
          product.precioCompra = `<i class="fas fa-arrow-up text-danger"></i> $ ${buyPrice}`;
        } else if (buyPrice < backup.precioCompra) {
          product.precioCompra = `<i class="fas fa-arrow-down text-success"></i> $ ${buyPrice}`;
        } else {
          product.precioCompra = `- $ ${buyPrice}`;
        }

        let sellPrice = Math.floor(Number(product.factorVenta.control.value) * buyPrice);

        if (sellPrice > backup.precioVenta) {
          product.precioVenta = `<i class="fas fa-arrow-up text-danger"></i> $ ${sellPrice}`;
        } else if (sellPrice < backup.precioVenta) {
          product.precioVenta = `<i class="fas fa-arrow-down text-success"></i> $ ${sellPrice}`;
        } else {
          product.precioVenta = `- $ ${sellPrice}`;
        }
      }
    }
  }

  private newBuyPrice(productId:number) {
    let product = this.productList.find(p => p.idProducto == productId);
    if (product) {
      let pMin = Number(product.precioMin.control.value);
      let pMax = Number(product.precioMax.control.value);
      let qMax = Number(product.stockMax.control.value);
      let qAct = Number(product.stockActual.control.value);
      
      if (qMax < qAct) {
        return pMin;
      } else {
        return Math.floor(( ((pMin - pMax) / qMax ) * qAct) + pMax);
      }
    }
    return 0;
  }

  saveProductsData() {
    let products:ProductData[] = this.productList.map(p => {
      return {
        idProducto: p.idProducto,
        stockActual: Number(p.stockActual.control.value),
        stockMax: Number(p.stockMax.control.value),
        precioMax: Number(p.precioMax.control.value),
        precioMin: Number(p.precioMin.control.value),
        factorVenta: Number(p.factorVenta.control.value)
      }
    });

    this.teacherService.updateTeacherCityProductsData(this.idCiudad,products).subscribe(resp => {
      this.genServ.showToast('CORRECTO','Datos de la ciudad modificados exitosamente','success');
      this.genServ.hideSpinner();
    }, (err:ErrorResponse<ProductData[]>) => {
      if (err.status == 400) {
        switch (err.error.code) {
          case 2501: {
            this.genServ.showToast("DATOS INCORRECTOS",`Corrija los errores indicados en el formulario.`,"warning");
            err.error.err;
            err.error.err.map(p => {
              let prod = this.productList.find(d => d.idProducto = p.id);
              if (prod) {
                prod.stockActual.errorText = p.stockActual || '';
                prod.stockMax.errorText = p.stockMax || '';
                prod.precioMax.errorText = p.precioMax || '';
                prod.precioMin.errorText = p.precioMin || '';
                prod.factorVenta.errorText = p.factorVenta || '';
              }
            })
            break;
          }
          case 2701: case 2803: case 2901: case 2902: case 2903: {
            this.loginService.setLogout();
            this.genServ.showToast("SESIÓN EXPIRADA",`La sesión ha expirado. Vuelva a iniciar sesión.`,"danger");
            break;
          }
          default: {
            this.genServ.showToast("ERROR",`${err.error.msg}<br>Código: ${err.error.code}`,"danger");
          }
        }
      } else {
        this.genServ.showToast("ERROR DESCONOCIDO",`Error interno del servidor.`,"danger");
        console.log(err);
      }
      this.genServ.hideSpinner();
    });
  }


  // ----------------------------------------------
  //              PESTAÑA HISTÓRICOS
  // ----------------------------------------------


  // ----------------------------------------------
  //                    OTROS
  // ----------------------------------------------

  goBack() {
    this.router.navigateByUrl('/ciudades');
  }

}
