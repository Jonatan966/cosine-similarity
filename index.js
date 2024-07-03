import "dotenv/config";

import { OpenAI } from "openai";
import fs from "fs/promises";

const config = {
  minimumSimilarity: 0.9,
  answerTemperature: 0.2,
};

const openAI = new OpenAI();

function cosineSimilarity(vectorA, vectorB) {
  let dotproduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let index = 0; index < vectorA.length; index++) {
    dotproduct += vectorA[index] * vectorB[index];
    magnitudeA += vectorA[index] * vectorA[index];
    magnitudeB += vectorB[index] * vectorB[index];
  }

  return dotproduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

async function main() {
  const savedQuestions = JSON.parse(
    (await fs.readFile("./questions.json")).toString()
  );

  const newQuestion = process.argv.at(-1).trim().toLowerCase();
  const questionEmbeddingResult = await openAI.embeddings.create({
    model: "text-embedding-3-small",
    input: newQuestion,
  });

  const newQuestionEmbedding = questionEmbeddingResult.data[0].embedding;

  let mostSimilarQuestion;

  for (const question of savedQuestions) {
    const similarity = cosineSimilarity(
      question.embedding,
      newQuestionEmbedding
    );

    if (similarity < config.minimumSimilarity) {
      continue;
    }

    if (similarity > (mostSimilarQuestion?.similarity || null)) {
      mostSimilarQuestion = {
        similarity,
        ...question,
      };
    }
  }

  if (!!mostSimilarQuestion) {
    console.log(">>>", mostSimilarQuestion?.question);
    console.log("[saved]", mostSimilarQuestion?.answer);
    return;
  }

  const newAnswer = await openAI.chat.completions.create({
    messages: [
      {
        role: "user",
        content: newQuestion,
      },
    ],
    model: "gpt-3.5-turbo",
    temperature: config.answerTemperature,
  });

  const answerContent = newAnswer.choices[0].message.content;

  savedQuestions.push({
    answer: answerContent,
    question: newQuestion,
    embedding: newQuestionEmbedding,
  });

  await fs.writeFile("./questions.json", JSON.stringify(savedQuestions));

  console.log("[new]", answerContent);
}

main();
