# Migrations

```
npm run migrate:create --name=your-migration-name
# Creates a new migration file in ./data/migrations.

npm run migrate:generate --name=your-migration-name
# Generates a new migration file based on the differences between your schema and your local database.

npm run migrate:run
# Runs all available migrations from ./data/migrations.

npm run migrate:revert
# Reverts the last migration that you ran.
```
