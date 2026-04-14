import { GoogleGenerativeAI } from '@google/generative-ai';

const geminiApiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY as string;

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(geminiApiKey);

// We use 2.5 Flash for speed and multimodal capabilities
export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });