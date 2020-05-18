import { Injectable } from '@angular/core';
import { Subject, Observable, timer } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { DateTime } from 'luxon';
import * as XLSX from 'xlsx';

import { AngularBootstrapToastsService } from 'angular-bootstrap-toasts';
import { ToastMessageParams } from 'angular-bootstrap-toasts/lib/Models/toast-message.models';

import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Response } from '../interfaces/response';
import { AlumnoExcelData } from '../interfaces/admin';

const URL = environment.urlApi

@Injectable({
  providedIn: 'root'
})
export class GeneralService {

    constructor (
        private http: HttpClient,
        private toastService: AngularBootstrapToastsService
    ) { }

    // ----------------------------------------------
    //               SPINNER DE CARGA
    // ----------------------------------------------

    private loadingStack:number = 0;
    loadingStatus: Subject<boolean> = new Subject();

	get loading(): boolean {
		return this.loadingStack != 0;
	}

    set loading(value) {
        if (value)  
            this.loadingStack += 1;
        else if (this.loadingStack > 0)
            this.loadingStack -= 1;
        else 
            this.loadingStack = 0;
		this.loadingStatus.next(this.loadingStack != 0);
	}
    
    /** Muestra la ventana de carga */
    showSpinner() { this.loading = true; }

    /** Esconde la ventana de carga */
    hideSpinner() { this.loading = false; }

    // ----------------------------------------------
    //            RELOJ BASADO EN SERVER
    // ----------------------------------------------

    private clock: Observable <Date>;
    private infoFecha$ = new Subject<DateTime>();
    private vr: DateTime;

    /**
     * Configura el reloj para que empieze a una hora determinada
     * @param serverTime El tiempo que se mostrará en la página. Debe ser el del servidor.
     */
    setTime(serverTime:string) {
        this.vr = DateTime.fromISO(serverTime);
        this.clock = timer(0,1000).pipe(map(t => new Date()),shareReplay(1));
    }

    /** Genera el evento de aumento del tiempo para el reloj y devuelve el observable */
    generateClock(): Observable<DateTime> {
        this.clock.subscribe(t => {
            this.vr = this.vr.plus({seconds: 1});
            this.infoFecha$.next(this.vr);
        })
        return this.infoFecha$.asObservable();
    }

    /** retorna el observable del reloj */
    getClock () : Observable<DateTime> {
        return this.infoFecha$.asObservable();
    }

    /** Llama al servidor para obtener el tiempo */
    getServerTime() {
        return this.http.get<Response<{momento:string}>>(`${URL}/api/data/time`);
    }

    // ----------------------------------------------
    //            TOASTS (NOTIFICACIONES)
    // ----------------------------------------------

    /** Obtiene las propiedades del toast para ser usadas en el componente root. */
    getToastProperties () : Object {
        return { position: "bottomRight", marginLeft: "10px", marginRight: "10px", marginTop: "10px", marginBottom: "10px"}
    }

    /**
     * Permite mostrar un aviso en la esquina inferior derecha de la aplicación
     * @param titleText El título a colocar dentro del toast
     * @param bodyText El texto que se mostrará dentro del toast
     * @param toastStyle El estilo del toast. Puede ser "success", "danger", "warning", "info" o "default". Si no se ingresa se elige "default".
     * @param timeMilliseconds El tiempo en milisegudos. Debe ser mayor a 500. 10000 por defecto
     */
    showToast(titleText:string,bodyText:string,toastStyle:'success'|'danger'|'warning'|'info'|'default' = "default",timeMilliseconds:number=7000){
        let titleClasses:string = "text-dark", titleIcon:string = "", closeClass:string = "";
        
        switch (toastStyle) {
            case 'success': 
                titleClasses = "text-white bg-success"; closeClass = "text-white";  titleIcon = "fas fa-check-circle"; break;
            case 'danger':
                titleClasses = "text-white bg-danger";  closeClass = "text-white";  titleIcon = "fas fa-ban"; break;
            case 'warning': 
                titleClasses = "text-dark bg-warning";  closeClass = "text-dark";   titleIcon = "fas fa-exclamation-triangle"; break;
            case 'info':
                titleClasses = "text-white bg-info";    closeClass = "text-white";  titleIcon = "fas fa-info-circle"; break;
        }

        const toastsProperties:ToastMessageParams = {
            title: titleText,
            titleClass: titleClasses,
            text: bodyText,
            duration: timeMilliseconds,
            showProgressLine: true,
            closeByClick: true,
            pauseDurationOnMouseEnter: true,
            iconClass: titleIcon,
            closeButtonClass: closeClass,
            progressLineClass: "bg-info"
        }
        this.toastService.showSimpleToast(toastsProperties);
    }

    // ----------------------------------------------
    //            LECTURA DE HOJAS EXCEL
    // ----------------------------------------------

    getStudentsFromExcel(file:File) {
        return new Promise((accept,reject) => {
            let fileReader = new FileReader();
            fileReader.onload = (e) => {
                let arrayBuffer:any = fileReader.result;
                var data = new Uint8Array(arrayBuffer);
        
                var arr = new Array();
                for(var i = 0; i != data.length; ++i) 
                  arr[i] = String.fromCharCode(data[i]);
        
                var workbook = XLSX.read(arr.join(""), {type:"binary"});
        
                var worksheet = workbook.Sheets['Alumnos'];
                let x = XLSX.utils.sheet_to_json(worksheet,{raw:true});

                let errors:AlumnoExcelData[] = []

                for (const row of x) {
                    
                }

                accept(x);
            }
            fileReader.readAsArrayBuffer(file);
        })
    }

}