import { Router, Request, Response } from 'express';
import { processStudyChat } from '../services/studyAiService';

const router = Router();

// GET /api/study-assistant/status - Check whether real AI provider is configured
router.get('/status', (_req: Request, res: Response) => {
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const openAiKey = process.env.OPENAI_API_KEY?.trim();

  const isConfigured = Boolean(geminiKey || openAiKey);
  const provider = geminiKey ? 'gemini' : openAiKey ? 'openai' : 'none';
  const model = geminiKey
    ? 'Google Gemini 1.5 Flash'
    : openAiKey
    ? 'OpenAI GPT-4o-mini'
    : 'EduPulse Local Academic Engine v2.0';

  return res.json({
    success: true,
    configured: isConfigured,
    provider,
    model,
    mode: isConfigured ? 'live-generative-ai' : 'offline-academic-engine',
    setupInstructions: isConfigured
      ? 'Live AI provider is active.'
      : 'To activate live AI responses, add GEMINI_API_KEY="your_key" to server/.env and restart the server.',
  });
});

// POST /api/study-assistant/chat - Send message and receive contextual, question-specific response
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, subject, conversationHistory, studentId, studentName } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid question or message prompt is required.',
      });
    }

    // Limit conversation history sent to the engine to last 12 items to prevent bloat
    const boundedHistory = Array.isArray(conversationHistory)
      ? conversationHistory.slice(-12)
      : [];

    const effectiveStudentId = studentId || req.user?.student_id || req.user?.id || 'anonymous';
    const effectiveStudentName = studentName || req.user?.name || 'Student';

    const response = await processStudyChat({
      message: message.trim(),
      subject: subject || 'Computer Science',
      conversationHistory: boundedHistory,
      studentId: effectiveStudentId,
      studentName: effectiveStudentName,
    });

    return res.json(response);
  } catch (err: any) {
    console.error('[StudyAssistant Route Error]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to process study assistant request.',
      error: err.message,
    });
  }
});

export default router;
