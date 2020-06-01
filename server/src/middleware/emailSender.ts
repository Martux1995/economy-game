import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import empty from 'is-empty';
import path from 'path';
import fs from 'fs'

export interface MailFile {
  name: string;
  file: Buffer | string | any;
}

export interface MailData {
  to: string | string[];
  cc?: string[];
  data?: Object;
  attach?: MailFile[];
}

export default class EmailSender {

  static async sendMail (mailFile:string, title:string, data:MailData|MailData[]) : Promise<boolean> {
    const emailFrom = process.env.EMAIL_ACCOUNT;
    const emailPass = process.env.EMAIL_PASSWORD;
    const emailHost = process.env.EMAIL_HOST;
    const emailPort = process.env.EMAIL_PORT;

    let htmlFile;
    try {
      htmlFile = fs.readFileSync(path.join(__dirname,'../../email/'+mailFile),{encoding:'utf-8'});
    } catch (e) {
      console.log(process.env.NODE_ENV === "production" ? e.message : e); 
      throw new Error ('EMAIL_NOT_SENDED');
    }

    const transportConfig:any = {
      pool: (data instanceof Array),
      host: String(emailHost),
      port: Number(emailPort),
      secure: process.env.EMAIL_PORT === "465",
      auth: {
        user: String(emailFrom),
        pass: String(emailPass)
      },
      tls: {
        rejectUnauthorized: false
      }
    }
    console.log(transportConfig);
    
    const transporter = nodemailer.createTransport(transportConfig);

    if (data instanceof Array) {
      const messages:any = [];
      for (const mail of data) {
        messages.push({
          from: { name: 'Vendedor Viajero', address: String(emailFrom) },
          to: mail.to,
          subject: title,
          cc: mail.cc,
          html: empty(mail.data) ? htmlFile : handlebars.compile(htmlFile)(mail.data),
          attachments: mail.attach ? mail.attach.map( r => { return { filename: r.name, content: r.file } } ) : []
        })
      }

      while (transporter.isIdle() && messages.length) {
        let result = await transporter.sendMail(messages.shift()).catch((err) => console.log(err));
        console.log(result);
      }

    } else {
      let result = await transporter.sendMail({
        from: { name: 'Vendedor Viajero', address: String(emailFrom) },
        to: data.to,
        subject: title,
        cc: data.cc,
        html: empty(data.data) ? htmlFile : handlebars.compile(htmlFile)(data.data),
        attachments: data.attach ? data.attach.map( r => { return { filename: r.name, content: r.file } } ) : []
      }).catch((err) => console.log(err));
      console.log(result);
    }

    return true;
  }
}