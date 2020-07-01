import path from 'path';
import ExcelJS from 'exceljs';

import ZIP from 'adm-zip';


export default class ExcelGenerator {

    static async generateTestWB() {
        let groupData:string[] = ['Juego 01','GRUPO 1','05-10-2020 al 10-10-2020','Claudio Gonzalez'];
        let generalValues:number[] = [10000,5000,10,0,240,5240,-5000];
        
        const book = new ExcelJS.Workbook();
        let x = book.addWorksheet('HOJA_PRUEBA',{
            properties: {
                showGridLines: false,
            }
        });

        x.columns = [ { width: 2.14,  },{ width: 19.14 },{ width: 19.14 },{ width: 19.14 },
            { width: 19.14 },{ width: 19.14 },{ width: 19.14 },{ width: 19.14 },{ width: 2.14 }
        ];
        x.columns.forEach(r => { r.font = { size: 10, name: 'Segoe UI' } });

        // TÍTULO DEL REPORTE
        x.mergeCells('B2:I2');
        x.getCell('B2').value = 'VENDEDOR VIAJERO - REPORTE DE ACTIVIDAD';
        x.getCell('B2').font = { size: 18, name: 'Segoe UI Black', outline: true };

        // DATOS GENERALES DEL GRUPO
        let labels = ['Nombre juego','Nombre grupo','Fechas reporte','Jugador designado'];
        for (let i = 4; i <= 7; i++) {
            x.getCell(i,2).font = { size: 10, name: 'Segoe UI Semibold' };
            x.getCell(i,2).value = labels[i - 4];
            
            x.mergeCells(i, 3, i, 5);
            x.getCell(i,3).style = { 
                border: { top: { style: 'thin'}, bottom: { style: 'thin'}, left: { style: 'thin'}, right: { style: 'thin'} }
            };
            x.getCell(i,3).value = groupData[i - 4];
        }

        let generalHeaders = ['DINERO INICIAL','DINERO FINAL','BLOQUES EXTRA','','INGRESOS','EGRESOS','UTILIDAD'];
        for (let i = 2; i <= 8; i++) {
            if (generalHeaders[i - 2] != '') {
                x.getCell(11,i).style = {
                    font: { name: 'Segoe UI Semibold', size: 10, color: { argb: 'FFFFFFFF' } },
                    alignment: { horizontal: 'center'},
                    border: { top: { style: 'thin'}, bottom: { style: 'thin'}, left: { style: 'thin'}, right: { style: 'thin'} },
                    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' }, bgColor: { argb: 'FF4472C4'} }
                }
                x.getCell(11,i).value = generalHeaders[i - 2];

                x.getCell(12,i).style = {
                    alignment: { horizontal: 'center'},
                    border: { top: { style: 'thin'}, bottom: { style: 'thin'}, left: { style: 'thin'}, right: { style: 'thin'} },
                    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' }, bgColor: { argb: 'FF4472C4'} }
                }
                x.getCell(12,i).value = generalValues[i - 2];
                if (i != 4) x.getCell(12,i).numFmt = '$ #,##0;[Red]-$ #,##0';
            }
        }

        return await book.xlsx.writeBuffer();
    }

    static async generateAllReports () {
        const templateBook = await new ExcelJS.Workbook().xlsx.readFile(path.join(__dirname,'../../reportTemplate.xlsx'));

        const reportBook = new ExcelJS.Workbook();

        
        
        let y = await reportBook.xlsx.writeFile('temp.xlsx');
        
        const containerFile = new ZIP();
    }

    static async makeReportWorksheet (wb:ExcelJS.Workbook, wsname:string) {
        let groupData:string[] = ['','','',''];
        let generalValues:string[] = [];

        const ws = wb.addWorksheet(wsname,{
            properties: {
                showGridLines: false,
            }
        });

        // TAMAÑO Y FUENTE DE LAS COLUMNAS DEL REPORTE
        ws.columns = [ { width: 20 },{ width: 140 },{ width: 140 },{ width: 140 },
            { width: 140 },{ width: 140 },{ width: 140 },{ width: 140 },{ width: 20 }
        ];
        ws.columns.forEach(r => { r.font = { size: 10, name: 'Segoe UI' } });

        // TÍTULO DEL REPORTE
        ws.mergeCells('C4:H4');
        ws.getCell('C4').value = 'VENDEDOR VIAJERO - REPORTE DE ACTIVIDAD';
        ws.getCell('C4').font = { size: 18, name: 'Segoe UI Black', outline: true };

        // DATOS GENERALES DEL GRUPO
        let labels = ['Nombre juego','Nombre grupo','Fechas reporte','Jugador designado'];
        for (let i = 4; i <= 7; i++) {
            ws.getCell(i,2).font = { size: 10, name: 'Segoe UI Semibold' };
            ws.getCell(i,2).value = labels[i - 4];

            ws.mergeCells(i, 3, i, 8);
            ws.getCell(i,3).style = { 
                border: { top: { style: 'thin'}, bottom: { style: 'thin'}, left: { style: 'thin'}, right: { style: 'thin'} }
            };
            ws.getCell(i,3).value = groupData[i - 4];
        }

        // TÍTULO DE DATOS MONETARIOS DEL JUEGO
        ws.mergeCells('B10:I10');
        ws.getCell('B10').style = {
            font: { name: 'Segoe UI Black', size: 14, color: { argb: 'FFFFFFFF'} },
            alignment: { horizontal: 'center' },
            border: { top: { style: 'thin'}, bottom: { style: 'thin'}, left: { style: 'thin'}, right: { style: 'thin'} },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' }, bgColor: { argb: 'FF00B050' } }
        }
        ws.getCell('B10').value = "DATOS GENERALES";

        // DETALLE DE LOS DATOS MONETARIOS
        let generalHeaders = ['DINERO INICIAL','DINERO FINAL','BLOQUES EXTRA','','INGRESOS','EGRESOS','UTILIDAD'];
        for (let i = 2; i <= 8; i++) {
            if (generalHeaders[i - 2] != '') {
                ws.getCell(11,i).style = {
                    font: { name: 'Segoe UI Semibold', size: 10, color: { argb: 'FFFFFFFF' } },
                    alignment: { horizontal: 'center'},
                    border: { top: { style: 'thin'}, bottom: { style: 'thin'}, left: { style: 'thin'}, right: { style: 'thin'} },
                    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' }, bgColor: { argb: 'FF4472C4'} }
                }
                ws.getCell(11,i).value = generalHeaders[i - 2];

                ws.getCell(12,i).style = {
                    alignment: { horizontal: 'center'},
                    border: { top: { style: 'thin'}, bottom: { style: 'thin'}, left: { style: 'thin'}, right: { style: 'thin'} },
                    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' }, bgColor: { argb: 'FF4472C4'} }
                }
                ws.getCell(12,i).value = generalValues[i - 2];
                if (i != 4) ws.getCell(12,i).numFmt = '$ #,##0;[Red]-$ #,##0';
            }
        }

        // TÍTULO DEL ALQUILER DE BLOQUES
        ws.mergeCells('C14:H14');
        ws.getCell('B10').style = {
            font: { name: 'Segoe UI Black', size: 14, color: { argb: 'FFFFFFFF'} },
            alignment: { horizontal: 'center' },
            border: { top: { style: 'thin'}, bottom: { style: 'thin'}, left: { style: 'thin'}, right: { style: 'thin'} },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' }, bgColor: { argb: 'FF4472C4' } }
        }
        ws.getCell('B10').value = "ALQUILER DE BLOQUES";

    }

    static async makeGroupReport (groupId: number) : Promise<ExcelJS.Buffer> {
        const groupData:any = {};
        const buySellData:any[] = ['','','','','',''];
        const inventoryData:any[] = ['','','','','',''];
        
        const book = new ExcelJS.Workbook();
        book.xlsx.readFile(path.join(__dirname,"../groupGeneralReport.xlsx"));

        let sheet = book.getWorksheet("BALANCES COMPRA_VENTA");

        sheet.getCell("C5").value = "GROUP_NAME";
        sheet.getCell("C6").value = "PLAYER_NAME";

        sheet.getCell("H5").value = "MONEY";
        sheet.getCell("H6").value = "BLOCKS";

        let table = sheet.getTable("COMPRAS");

        let pos = 0;
        buySellData.forEach(r => {
            // DATE,CITY,ITEMNAME,AMOUNT,ACTION,PRICE,TOTAL
            table.addRow(['','','','','','',''],pos++);
        });

        sheet.commit();

        sheet = book.getWorksheet('BALANCE MERCANCIAS');

        sheet.getCell("C5").value = "WAREHOUSE_AMOUNT";
        sheet.getCell("E5").value = "TRUCK_AMOUNT";

        pos = 0;
        inventoryData.forEach(r => {
            // NAME,BLOCKS,WAREHOUSE,TRUCK
            table.addRow(['','','',''],pos++);
        })

        sheet.commit();

        return await book.xlsx.writeBuffer();
    }

}