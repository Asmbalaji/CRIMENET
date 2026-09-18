import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface PipelineResult {
  documentType: 'FIR' | 'CDR' | 'INTERROGATION_REPORT' | 'WARRANT' | 'UNKNOWN';
  language: string;
  normalizedText: string;
}

export const processDocumentPipeline = async (rawText: string): Promise<PipelineResult> => {
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_key_here') {
    throw new Error('GROQ_API_KEY is not configured or is invalid.');
  }

  const systemPrompt = `You are a Document Pre-Processor for an intelligence system.
Your job is to analyze the provided raw text, detect its primary language, identify its document type, and comprehensively translate/normalize the text into standardized English.

Document Types:
- FIR (First Information Report)
- CDR (Call Detail Record)
- INTERROGATION_REPORT
- WARRANT
- UNKNOWN

Rules for Normalization:
1. Translate any non-English text to English.
2. If the document is a CDR, format the text clearly as a chronological log of calls.
3. Fix obvious OCR errors if possible.
4. DO NOT hallucinate details. If information is illegible or unclear, represent it as [Unclear].

Output format must be strictly a JSON object:
{
  "documentType": "FIR | CDR | INTERROGATION_REPORT | WARRANT | UNKNOWN",
  "language": "Detected primary language (e.g., Hindi, Tamil, English)",
  "normalizedText": "The fully translated and standardized English text"
}`;

  try {
    const response = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `RAW TEXT:\n${rawText}` }
      ],
      model: 'openai/gpt-oss-20b',
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);
    
    return {
      documentType: parsed.documentType || 'UNKNOWN',
      language: parsed.language || 'Unknown',
      normalizedText: parsed.normalizedText || rawText
    };
  } catch (err) {
    console.error('Document pipeline error', err);
    // Fallback to basic passthrough
    return {
      documentType: 'UNKNOWN',
      language: 'Unknown',
      normalizedText: rawText
    };
  }
};
