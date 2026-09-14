import { Request, Response, NextFunction } from 'express';
import * as dataService from '../services/dataService';

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

import { analyzeQuery } from '../services/aiService';

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
