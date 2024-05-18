# Chat with URL API

Welcome to the **Chat with URL API**! This API uses various tools and libraries to fetch content from a URL, process it, and generate responses using OpenAI's language models. It supports both GET and POST requests.

## Table of Contents

- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Endpoints](#endpoints)
  - [GET /api](#get-api)
  - [POST /api](#post-api)
- [Request Parameters](#request-parameters)
- [Example Usage](#example-usage)
- [Error Handling](#error-handling)
- [Dependencies](#dependencies)
- [License](#license)

## Getting Started

To get started with this API, follow these steps:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/RaheesAhmed/chat-with-url.git
   cd chat-with-url
   ```

2. **Install the dependencies:**

   ```bash
   npm install
   ```

3. **Set up the environment variables:**

   Create a `.env` file in the root of your project and add your OpenAI API key:

   ```bash
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Run the development server:**

   ```bash
   npm run dev
   ```

5. **Open your browser:**

   Go to [http://localhost:3000](http://localhost:3000) to see the API in action.

## Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key. This is required for accessing OpenAI's models.

## Endpoints

### GET /api

Returns a welcome message.

#### Response

```json
{
  "message": "Welcome to Chat with URL...."
}
```

### POST /api

Processes the content from a given URL and generates a response using OpenAI's language models.

`Request Parameters`
`query (string)`: The question or query you want to ask based on the URL content.
`url (string)`: The URL of the content you want to process.
`model (string, optional)`: The OpenAI model to use (default is gpt-3.5-turbo).
`temperature (number, optional)`: The temperature for the OpenAI model (default is 0.7).
`maxTokens (number, optional)`: The maximum number of tokens for the OpenAI model (default is 1000).
`chunkSize (number, optional)`: The chunk size for splitting the content (default is 1000).
`chunkOverlap (number, optional)`: The chunk overlap for splitting the content (default is 200).
`apikey (string)`: The OpenAI API key (can be provided as an environment variable).

#### Response

The response will contain the generated answer based on the input query and URL content.

```json
{
  "result": "Your generated answer based on the query and URL content."
}
```

## Example Usage

```
curl -X POST http://localhost:3000/api -H "Content-Type: application/json" -d '{
  "query": "What is the main topic of the article?",
  "url": "https://example.com/article",
  "model": "gpt-3.5-turbo",
  "temperature": 0.7,
  "maxTokens": 1000,
  "chunkSize": 1000,
  "chunkOverlap": 200,
  "apikey": "your_openai_api_key"
}'


```

Response

```json
{
  "result": "The main topic of the article is about..."
}
```

## Error Handling

Errors are logged to the console, and the API returns a JSON response with the error message and a status code of 500.

Example Error Response

```json
{
  "error": "OpenAI API key is missing."
}
```

## Dependencies

`next:` The React framework for building server-side rendered applications.
`@langchain/core`: Core utilities for building language chain applications.
`@langchain/community`: Community utilities for building language chain applications.
`cheerio`: Fast, flexible, and lean implementation of core jQuery designed specifically for the server.
`dotenv`: Loads environment variables from a .env file.
`openai`: OpenAI API client.
`langchain`: Language chain utilities and components.

## License

This project is licensed under the MIT License.[License.md](License.md)
