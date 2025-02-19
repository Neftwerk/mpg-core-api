# CRUD Generator

## What is it?

The **CRUD Generator** is a Yeoman-based tool that generates NestJS modules with the necessary configuration. It simplifies the creation of controllers, services, and entities.

## Usage

To use the generator, simply run the following command from the root of the project:

```bash
npm run generate:crud
```

You will be prompted to provide the name of the module you want to create. For example, if you want to create a user module, enter user when prompted for the module name.

## Generated Structure

The generator will create a directory and file structure as shown below:

```plaintext
src/
└── module/
    └── {module-name}/
        ├── application/
        │   ├── dto/
        │   ├── service/
        │   ├── adapter/
        │   ├── mapper/
        │   ├── policy/
        │   └── enum/
        ├── domain/
        │   ├── entity.ts
        │   ├── entity-name.ts
        │   └── entity.spec.ts
        ├── infrastructure/
        │   ├── database/
        │   │   ├── repository.mysql.repository.ts
        │   │   ├── schema.ts
        │   │   └── exception/
        │   └── exception/
        ├── interface/
        │   └── controller.ts
        └── tests/
            ├── fixture/
            │   ├── entity-fixture.yml
            │   ├── User.yml
            └── (other test files)
            └── e2e.spec.ts
```
