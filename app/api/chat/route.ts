import { NextRequest, NextResponse } from 'next/server';
import { PromptTemplate } from "@langchain/core/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import "cheerio";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { OpenAI } from "@langchain/openai";
interface MainParams {
  query: string;
  url: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  chunkSize?: number;
  chunkOverlap?: number;
  apikey: string;
}

const main = async ({
  query,
  url,
  model = "gpt-3.5-turbo",
  temperature = 0.7,
  maxTokens = 1000,
  chunkSize = 1000,
  chunkOverlap = 200,
  apikey,
}: MainParams): Promise<any> => {
  if (!apikey) {
    throw new Error("API key is missing.");
  }

  const loader = new CheerioWebBaseLoader(url);
  const docs = await loader.load();

  const llm = new OpenAI({
    model,
    temperature,
    maxTokens,
    apiKey: apikey,
  });

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
  });
  const splits = await textSplitter.splitDocuments(docs);
  const vectorStore = await MemoryVectorStore.fromDocuments(splits, new OpenAIEmbeddings());
  const retriever = vectorStore.asRetriever();

  const template = `Use the following pieces of context to answer the question at the end.
  If you don't know the answer, just say that you don't know, don't try to make up an answer.

  {context}

  Question: {question}

  Helpful Answer:`;

  const customRagPrompt = PromptTemplate.fromTemplate(template);
  const ragChain = await createStuffDocumentsChain({
    llm,
    prompt: customRagPrompt,
    outputParser: new StringOutputParser(),
  });
  const context = await retriever.getRelevantDocuments(query);

  const res = await ragChain.invoke({
    question: query,
    context,
  });

  return res;
};

export async function GET(req: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ response: "Welcome to the **Chat with URL API**! This API uses various tools and libraries to fetch content from a URL, process it, and generate responses using OpenAI's language models. It supports both GET and POST requests." ,parameters: {
    query: "string",
    url: "string",
    model: "string (optional)",
    temperature: "number (optional)",
    maxTokens: "number (  optional)",
    chunkSize: "number (optional)",
    chunkOverlap: "number (optional)",
    apikey: "string (required)",
  }});



}


export async function POST(req: NextRequest): Promise<NextResponse> {
  

  try {

    const apikey = req.headers.get('OPENAI_API_KEY');
  console.log("Api Key Recieved")
  if (!apikey) {
    return NextResponse.json({ error: "API key is required in header." }, { status: 400 });
  }
    const { query, url, model, temperature, maxTokens, chunkSize, chunkOverlap }: MainParams = await req.json();
    console.log("Request Recieved")
    if (!query || !url) {
      return NextResponse.json({ error: "Query and URL are required parameters." }, { status: 400 });
    }
    const response = await main({ query, url, model, temperature, maxTokens, chunkSize, chunkOverlap, apikey });
    console.log("Response Recieved")
    return NextResponse.json({ response: response });
  } catch (error) {
    console.error("Error in POST handler:", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}