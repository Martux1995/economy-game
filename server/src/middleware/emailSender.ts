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

    const mailConfig:any = {
      host: emailHost,
      port: emailPort,
      secure: emailPort == "465",
      auth: {
        user: emailFrom,
        pass: emailPass
      },
      tls: {
        rejectUnauthorized: false
      }
    }
    // console.log(mailConfig);
    

    if (data instanceof Array) {
      mailConfig.pool = true;
    }

    const transporter = nodemailer.createTransport(mailConfig);
    

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
        await transporter.sendMail(messages.shift()).catch((err:any) => console.log(err));
      }

    } else {

      let mailData:any = {
        from: { name: 'Vendedor Viajero', address: String(emailFrom) },
        to: data.to,
        subject: title,
        html: empty(data.data) ? htmlFile : handlebars.compile(htmlFile)(data.data),
      }

      if (!empty(data.cc)){
        mailData.cc = data.cc;
      }

      if (!empty(data.attach)) {
        mailData.attachments = data.attach!.map( r => { return { filename: r.name, content: r.file } } );
      }

      await transporter.sendMail(mailData).catch((err:any) => console.log(err));
    }

    return true;
  }
}