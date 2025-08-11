const { DataSource } = require("typeorm");
const config = require("../../config").sqlserver;

const AppDataSource = new DataSource({
  type: "mssql",
  host: config.server,
  port: config.port,
  username: config.user,
  password: config.password,
  database: config.database,
  options: {
    ...config.options,
    encrypt: false, // Para desarrollo local
    trustServerCertificate: true, // Para desarrollo local
  },
  entities: ["src/entities/**/*.js"],
  migrations: ["src/migrations/**/*.js"],
  subscribers: ["src/subscribers/**/*.js"],
  synchronize: false, // En producción debe ser false
  logging: process.env.NODE_ENV === "development",
});

module.exports = AppDataSource;
