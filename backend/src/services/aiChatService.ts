import Groq from 'groq-sdk';
import * as dataService from './dataService';

// In-memory conversational state mapped by conversationId
const conversations: Record<string, any[]> = {};

function buildNexusContext(message: string, caseId?: string) {
  const allCases = dataService.getCases();
  const allEntities = dataService.getEntities();
  const allEvidence = dataService.getEvidence();
  const allLocations = dataService.getLocations();
  const allLinks = dataService.getCrossCaseLinks();

  const msgLower = message.toLowerCase();

  let contextData: any = {};

  if (caseId) {
    const targetCase = allCases.find(c => c.id === caseId);
    if (targetCase) {
      contextData.targetCase = targetCase;
      contextData.relatedEntities = allEntities.filter(e => e.associatedCaseIds && e.associatedCaseIds.includes(caseId));
      contextData.relatedEvidence = allEvidence.filter(e => e.caseId === caseId);
      contextData.relatedLocations = allLocations.filter(loc => loc.caseId === caseId);
      contextData.relatedLinks = allLinks.filter(l => l.sourceCaseId === caseId || l.targetCaseId === caseId);
    }
  } else {
    // If asking about a specific case implicitly by ID
    const mentionedCase = allCases.find(c => msgLower.includes(c.id.toLowerCase()) || (c.caseNumber && msgLower.includes(c.caseNumber.toLowerCase())));
    if (mentionedCase) {
      contextData.targetCase = mentionedCase;
      contextData.relatedEntities = allEntities.filter(e => e.associatedCaseIds && e.associatedCaseIds.includes(mentionedCase.id));
      contextData.relatedEvidence = allEvidence.filter(e => e.caseId === mentionedCase.id);
      contextData.relatedLocations = allLocations.filter(loc => loc.caseId === mentionedCase.id);
      contextData.relatedLinks = allLinks.filter(l => l.sourceCaseId === mentionedCase.id || l.targetCaseId === mentionedCase.id);
    }
    
    // Global questions - add a slice of data depending on keywords
    if (msgLower.includes('case') || msgLower.includes('active')) {
      contextData.allCases = allCases.map(c => ({ id: c.id, caseNumber: c.caseNumber, title: c.title, status: c.status }));
    }
    if (msgLower.includes('entit') || msgLower.includes('person') || msgLower.includes('who')) {
      contextData.entities = allEntities.map(e => ({ id: e.id, nameOriginal: e.nameOriginal, name: e.name, associatedCaseIds: e.associatedCaseIds }));
    }
    if (msgLower.includes('evidence') || msgLower.includes('document')) {
      contextData.evidence = allEvidence.map(e => ({ id: e.id, title: e.title, caseId: e.caseId }));
    }
    if (msgLower.includes('location') || msgLower.includes('where') || msgLower.includes('map')) {
      contextData.locations = allLocations.map(l => ({ id: l.id, city: l.city, caseId: l.caseId }));
    }
    if (msgLower.includes('connect') || msgLower.includes('link') || msgLower.includes('relation') || msgLower.includes('cross')) {
      contextData.crossCaseLinks = allLinks;
    }
  }

  // If DB is completely empty (no cases at all), just return an empty flag
  if (allCases.length === 0) {
    return "DATABASE_EMPTY";
  }

  return JSON.stringify(contextData);
}

export const chatWithNexus = async (message: string, caseId: string | null, conversationId: string) => {
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_key_here') {
    throw new Error('GROQ_API_KEY is not configured or is invalid.');
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  
  if (!conversations[conversationId]) {
    conversations[conversationId] = [];
  }

  const contextData = buildNexusContext(message, caseId || undefined);

  if (contextData === "DATABASE_EMPTY") {
     return {
        success: true,
        answer: "There is currently no verified case data available in CRIMENET.",
        sources: [],
        caseIds: [],
        entityIds: [],
        evidenceIds: [],
        locationIds: [],
        relationshipIds: []
     };
  }

  const systemPrompt = `You are NEXUS-AI, the investigation intelligence assistant inside CRIMENET.
Your job is to help investigators understand verified investigation data.
Use ONLY the CRIMENET context supplied to you in the system prompt for the current turn.

CRIMENET DATA CONTEXT:
${contextData}

Never invent:
- people
- cases
- evidence
- locations
- relationships
- phone numbers
- identifiers
- dates
- organizations
- financial references

If the requested information is not present, say:
'I could not find that information in the verified CRIMENET data.'

Do not treat analytical scores as proof of guilt.
Do not declare a person guilty.
Do not infer criminal intent from weak or indirect associations.

Clearly distinguish:
- documented fact
- analytical observation
- possible connection
- unverified information

When answering, cite the relevant CRIMENET source records supplied in the context (Case IDs, Evidence IDs, Location IDs, etc).

For multilingual records: understand both original-language and English-normalized values.
For names: English values are transliterations/romanizations, not translations.

Be concise but useful.
If a user asks about a case, mention the Case ID when available.
If a relationship is not verified, clearly state that it is pending review.

Respond with a strictly formatted JSON object matching this schema:
{
  "answer": "Your detailed conversational answer (string, markdown supported)",
  "sources": ["List of readable source names you used (e.g. 'Evidence EV-004')"],
  "caseIds": ["List of Case IDs mentioned"],
  "entityIds": ["List of Entity IDs mentioned"],
  "evidenceIds": ["List of Evidence IDs mentioned"],
  "locationIds": ["List of Location IDs mentioned"],
  "relationshipIds": ["List of CrossCaseLink IDs mentioned"]
}`;

  const messagesToGroq = [
    { role: 'system', content: systemPrompt },
    ...conversations[conversationId],
    { role: 'user', content: message }
  ];

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: messagesToGroq as any,
      model: 'openai/gpt-oss-20b', // defaults to specified model
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const aiMessageText = chatCompletion.choices[0]?.message?.content || '{}';
    let aiResponse;
    try {
      aiResponse = JSON.parse(aiMessageText);
    } catch (e) {
      console.error("Failed to parse JSON response from Groq:", e);
      aiResponse = {
         answer: "Error: The model did not return valid JSON.",
         sources: [],
         caseIds: [],
         entityIds: [],
         evidenceIds: [],
         locationIds: [],
         relationshipIds: []
      };
    }

    // Save strictly the conversation (not the massive context block) to save tokens
    conversations[conversationId].push({ role: 'user', content: message });
    conversations[conversationId].push({ role: 'assistant', content: aiMessageText });

    // Keep memory bounded to last 6 messages (3 turns)
    if (conversations[conversationId].length > 6) {
      conversations[conversationId] = conversations[conversationId].slice(conversations[conversationId].length - 6);
    }

    return {
      success: true,
      answer: aiResponse.answer || 'No answer generated.',
      sources: Array.isArray(aiResponse.sources) ? aiResponse.sources : [],
      caseIds: Array.isArray(aiResponse.caseIds) ? aiResponse.caseIds : [],
      entityIds: Array.isArray(aiResponse.entityIds) ? aiResponse.entityIds : [],
      evidenceIds: Array.isArray(aiResponse.evidenceIds) ? aiResponse.evidenceIds : [],
      locationIds: Array.isArray(aiResponse.locationIds) ? aiResponse.locationIds : [],
      relationshipIds: Array.isArray(aiResponse.relationshipIds) ? aiResponse.relationshipIds : [],
    };

  } catch (error: any) {
    console.error("Groq chat error:", error);
    throw new Error(error.message || 'Error communicating with Groq API');
  }
};

export const clearConversation = (conversationId: string) => {
  if (conversations[conversationId]) {
    delete conversations[conversationId];
  }
  return { success: true };
};
