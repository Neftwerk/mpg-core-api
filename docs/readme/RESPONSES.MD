# API Responses and Error Handling

## Use of JSON:API in the Application

Our application uses and adheres to the [JSON:API](https://jsonapi.org/) specification to structure API responses. JSON:API is a standard that promotes consistency and ease of use by providing a uniform way to interact with APIs. Adhering to this specification facilitates API consumption by various clients and improves maintainability.

It is crucial to maintain the JSON:API specification to ensure responses are predictable and uniform. This includes handling both successful responses and errors.

## JSON:API Responses and Errors

### Successful Responses

In JSON:API, successful responses are structured in a standard way, making it easier for clients to consume APIs. There are two main types of successful responses:

- **Single Resource Response**: Returns a JSON object with a `data` property containing the requested resource information. This information includes the resource type, identifier, attributes, and relationships. If relationships are requested via the `include` parameter in the request, they will be included in the response. Each resource and its relationships include `links` that provide URLs for accessing or manipulating the resource and its relationships.
- **Collection of Resources Response**: Returns a JSON object with a `data` property containing an array of objects, each representing a resource. It can also include pagination metadata and navigation links. Relationships can be included in each resource if specified in the request and will also include `links`.

#### Example of a Successful Single Resource Response

```json
{
  "data": {
    "type": "book",
    "id": "1",
    "attributes": {
      "title": "The Title",
      "author": "The Author",
      "publishedAt": "2024-08-21T21:07:22Z"
    },
    "relationships": {
      "genre": {
        "data": { "type": "genre", "id": "2" },
        "links": {
          "self": "http://localhost:5000/api/v1/books/1/relationships/genre",
          "related": "http://localhost:5000/api/v1/genres/2"
        }
      }
    },
    "links": {
      "self": "http://localhost:5000/api/v1/books/1"
    }
  }
}
```

#### Example of a Successful Collection of Resources Response

```json
{
  "data": [
    {
      "type": "book",
      "id": "1",
      "attributes": {
        "title": "The Title",
        "author": "The Author",
        "publishedAt": "2024-08-21T21:07:22Z"
      },
      "relationships": {
        "genre": {
          "data": { "type": "genre", "id": "2" },
          "links": {
            "self": "http://localhost:5000/api/v1/books/1/relationships/genre",
            "related": "http://localhost:5000/api/v1/genres/2"
          }
        }
      },
      "links": {
        "self": "http://localhost:5000/api/v1/books/1"
      }
    },
    {
      "type": "book",
      "id": "2",
      "attributes": {
        "title": "Another Title",
        "author": "Another Author",
        "publishedAt": "2024-08-22T21:07:22Z"
      },
      "relationships": {
        "genre": {
          "data": { "type": "genre", "id": "3" },
          "links": {
            "self": "http://localhost:5000/api/v1/books/2/relationships/genre",
            "related": "http://localhost:5000/api/v1/genres/3"
          }
        }
      },
      "links": {
        "self": "http://localhost:5000/api/v1/books/2"
      }
    }
  ],
  "links": {
    "self": "http://localhost:5000/api/v1/books?page[number]=1&page[size]=10",
    "next": "http://localhost:5000/api/v1/books?page[number]=2&page[size]=10",
    "last": "http://localhost:5000/api/v1/books?page[number]=10&page[size]=10"
  },
  "meta": {
    "page": {
      "number": 1,
      "size": 10,
      "total": 100
    }
  }
}
```

### Error Responses

Error responses in JSON:API should provide clear information about the issue that occurred. Typical error responses contain:

- **Status**: The HTTP status code corresponding to the error that occurred (e.g., 404 for "Not Found").
- **Title**: A brief title describing the error.
- **Detail**: Additional details about the error, providing more context about what went wrong.
- **Source**: Information about the source of the error, such as a pointer to the URI where the error occurred. This field is optional and used to give additional details about the error's location.

## Error Handling Implementation in the Application

In our application, errors are handled using a custom exception filter (`AppExceptionFilter`). This filter captures thrown exceptions and transforms them into a standard JSON:API response format.

### Custom Exception Filter: `AppExceptionFilter`

The `AppExceptionFilter` is responsible for capturing exceptions thrown in the application and formatting them according to the JSON:API specification. This filter:

1. **Captures the Exception**: Uses the `@Catch(HttpException)` decorator to capture all exceptions that inherit from `HttpException`.
2. **Constructs the Error Response**:
   - **Extracts Relevant Information from the Exception**: Uses a method to obtain error information from the exception.
   - **Formats the Error Title**: Uses the exception name or a custom title.
   - **Details the Error Message**: Provides a clear detail of the error.
   - **Provides a Pointer**: Indicates the URL where the error occurred. This pointer is optional and can be defined in the exception or derived from the HTTP request.

## Implementation in the Application

### Using an Adapter that Implements an Abstract Class

In our application, we use the adapter pattern to handle the transformation and serialization of responses. This is achieved through an abstract class called `BaseResponseAdapter`, which defines common methods for serializing single entity and collection responses. Entity-specific adapters extend this abstract class and can override or extend the methods as needed.

- **Abstract Class `BaseResponseAdapter`**: Defines standard methods for serializing entity and collection responses, ensuring all responses follow a consistent format.
- **Specific Adapters**: Each entity has its own adapter that extends the abstract class and handles the specific details of that entity.

For example, the book adapter (`BookResponseAdapter`) inherits from `BaseResponseAdapter` and can override methods if necessary to handle the nuances of book responses.

### Using Decorators in Controllers

To ensure that each controller correctly handles the corresponding entities, we use a decorator called `ControllerEntity`. This decorator is applied to controllers to mark the entity the controller manages. Additionally, the entity name is stored as a constant in a domain file located at `entity-module/domain/entity-name.domain.ts`, ensuring consistency in entity names throughout the application.

### Implementation when Creating a New Module

To work in the repository and maintain consistency in handling JSON:API responses, follow these steps and recommendations:

1. **Define Entity Constants**

   - Store entity names as constants in domain files located at `entity-module/domain/entity-name.domain.ts`.
   - Ensure that entity names are in camelCase.
   - Example: `export const BOOK_ENTITY_NAME = 'book';`

2. **Apply the `ControllerEntity` Decorator in Controllers**

   - Use the `ControllerEntity` decorator to mark controllers and associate them with the corresponding entities.
   - Example: `@ControllerEntity(BOOK_ENTITY_NAME)`

3. **Use the Appropriate Adapters**

   - Implement and extend `BaseResponseAdapter` to handle entity-specific response serialization.
   - Use specific adapters for each entity.
   - Example: `constructor(private readonly bookResponseAdapter: BookResponseAdapter)`

4. **Adhere to the JSON:API Specification**

   - Ensure that all API responses are formatted according to JSON:API.
   - This includes structures for successful responses and error handling.

5. **Consistent Error Handling Implementation**
   - Use `AppExceptionFilter` to capture and format exceptions consistently with the JSON:API specification.
   - Ensure clear details are provided in error responses.

### Recommendation: Using the `generate:crud` Script

To facilitate the creation of new modules and ensure that all basic endpoints are implemented following best practices, we highly recommend using the `generate:crud` script. This script will generate a module with all the necessary basic endpoints for managing an entity.

```sh
npm run generate:crud
```
