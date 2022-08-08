import { Sequelize } from "sequelize";
import {createRequire} from "module"; // Bring in the ability to create the 'require' method
const require = createRequire(import.meta.url); // construct the require method
const configDatabase = require("./configDatabase.json"); // use the require method



const db = new Sequelize(
    configDatabase.production.database,
    configDatabase.production.username,
    configDatabase.production.password,
  {
    host: configDatabase.production.host,
    dialect: configDatabase.production.dialect,
    define: { timestamps: false },
    timezone: "Asia/Jakarta",
    dialectOptions:{
      ssl:{
        rejectUnauthorized:false
      }
    }
  }
);

await db.authenticate()
.then(async()=>{
  console.log("Database Connected")
}).catch(error=>{
  throw new Error(error);
})

export default db
