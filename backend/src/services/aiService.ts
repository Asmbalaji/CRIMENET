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

export const extractFIRData = async (documentText: string, documentType: string = 'UNKNOWN') => {
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_key_here') {
    throw new Error('GROQ_API_KEY is not configured or is invalid.');
  }

  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
  });

  const systemPrompt = `You are CRIMENET's document extraction engine.

Your task is to extract factual information from an uploaded case document.
The document type is: ${documentType}. Adjust your extraction priorities based on this type (e.g. CDRs have heavy communications, FIRs have incident details).

Extract only information explicitly supported by the document.

Never invent names, dates, locations, legal sections, evidence, relationships, or case details.

If a field is not present, return null or an empty array.

Distinguish between complainant, victim, suspect, accused, witness, and other persons based only on the document.

Do not determine guilt.

Do not make unsupported assumptions.

Preserve the wording of names and case identifiers as written where possible.

For relationships, create a relationship only when the document provides evidence for that relationship.

Every extracted person, location, evidence item, and relationship should include source page numbers whenever available.

Return a strictly formatted JSON object matching this exact schema:

{
  "case": {
    "caseNumber": "string | null",
    "firNumber": "string | null",
    "caseTitle": "string | null",
    "policeStation": "string | null",
    "district": "string | null",
    "state": "string | null",
    "firDate": "string | null",
    "incidentDate": "string | null",
    "incidentLocation": "string | null",
    "caseStatus": "string | null",
    "offenceDescription": "string | null",
    "legalSections": ["string"]
  },
  "persons": [
    {
      "name": "string",
      "role": "complainant|victim|suspect|accused|witness|other",
      "aliases": ["string"],
      "sourcePages": [1]
    }
  ],
  "locations": [
    {
      "name": "string",
      "address": "string | null",
      "city": "string",
      "district": "string | null",
      "state": "string",
      "type": "incident|residence|workplace|other",
      "sourcePages": [1]
    }
  ],
  "organizations": [
    {
      "name": "string",
      "type": "string",
      "sourcePages": [1]
    }
  ],
  "evidence": [
    {
      "description": "string",
      "type": "string",
      "sourcePages": [1]
    }
  ],
  "vehicles": [
    {
      "identifier": "string",
      "type": "string",
      "sourcePages": [1]
    }
  ],
  "financialReferences": [
    {
      "description": "string",
      "amount": "number | null",
      "currency": "string | null",
      "sourcePages": [1]
    }
  ],
  "relationships": [
    {
      "source": "string (person name)",
      "target": "string (person name)",
      "relationship": "string",
      "sourcePages": [1]
    }
  ],
  "summary": "string | null",
  "missingFields": ["string"],
  "confidence": {
    "overall": 0,
    "caseDetails": 0,
    "persons": 0,
    "locations": 0,
    "evidence": 0,
    "relationships": 0
  }
}`;

  const completion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: documentText }
    ],
    model: 'openai/gpt-oss-20b',
    response_format: { type: 'json_object' }
  });

  const responseContent = completion.choices[0]?.message?.content;
  if (!responseContent) throw new Error("No response from Groq");
  
  return JSON.parse(responseContent);
};
