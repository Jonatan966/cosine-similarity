import "dotenv/config";

import fs from "fs/promises";
import { calculateCosineSimilarity } from "./utils/calculate-cosine-similarity.js";
import { openAIService } from "./services/openai.js";
import { readJsonFile } from "./utils/read-json-file.js";

const config = {
  minimumSimilarity: 0.9,
  answerTemperature: 0.2,
};

async function main() {
  const savedQuestions = await readJsonFile("./questions.json");

  const newQuestion = process.argv.at(-1).trim().toLowerCase();
  const questionEmbeddingResult = await openAIService.embeddings.create({
    model: "text-embedding-3-small",
    input: newQuestion,
  });

  const newQuestionEmbedding = questionEmbeddingResult.data[0].embedding;

  let mostSimilarQuestion;

  for (const question of savedQuestions) {
    const similarity = calculateCosineSimilarity(
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

  const newAnswer = await openAIService.chat.completions.create({
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
