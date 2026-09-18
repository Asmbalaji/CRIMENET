import { Request, Response, NextFunction } from 'express';
import * as dataService from '../services/dataService';
import * as geocodeService from '../services/geocodeService';

export const getCases = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(dataService.getCases());
  } catch (error) {
    next(error);
  }
};

export const deleteCase = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const success = dataService.deleteCase(id);
    if (!success) {
      res.status(404).json({
        success: false,
        error: 'Case not found',
        code: 'CASE_NOT_FOUND'
      });
      return;
    }
    res.json({
      success: true,
      message: 'Case deleted successfully',
      caseId: id
    });
  } catch (error) {
    next(error);
  }
};

export const getEntities = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(dataService.getEntities());
  } catch (error) {
    next(error);
  }
};

export const getEvidence = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(dataService.getEvidence());
  } catch (error) {
    next(error);
  }
};

export const getNetwork = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(dataService.getNetwork());
  } catch (error) {
    next(error);
  }
};

export const getLocations = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(dataService.getLocations());
  } catch (error) {
    next(error);
  }
};

export const getAlerts = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(dataService.getAlerts());
  } catch (error) {
    next(error);
  }
};

export const getDashboardMetrics = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(dataService.getDashboardMetrics());
  } catch (error) {
    next(error);
  }
};

export const createCase = (req: Request, res: Response, next: NextFunction) => {
  try {
    dataService.addCase(req.body);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const createEntity = (req: Request, res: Response, next: NextFunction) => {
  try {
    dataService.addEntity(req.body);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const createEvidence = (req: Request, res: Response, next: NextFunction) => {
  try {
    dataService.addEvidence(req.body);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const createLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const location = req.body;
    
    // Check if we need geocoding
    if (location.lat === null || location.lng === null) {
      const geoResult = await geocodeService.geocodeLocation(location.city, location.state);
      if (geoResult) {
        location.lat = geoResult.lat;
        location.lng = geoResult.lng;
      }
    }
    
    dataService.addLocation(location);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

import { analyzeQuery, extractFIRData } from '../services/aiService';
import { chatWithNexus, clearConversation } from '../services/aiChatService';

export const chatAi = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, caseId, conversationId, action } = req.body;
    
    if (action === 'clear') {
      const result = clearConversation(conversationId);
      res.json(result);
      return;
    }

    if (!message) {
      res.status(400).json({ success: false, message: 'Message is required' });
      return;
    }
    const result = await chatWithNexus(message, caseId, conversationId || 'default-session');
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const analyzeAi = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query } = req.body;
    if (!query) {
      res.status(400).json({ success: false, message: 'Query is required' });
      return;
    }
    const result = await analyzeQuery(query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getAi = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(dataService.getAiResponse());
  } catch (error) {
    next(error);
  }
};

import pdfParse from 'pdf-parse';

import Tesseract from 'tesseract.js';
import { processDocumentPipeline } from '../services/documentPipelineService';

export const extractCaseInformation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    let extractedText = '';

    if (req.file.mimetype === 'application/pdf') {
      const data = await (pdfParse as any)(req.file.buffer);
      extractedText = data.text;
    } else if (req.file.mimetype === 'text/plain') {
      extractedText = req.file.buffer.toString('utf-8');
    } else if (req.file.mimetype === 'image/jpeg' || req.file.mimetype === 'image/png' || req.file.mimetype === 'image/jpg') {
      const { data: { text } } = await Tesseract.recognize(req.file.buffer, 'eng+hin+tam');
      extractedText = text;
    } else {
      res.status(400).json({ success: false, message: 'Unsupported file type. Please upload a PDF, TXT, JPG, or PNG.' });
      return;
    }

    if (!extractedText.trim()) {
      res.status(400).json({ 
        success: false, 
        error: 'Unable to extract readable text from this document.',
        code: 'EMPTY_DOCUMENT_TEXT'
      });
      return;
    }

    // Step 2 & 3 & 4: Pipeline (Type Detection, Language, Normalization)
    const pipelineResult = await processDocumentPipeline(extractedText);

    // Step 5: Structured Extraction (pass raw text and doc type to ensure original language names are retained)
    const aiResult = await extractFIRData(extractedText, pipelineResult.documentType);
    
    res.json({ 
      success: true, 
      data: aiResult,
      pipelineMetadata: {
        documentType: pipelineResult.documentType,
        language: pipelineResult.language
      }
    });
  } catch (error: any) {
    if (error.code === 'AI_INVALID_JSON' || error.code === 'AI_EXTRACTION_FAILED' || error.code === 'EMPTY_DOCUMENT_TEXT') {
      res.status(400).json({
        success: false,
        error: error.error || error.message || 'Document extraction failed',
        code: error.code
      });
      return;
    }
    next(error);
  }
};

import { analyzeCrossCaseLinks } from '../services/crossCaseAiService';

export const getCrossCaseLinks = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(dataService.getCrossCaseLinks());
  } catch (error) {
    next(error);
  }
};

export const detectCrossCaseLinks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const detectedLinks = await analyzeCrossCaseLinks(id);
    
    // Save them to db
    detectedLinks.forEach((link: any) => dataService.addCrossCaseLink(link));
    
    res.json({ success: true, count: detectedLinks.length, links: detectedLinks });
  } catch (error) {
    next(error);
  }
};

export const verifyCrossCaseLink = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (status !== 'VERIFIED' && status !== 'REJECTED') {
      res.status(400).json({ success: false, message: 'Invalid status' });
      return;
    }
    dataService.updateCrossCaseLinkStatus(id, status);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
