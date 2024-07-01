import "dotenv/config";

import { OpenAI } from "openai";
import cosineSimilarity from "compute-cosine-similarity";

const openAI = new OpenAI();

async function main() {
  const embedding1 = await openAI.embeddings.create({
    model: "text-embedding-3-small",
    input: "Qual é a capital da França?",
  });

  const embedding2 = await openAI.embeddings.create({
    model: "text-embedding-3-small",
    input: "Que cidade é a capital da França?",
  });

  const similarity = cosineSimilarity(
    embedding1.data[0].embedding,
    embedding2.data[0].embedding
  );

  console.log(similarity);
}

main();
