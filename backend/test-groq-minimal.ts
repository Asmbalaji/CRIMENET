import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: 'C:/Users/Balaji Tharsan/.gemini/antigravity/scratch/crimenet/backend/.env' });

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function testMinimalSchema() {
  const schema = {
    type: "object",
    properties: {
      summary: { type: "string" },
      language: { type: "string" }
    },
    required: ["summary", "language"],
    additionalProperties: false
  };

  console.log("Testing minimal schema...");
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'Extract the summary and language.' },
        { role: 'user', content: 'This is a test document in English about a theft.' }
      ],
      model: 'openai/gpt-oss-20b',
      temperature: 0.1,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "simple_document_test",
          strict: true,
          schema: schema
        }
      }
    });
    
    console.log("Success!", completion.choices[0]?.message?.content);
  } catch (err: any) {
    console.error("Error:", err.message);
    if (err.error) {
      console.error(err.error);
    }
  }
}

testMinimalSchema();
