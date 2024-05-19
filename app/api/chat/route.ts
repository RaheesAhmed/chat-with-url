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
  try {
    if (!apikey) {
      throw new Error("OpenAI API key is missing.");
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
    const vectorStore = await MemoryVectorStore.fromDocuments(
      splits,
      new OpenAIEmbeddings()
    );

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
  } catch (error) {
    console.error("Error in main function:", error);
    throw error;
  }
};

export async function GET(req: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ message: 'Welcome to Chat with URL....' });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { query, url, model, temperature, maxTokens, chunkSize, chunkOverlap, apikey }: MainParams = await req.json();
    if (!query || !url || !apikey) {
      throw new Error("Query, URL, and API key are required parameters.");
    }
    console.log("Received request with query:", query, "and URL:", url, "and API key", apikey);
    const response = await main({ query, url, model, temperature, maxTokens, chunkSize, chunkOverlap, apikey });
    console.log("Response:", response);
    return NextResponse.json({response: response});
  } catch (error) {
    console.error("Error in POST handler:", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
