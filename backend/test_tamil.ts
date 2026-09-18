import { extractFIRData } from './src/services/aiService';
import dotenv from 'dotenv';
dotenv.config();
extractFIRData('ரமேஷ்\nகோயம்புத்தூர்', 'FIR').then(d => console.log(JSON.stringify(d, null, 2))).catch(console.error);
