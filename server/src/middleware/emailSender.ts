import nodemailer, { SendMailOptions } from 'nodemailer';
import handlebars from 'handlebars';
import empty from 'is-empty';
import path from 'path';
import fs from 'fs'

export default class EmailSender {

  /**
   * Envia un correo electrónico
   * @param to Correo electrónico de destino
   * @param title Título del mensaje
   * @param emailFile Archivo HTML alojado en la carpeta ./email con el contenido del mensaje
   * @param data Objeto con los datos a reemplazar dentro del archivo HTML
   * @param cc Arreglo de correos con copia
   * @param attach Arreglo de archivos a enviar en el correo
   * @returns Promise
   */
  
  static async sendMail (to:string, title:string, emailFile:string, data:Object, cc:string[] = [], attach:{name:string, file:any}[] = []):Promise<any> {
    const emailFrom = process.env.EMAIL_ACCOUNT;
    const emailPass = process.env.EMAIL_PASSWORD;
    const emailHost = process.env.EMAIL_HOST;
    const emailPort = process.env.EMAIL_PORT;

    try {
      const htmlFile = fs.readFileSync(path.join(__dirname,'../../email/'+emailFile),{encoding:'utf-8'});

      const mailOptions:SendMailOptions = {
        from: { name: 'Vendedor Viajero', address: String(emailFrom) },
        to: to,
        subject: title,
        cc: cc,
        html: empty(data) ? htmlFile : handlebars.compile(htmlFile)(data),
        attachments: attach.map( r => { return { filename: r.name, content: r.file } })
      }

      const transporter = nodemailer.createTransport({
        host: String(emailHost),
        port: Number(emailPort),
        secure: true,
        auth: {
          user: String(emailFrom),
          pass: String(emailPass)
        },
      })

      const x = await transporter.sendMail(mailOptions);
      return x;
    } catch (err) {
      console.log(err); throw new Error ('EMAIL_NOT_SENDED');
    }
  }
}

/*
EmailSender.sendMail('correo@asd.com','Correo de prueba','teacherGroupsReport.html',{},['correo2@asd.com'])
.then( z => console.log(z)).catch(err => console.log(err));
*/