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

Extract only information explicitly present in the supplied document.

Do not invent names, locations, dates, phone numbers, case numbers, relationships, evidence, or identifiers.

If a field is not present, return null or an empty array.

For personal names:
- preserve the original name exactly when possible
- create an English transliteration/romanization
- DO NOT translate a person's name by meaning
- example:
  Tamil: ரமேஷ்
  nameEnglish: Ramesh

For locations:
- preserve the original value
- provide an English representation when confidently identifiable

Every extracted entity must include source page numbers.

Return only the required JSON structure.`;

  console.log(`[AI_EXTRACTION] Request - docType: ${documentType}, length: ${documentText.length}, model: openai/gpt-oss-20b`);

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `DOCUMENT TEXT:\n\n${documentText}` }
      ],
      model: 'openai/gpt-oss-20b',
      temperature: 0.1,
      max_tokens: 4096,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "fir_extraction",
          strict: true,
          schema: {
            type: "object",
            properties: {
              case: {
                type: "object",
                properties: {
                  caseNumber: { type: ["string", "null"] },
                  firNumber: { type: ["string", "null"] },
                  caseTitle: { type: ["string", "null"] },
                  policeStation: { type: ["string", "null"] },
                  district: { type: ["string", "null"] },
                  state: { type: ["string", "null"] },
                  firDate: { type: ["string", "null"] },
                  incidentDate: { type: ["string", "null"] },
                  incidentLocation: { type: ["string", "null"] },
                  caseStatus: { type: ["string", "null"] },
                  offenceDescription: { type: ["string", "null"] },
                  legalSections: {
                    type: "array",
                    items: { type: "string" }
                  }
                },
                required: [
                  "caseNumber",
                  "firNumber",
                  "caseTitle",
                  "policeStation",
                  "district",
                  "state",
                  "firDate",
                  "incidentDate",
                  "incidentLocation",
                  "caseStatus",
                  "offenceDescription",
                  "legalSections"
                ],
                additionalProperties: false
              },
      
              persons: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    nameOriginal: { type: ["string", "null"] },
                    nameEnglish: { type: ["string", "null"] },
                    originalLanguage: { type: ["string", "null"] },
                    role: {
                      type: "string",
                      enum: [
                        "complainant",
                        "victim",
                        "suspect",
                        "accused",
                        "witness",
                        "other"
                      ]
                    },
                    aliases: {
                      type: "array",
                      items: { type: "string" }
                    },
                    sourcePages: {
                      type: "array",
                      items: { type: "integer" }
                    }
                  },
                  required: [
                    "nameOriginal",
                    "nameEnglish",
                    "originalLanguage",
                    "role",
                    "aliases",
                    "sourcePages"
                  ],
                  additionalProperties: false
                }
              },
      
              locations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    original: { type: ["string", "null"] },
                    english: { type: ["string", "null"] },
                    address: { type: ["string", "null"] },
                    city: { type: ["string", "null"] },
                    district: { type: ["string", "null"] },
                    state: { type: ["string", "null"] },
                    sourcePages: {
                      type: "array",
                      items: { type: "integer" }
                    }
                  },
                  required: [
                    "original",
                    "english",
                    "address",
                    "city",
                    "district",
                    "state",
                    "sourcePages"
                  ],
                  additionalProperties: false
                }
              },
      
              organizations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    nameOriginal: { type: ["string", "null"] },
                    nameEnglish: { type: ["string", "null"] },
                    originalLanguage: { type: ["string", "null"] },
                    sourcePages: {
                      type: "array",
                      items: { type: "integer" }
                    }
                  },
                  required: [
                    "nameOriginal",
                    "nameEnglish",
                    "originalLanguage",
                    "sourcePages"
                  ],
                  additionalProperties: false
                }
              },
      
              evidence: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: ["string", "null"] },
                    description: { type: ["string", "null"] },
                    reference: { type: ["string", "null"] },
                    sourcePages: {
                      type: "array",
                      items: { type: "integer" }
                    }
                  },
                  required: [
                    "type",
                    "description",
                    "reference",
                    "sourcePages"
                  ],
                  additionalProperties: false
                }
              },
      
              vehicles: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    registrationNumber: { type: ["string", "null"] },
                    description: { type: ["string", "null"] },
                    sourcePages: {
                      type: "array",
                      items: { type: "integer" }
                    }
                  },
                  required: [
                    "registrationNumber",
                    "description",
                    "sourcePages"
                  ],
                  additionalProperties: false
                }
              },
      
              relationships: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    sourcePerson: { type: ["string", "null"] },
                    targetPerson: { type: ["string", "null"] },
                    relationshipType: { type: ["string", "null"] },
                    description: { type: ["string", "null"] },
                    sourcePages: {
                      type: "array",
                      items: { type: "integer" }
                    }
                  },
                  required: [
                    "sourcePerson",
                    "targetPerson",
                    "relationshipType",
                    "description",
                    "sourcePages"
                  ],
                  additionalProperties: false
                }
              },
      
              summary: {
                type: ["string", "null"]
              },
      
              missingFields: {
                type: "array",
                items: { type: "string" }
              },
      
              confidence: {
                type: "object",
                properties: {
                  overall: { type: "number" },
                  caseDetails: { type: "number" },
                  persons: { type: "number" },
                  locations: { type: "number" },
                  evidence: { type: "number" },
                  relationships: { type: "number" }
                },
                required: [
                  "overall",
                  "caseDetails",
                  "persons",
                  "locations",
                  "evidence",
                  "relationships"
                ],
                additionalProperties: false
              }
            },
      
            required: [
              "case",
              "persons",
              "locations",
              "organizations",
              "evidence",
              "vehicles",
              "relationships",
              "summary",
              "missingFields",
              "confidence"
            ],
      
            additionalProperties: false
          }
        }
      }
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) throw new Error("No response from Groq");
    
    console.log(`[AI_EXTRACTION] Success`);
    return JSON.parse(responseContent);
  } catch (error: any) {
    console.error(`[AI_EXTRACTION] Failed:`, error.message || error);
    throw {
      success: false,
      error: "Document extraction failed",
      code: "AI_EXTRACTION_VALIDATION_ERROR"
    };
  }
};
