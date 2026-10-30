const fs = require("node:fs/promises");
const path = require("node:path");
const { sequelize } = require("../config/database");

const migrate = async () => {
  await sequelize.transaction(async (transaction) => {
    // Serialize deploys, including creation of the migration ledger.
    await sequelize.query("SELECT pg_advisory_xact_lock(81726354)", { transaction });
    await sequelize.query('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())', { transaction });
    const [rows] = await sequelize.query("SELECT name FROM schema_migrations", { transaction });
    const applied = new Set(rows.map((row) => row.name));
    const files = (await fs.readdir(__dirname)).filter((name) => /^\d+.*\.sql$/.test(name)).sort();
    for (const name of files) {
      if (applied.has(name)) continue;
      await sequelize.query(await fs.readFile(path.join(__dirname, name), "utf8"), { transaction });
      await sequelize.query("INSERT INTO schema_migrations (name) VALUES ($name)", { bind: { name }, transaction });
      console.log(`Applied ${name}`);
    }
  });
};

if (require.main === module) {
  migrate().catch((error) => {
    console.error("Migration failed:", error.message);
    process.exitCode = 1;
  }).finally(() => sequelize.close());
}
module.exports = migrate;
