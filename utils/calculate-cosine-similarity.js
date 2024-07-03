/**
 *
 * @param {number[]} vectorA
 * @param {number[]} vectorB
 * @returns {number}
 */
export function calculateCosineSimilarity(vectorA, vectorB) {
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
