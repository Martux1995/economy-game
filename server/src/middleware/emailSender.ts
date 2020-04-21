/*
import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import empty from 'is-empty';
import path from 'path';

const fs = require('fs').promises;

export default class EmailSender {

  private static emailFrom:any = process.env.EMAIL_ACCOUNT;
  private static emailPass:any = process.env.EMAIL_PASSWORD;
  private static emailHost:any = process.env.EMAIL_HOST;
  private static emailPort:any = process.env.EMAIL_PORT;

  /**
   * Envia un correo electrónico
   * @param to Correo electrónico de destino
   * @param title Título del mensaje
   * @param emailFile Archivo HTML alojado en la carpeta email con el contenido del mensaje
   * @param data variables a reemplazar del mensaje
   * @returns Promise
   */
  /*
  static sendMail (to:string, title:string, emailFile:string, data:any, attach:Array<any> = []):Promise<any> {
    const mailOptions:any = {
      from: {
        name: 'Multiencargo App',
        address: EmailSender.emailFrom
      },
      to: to,
      subject: title,
      html: ''
    }

    if (attach.length > 0) {
      mailOptions.attachments = attach.map(r => {
        return {filename: r.name, content: r.file};
      });
    }

    const transporter = nodemailer.createTransport({
      host: EmailSender.emailHost,
      port: EmailSender.emailPort,
      secure: true,
      auth: {
        user: EmailSender.emailFrom,
        pass: EmailSender.emailPass
      }
    });

    return fs.readFile(path.join(__dirname,'../../email/'+emailFile),{encoding:'utf-8'})
      .then( (html:any) => {
        
        if (!empty(data)){
          var template = handlebars.compile(html);
          var htmlToSend = template(data);
          mailOptions.html = htmlToSend;
        } else {
          mailOptions.html = html
        }

        return transporter.sendMail(mailOptions)

      })
      .catch( (err:any) =>{ console.log(err); throw new Error("No se pudo enviar el mensaje") });
  }
}*/