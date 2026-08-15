import express from 'express';
import { getHospitals, getAmbulances, updateAsvStock } from '../controllers/hospitalController.js';
import { matchTriage } from '../controllers/triageController.js';
import { executeDispatch, getActiveCases, receiveTelemetry, getAmbulanceTracking } from '../controllers/dispatchController.js';
import { parseVoiceTranscriptWithGemini } from '../services/geminiService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Hospital & Inventory Endpoints
router.get('/hospitals', getHospitals);
router.get('/ambulances', getAmbulances);
router.patch('/hospitals/:hospitalId/asv', authenticateToken, updateAsvStock);

// Triage & Emergency Routing
router.post('/triage/match', matchTriage);

// Conversational Voice Triage Parser (Gemini LLM)
router.post('/triage/voice-parse', async (req, res) => {
  try {
    const { transcript } = req.body;
    if (!transcript) {
      return res.status(400).json({ success: false, error: 'Voice transcript is required' });
    }
    const parsedData = await parseVoiceTranscriptWithGemini(transcript);
    return res.json({ success: true, data: parsedData });
  } catch (error) {
    if (error.message === 'GEMINI_API_KEY_MISSING') {
      return res.status(400).json({
        success: false,
        error: 'GEMINI_API_KEY_MISSING',
        message: 'Gemini API key is not configured in server .env file. Please add GEMINI_API_KEY to enable AI voice triage.'
      });
    }
    console.error('Voice parsing endpoint error:', error);
    return res.status(500).json({ success: false, error: 'Failed to process voice transcript', message: error.message });
  }
});

// Transactional Dispatch & ASV Reservation
router.post('/dispatch/execute', executeDispatch);
router.get('/dispatch/cases', getActiveCases);

// Ambulance Telemetry & Signal Monitoring
router.post('/ambulance/telemetry', receiveTelemetry);
router.get('/ambulance/:ambulanceId/tracking', getAmbulanceTracking);

export default router;
