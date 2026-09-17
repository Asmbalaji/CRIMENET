import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import { getCases, getEntities, getEvidence, getLocations } from './dataService';

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const analyzeCrossCaseLinks = async (newCaseId: string) => {
  const cases = getCases();
  const entities = getEntities();
  const evidence = getEvidence();
  const locations = getLocations();

  const newCase = cases.find((c: any) => c.id === newCaseId);
  if (!newCase) {
    throw new Error('New case not found');
  }

  const existingCases = cases.filter((c: any) => c.id !== newCaseId);
  if (existingCases.length === 0) {
    return [];
  }

  // Build context for AI
  const newCaseContext = {
    case: newCase,
    suspects: entities.filter((e: any) => newCase.suspectIds.includes(e.id)),
    evidence: evidence.filter((e: any) => e.caseId === newCase.id),
    locations: locations.filter((l: any) => l.caseId === newCase.id),
  };

  const existingCasesContext = existingCases.map((c: any) => ({
    case: c,
    suspects: entities.filter((e: any) => c.suspectIds.includes(e.id)),
    evidence: evidence.filter((e: any) => e.caseId === c.id),
    locations: locations.filter((l: any) => l.caseId === c.id),
  }));

  const systemPrompt = `You are NEXUS-AI, an advanced criminal intelligence analyzer.
Your task is to identify logical, evidence-supported relationships between a NEWLY verified case and EXISTING verified cases.

DO NOT hallucinate or assume connections based on vague similarities.
Look for:
- Exact or highly similar suspect names/aliases (SHARED_SUSPECT)
- Exact or highly similar incident locations or addresses (SHARED_LOCATION)
- Identical unique evidence artifacts (SHARED_EVIDENCE)
- Highly specific shared Modus Operandi (SHARED_MODUS_OPERANDI)
- Known communication logs between suspects across cases (COMMUNICATION_LINK)
- Direct financial transactions between suspects across cases (FINANCIAL_LINK)

Output your response STRICTLY as a JSON object containing a "links" array.
If no logical links exist, return { "links": [] }.

Schema for each link in the array:
{
  "targetCaseId": "The ID of the existing case this new case links to",
  "reason": "A 1-2 sentence explanation of the specific intelligence link",
  "supportingEntityId": "(Optional) The ID of the suspect that links them, if applicable",
  "supportingEvidenceId": "(Optional) The ID of the evidence that links them, if applicable",
  "confidence": "A number between 0 and 100",
  "relationshipType": "One of: SHARED_SUSPECT, SHARED_LOCATION, SHARED_MODUS_OPERANDI, FINANCIAL_LINK, COMMUNICATION_LINK, SHARED_EVIDENCE"
}`;

  const userPrompt = `
NEW CASE:
${JSON.stringify(newCaseContext, null, 2)}

EXISTING CASES:
${JSON.stringify(existingCasesContext, null, 2)}
  `;

  try {
    const response = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'openai/gpt-oss-20b',
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);
    
    if (parsed.links && Array.isArray(parsed.links)) {
      return parsed.links.map((link: any) => ({
        ...link,
        id: 'CCL-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        sourceCaseId: newCaseId,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      }));
    }
    
    return [];
  } catch (err) {
    console.error('Cross-case AI error', err);
    return [];
  }
};
