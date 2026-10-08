const { Sequelize } = require("sequelize");

const {
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  DB_DIALECT,
} = require("./env");

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: DB_DIALECT,
});

const ensureDatabaseExists = async () => {
  const adminConnection = new Sequelize("postgres", DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: DB_DIALECT,
  });

  try {
    const [results] = await adminConnection.query(
      `SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'`
    );

    if (results.length === 0) {
      await adminConnection.query(`CREATE DATABASE "${DB_NAME}"`);

      console.log(`Database "${DB_NAME}" created`);
    } else {
      console.log(`Database "${DB_NAME}" already exists`);
    }
    
  } finally {
    await adminConnection.close();
  }
};

module.exports = {
  sequelize,
  ensureDatabaseExists,
};
