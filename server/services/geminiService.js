import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env.js';

export async function parseVoiceTranscriptWithGemini(transcriptText) {
  if (!transcriptText || typeof transcriptText !== 'string') {
    throw new Error('Transcript text is required');
  }

  const apiKey = config.geminiApiKey;

  // Explicit error reporting if Gemini API key is missing or default placeholder
  if (!apiKey || apiKey === '' || apiKey === 'YOUR_GEMINI_API_KEY') {
    console.warn('[GEMINI SERVICE WARN] GEMINI_API_KEY is not configured in .env file.');
    throw new Error('GEMINI_API_KEY_MISSING');
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const systemPrompt = `You are a specialized Snakebite Emergency Triage Dispatch Assistant in India.
Analyze the following emergency audio transcript spoken by a victim or bystander:
"${transcriptText}"

Extract structured JSON strictly following this schema:
{
  "location_description": "Extracted location name, landmark, or town mentioned",
  "estimated_lat": 18.7617 or null (if Chakan 18.7617, Pimpri 18.6279, Shirur 18.8278, Hadapsar 18.5089, Pune center 18.5262, Talegaon 18.7300),
  "estimated_lon": 73.8587 or null,
  "symptoms": ["List of identified envenoming symptoms (e.g. swelling, ptosis, fang marks, bleeding, breathing difficulty)"],
  "bite_time_minutes_ago": Number estimated or 30 default,
  "snake_description": "Snake type or color if mentioned",
  "asv_vials_needed": 10 or 15 or 20 (suggest 15-20 if neurotoxic/severe, 10 for standard),
  "requires_ventilator": true if difficulty breathing, respiratory failure, or paralysis mentioned, else false,
  "severity_grade": "MILD" or "MODERATE" or "SEVERE"
}

Return ONLY valid JSON. No markdown formatting, no commentary.`;

    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();
    
    // Clean potential markdown blocks
    const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanedJson);
    return parsedData;
  } catch (error) {
    console.warn(`[GEMINI SERVICE WARN] Gemini API call failed (${error.message}). Using fallback NLP parser.`);
    return fallbackNlpParser(transcriptText);
  }
}

// Fallback rule-based NLP parser for voice transcript
function fallbackNlpParser(text) {
  const lower = text.toLowerCase();
  
  const symptoms = [];
  if (lower.includes('swelling') || lower.includes('pain') || lower.includes('bite') || lower.includes('marks')) {
    symptoms.push('Local pain and swelling at bite site');
  }
  if (lower.includes('breath') || lower.includes('suffocat') || lower.includes('throat') || lower.includes('chok')) {
    symptoms.push('Respiratory distress / dyspnea');
  }
  if (lower.includes('eye') || lower.includes('droop') || lower.includes('ptosis') || lower.includes('vision') || lower.includes('blur')) {
    symptoms.push('Ptosis (drooping eyelids) & neurotoxic signs');
  }
  if (lower.includes('bleed') || lower.includes('blood') || lower.includes('vomit')) {
    symptoms.push('Hemotoxic signs / active bleeding');
  }
  if (symptoms.length === 0) {
    symptoms.push('Snakebite envenoming symptoms reported via voice triage');
  }

  const requiresVentilator = lower.includes('breath') || lower.includes('chok') || lower.includes('suffocat') || lower.includes('paraly');
  const asvVials = requiresVentilator ? 15 : 10;

  let lat = 18.7617; // Default Chakan rural
  let lon = 73.8587;
  let location = 'Rural Pune District';

  if (lower.includes('pimpri') || lower.includes('ycm')) {
    lat = 18.6279; lon = 73.8188; location = 'Pimpri area';
  } else if (lower.includes('aundh')) {
    lat = 18.5602; lon = 73.8122; location = 'Aundh area';
  } else if (lower.includes('hadapsar')) {
    lat = 18.5089; lon = 73.9260; location = 'Hadapsar bypass';
  } else if (lower.includes('shirur')) {
    lat = 18.8278; lon = 74.3789; location = 'Shirur rural';
  } else if (lower.includes('talegaon')) {
    lat = 18.7300; lon = 73.6800; location = 'Talegaon Dabhade';
  } else if (lower.includes('chakan')) {
    lat = 18.7617; lon = 73.8587; location = 'Chakan market region';
  }

  return {
    location_description: location,
    estimated_lat: lat,
    estimated_lon: lon,
    symptoms: symptoms,
    bite_time_minutes_ago: 30,
    snake_description: lower.includes('cobra') ? 'Cobra' : (lower.includes('viper') ? 'Viper' : 'Unknown snake'),
    asv_vials_needed: asvVials,
    requires_ventilator: requiresVentilator,
    severity_grade: requiresVentilator ? 'SEVERE' : 'MODERATE'
  };
}
