import { NextRequest, NextResponse } from 'next/server';
import { PromptTemplate } from "@langchain/core/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import "cheerio";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { pull } from "langchain/hub";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
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

  const llm = new ChatOpenAI({
    model,
    temperature,
    apiKey: apikey,
    maxTokens,
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

export async function POST(req: NextRequest): Promise<NextResponse> {
  const apikey = req.headers.get('OPENAI_API_KEY');
  if (!apikey) {
    return NextResponse.json({ error: "API key is required in header." }, { status: 400 });
  }

  try {
    const { query, url, model, temperature, maxTokens, chunkSize, chunkOverlap }: MainParams = await req.json();
    if (!query || !url) {
      return NextResponse.json({ error: "Query and URL are required parameters." }, { status: 400 });
    }
    const response = await main({ query, url, model, temperature, maxTokens, chunkSize, chunkOverlap, apikey });
    return NextResponse.json({ response: response });
  } catch (error) {
    console.error("Error in POST handler:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}