import { extractFIRData } from './src/services/aiService';
import dotenv from 'dotenv';
dotenv.config();

extractFIRData('This is a FIR test.', 'FIR').then(console.log).catch(e => console.error(e));
