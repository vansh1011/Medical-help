require("dotenv").config();
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.CEREBRAS_API_KEY,
  baseURL: "https://api.cerebras.ai/v1",
});

async function test() {
  const res =
    await client.chat.completions.create({
      model: "gpt-oss-120b",
      messages: [
        {
          role: "user",
          content: "Hello"
        }
      ]
    });

  console.log(
    res.choices[0].message.content
  );
}

test();