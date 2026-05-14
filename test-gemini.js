import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = 'AIzaSyD-rgnP6gdOsELJX2APMO347XIH9uy3v0o';
const genAI = new GoogleGenerativeAI(apiKey);

async function run(modelName) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("hello");
    console.log(`Success with ${modelName}:`, result.response.text());
  } catch (err) {
    console.error(`Error with ${modelName}:`, err.message);
  }
}

async function main() {
  await run("gemini-2.5-flash");
  await run("gemini-flash-latest");
  await run("gemini-3.1-flash-lite");
}
main();
