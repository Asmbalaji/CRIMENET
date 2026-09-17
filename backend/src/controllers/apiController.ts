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
    } else {
      res.status(400).json({ success: false, message: 'Unsupported file type. Please upload a PDF or TXT.' });
      return;
    }

    if (!extractedText.trim()) {
      res.status(400).json({ success: false, message: 'Unable to extract readable text from this document.' });
      return;
    }

    const aiResult = await extractFIRData(extractedText);
    res.json({ success: true, data: aiResult });
  } catch (error) {
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
