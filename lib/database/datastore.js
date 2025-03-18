const { DataSource } = require("typeorm");
const fs = require("fs");
const path = require("path");

const entitiesPath = path.join(__dirname, "entities");
const entities = fs
    .readdirSync(entitiesPath)
    .filter(file => file.endsWith(".js"))
    .map(file => require(path.join(entitiesPath, file)));

let dataStore;

async function initializeDatabase(dbOptions) {
    if (dataStore && dataStore.isInitialized) {
        console.log("Database is already initialized.");
        return dataStore;
    }

    // Use a connection URL if provided, otherwise fallback to object config
    const connectionOptions = dbOptions.url
        ? {
              type: dbOptions.type,
              url: dbOptions.url,
              synchronize: dbOptions.synchronize ?? true,
              entities
          }
        : {
              type: dbOptions.type || "sqlite",
              database: dbOptions.database || "db.sqlite",
              host: dbOptions.host || "localhost",
              port: dbOptions.port || 5432,
              username: dbOptions.username || "",
              password: dbOptions.password || "",
              synchronize: dbOptions.synchronize ?? true,
              entities
          };

    dataStore = new DataSource(connectionOptions);
    await dataStore.initialize();
    console.log(`Database initialized: ${dbOptions.type}`);
    return dataStore;
}

function getDatabase() {
    if (!dataStore || !dataStore.isInitialized) {
        throw new Error(
            "Database is not initialized. Call initializeDatabase(dbOptions) first."
        );
    }
    return dataStore;
}

module.exports = { initializeDatabase, getDatabase };
