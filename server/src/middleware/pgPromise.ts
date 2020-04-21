import Promise from 'bluebird';
import pgp from 'pg-promise';
import dotenv from 'dotenv'
dotenv.config();
const dbString: any = process.env.DB_STRING;

const camelizeColumns = (data : any) => {
  const template = data[0];

  for (let prop in template) {
    const camel = pgp.utils.camelize(prop);

    if (!(camel in template)) {
      for (let i = 0; i < data.length; i++) {
        let d = data[i];
        d[camel] = d[prop];
        delete d[prop];
      }
    }
  }
};

const postgres = pgp({
  promiseLib: Promise,
  receive: (data, result, e) => camelizeColumns(data)
});
const pgQuery = postgres(dbString);

export default pgQuery;