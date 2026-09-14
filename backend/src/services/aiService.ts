import Groq from 'groq-sdk';
import { 
  SYNTHETIC_CASES, 
  SYNTHETIC_SUSPECTS, 
  SYNTHETIC_EVIDENCE, 
  SYNTHETIC_CRIME_LOCATIONS 
} from '../data/mockData';

export const analyzeQuery = async (query: string) => {
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_key_here') {
    throw new Error('GROQ_API_KEY is not configured or is invalid.');
  }

  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
  });

  const systemPrompt = `You are NEXUS-AI, an advanced criminal investigation assistant for the CRIMENET platform.
You must ground all your responses ONLY in the provided synthetic investigation data. Do not invent facts, criminals, or locations. 
If the data does not support a conclusion or answer the user's query, state that there is insufficient evidence.

Synthetic Data Context:
Suspects: ${JSON.stringify(SYNTHETIC_SUSPECTS)}
Cases: ${JSON.stringify(SYNTHETIC_CASES)}
Evidence: ${JSON.stringify(SYNTHETIC_EVIDENCE)}
Locations: ${JSON.stringify(SYNTHETIC_CRIME_LOCATIONS)}

Respond with a strictly formatted JSON object matching this schema:
{
  "finding": "Your main analytical conclusion (string)",
  "supportingEntities": [{"id": "SUS-xxx", "label": "Name"}],
  "supportingEvidence": [{"id": "EVD-xxx", "label": "Name"}],
  "detectedPattern": "Any pattern detected (string)",
  "confidence": 0-100 (number),
  "suggestedNextStep": "Actionable next step (string)"
}

Rules:
1. Ground the AI response ONLY in the synthetic CRIMENET investigation data.
2. Do not present synthetic entities as confirmed real criminals or real-world facts. Use terms that clarify this is synthetic analysis if appropriate.
3. If insufficient data, set confidence to 0 and state it in 'finding'.`;

  const completion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: query }
    ],
    model: 'openai/gpt-oss-20b',
    response_format: { type: 'json_object' }
  });

  const responseContent = completion.choices[0]?.message?.content;
  if (!responseContent) throw new Error("No response from Groq");
  
  return JSON.parse(responseContent);
};
