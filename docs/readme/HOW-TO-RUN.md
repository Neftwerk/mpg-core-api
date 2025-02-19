# How to run

The commands used to start the server are the basic ones that come with the NestJS framework with some modifications for this template.

```
npm run start:dev
# Runs the server in watch mode.

npm run start:prod
# Runs the server in production mode. The server must be build before running this command.

npm run build
# Builds the app for production mode.

npm run start:cd
# Command to start the server for Continuous Deployment. Runs migrations and starts the server sequencially.
```

## Useful commands

```
npm run lint
# Runs eslint to check the project complies with the rules defined in .eslint.json. It will try to fix any fixable problem or warning. Any kind of warning or error will throw an error.

npm run format
# Runs prettier to solve any formatting issue according to what is defined in `.prettierrc`. If it finds anything that it can't fix it will throw an error.
```
