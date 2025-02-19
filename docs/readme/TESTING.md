# Testing

## Why

Testing is an important part of any application. It helps to make sure your application is working correctly and give you confidence as a dev as you will be able to keep adding features without risk of breaking stuff.

## How

We use Jest and Supertest for testing. When testing APIs, we use supertest to assert that each endpoint responds in the way we expect. These test are usually really easy to do and increases coverage a lot because we are testing many layers of our application at once.

When working with databases we can spin up a docker container with an instance of Mysql for example, or use an in-memory database like Sqlite, avoiding the need to mock our databases which can make our tests very closely related to the real implementation ("This orm method should be called once").

When working with external services, like APIs, we can mock the specific code that is in charge of communicating with these external services or we can even spin up a mock server with test data that emulates the real service.

## Commands

```
npm run test
# Runs all tests once.

npm run test
# Runs all tests in watch mode.

npm run test:cov
# Runs all tests once and outputs coverage in ./coverage.
```
