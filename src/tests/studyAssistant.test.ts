import { describe, it, expect } from 'vitest';
import { processStudyChat, ChatMessage } from '../../server/services/studyAiService';

describe('AI Study Assistant Engine - Repetitive Answers Bug Fix & Academic Accuracy', () => {
  it('correctly reports AI provider status without inventing live credentials', async () => {
    const res = await processStudyChat({
      message: 'Hello',
      subject: 'DBMS',
    });

    expect(res.success).toBe(true);
    expect(res.requestId).toBeDefined();
    expect(res.aiProvider).toBeDefined();
    expect(typeof res.aiProvider.configured).toBe('boolean');
    // If no GEMINI_API_KEY / OPENAI_API_KEY is configured in env, it should truthfully identify as offline engine
    if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
      expect(res.aiProvider.configured).toBe(false);
      expect(res.aiProvider.mode).toBe('offline-academic-engine');
      expect(res.aiProvider.model).toContain('Academic Engine');
      expect(res.aiProvider.setupInstructions).toContain('GEMINI_API_KEY');
    }
  });

  it('1. Answers "What is DBMS?" with comprehensive database concepts and ACID properties', async () => {
    const res = await processStudyChat({
      message: 'What is DBMS?',
      subject: 'DBMS',
    });

    expect(res.success).toBe(true);
    expect(res.reply).toContain('Database Management System');
    expect(res.reply).toContain('ACID');
    expect(res.reply.toLowerCase()).toContain('atomicity');
    expect(res.reply.toLowerCase()).toContain('durability');
    // Must NOT be the repetitive campus analyst cohort summary
    expect(res.reply).not.toContain('Analytical Summary for Selected Cohort');
  });

  it('2. Answers "Explain normalization in DBMS." with normal forms (1NF, 2NF, 3NF, BCNF) and anomalies', async () => {
    const res = await processStudyChat({
      message: 'Explain normalization in DBMS.',
      subject: 'DBMS',
    });

    expect(res.success).toBe(true);
    expect(res.reply).toContain('Normalization');
    expect(res.reply).toContain('1NF');
    expect(res.reply).toContain('2NF');
    expect(res.reply).toContain('3NF');
    expect(res.reply).toContain('BCNF');
    expect(res.reply.toLowerCase()).toContain('anomaly');
    expect(res.reply).not.toContain('Analytical Summary for Selected Cohort');
  });

  it('3. Answers "Write a Python binary search program." with working Python code', async () => {
    const res = await processStudyChat({
      message: 'Write a Python binary search program.',
      subject: 'DAA',
    });

    expect(res.success).toBe(true);
    expect(res.reply).toContain('def binary_search');
    expect(res.reply).toContain('while low <= high:');
    expect(res.reply).toContain('mid = low + (high - low) // 2');
    expect(res.reply).toContain('O(log n)');
    expect(res.reply).not.toContain('Analytical Summary for Selected Cohort');
  });

  it('4. Follow-up: Answers "Explain binary search line by line." referencing the algorithm steps', async () => {
    const history: ChatMessage[] = [
      { role: 'user', content: 'Write a Python binary search program.' },
      {
        role: 'assistant',
        content: 'def binary_search(arr, target):\n    low = 0\n    high = len(arr) - 1\n    while low <= high:\n        mid = low + (high - low) // 2\n        if arr[mid] == target: return mid',
      },
    ];

    const res = await processStudyChat({
      message: 'Explain binary search line by line.',
      subject: 'DAA',
      conversationHistory: history,
    });

    expect(res.success).toBe(true);
    expect(res.contextUsed.followUpDetected).toBe(true);
    expect(res.reply).toContain('Line');
    expect(res.reply.toLowerCase()).toContain('pointer');
    expect(res.reply.toLowerCase()).toContain('mid');
    expect(res.reply).not.toContain('Analytical Summary for Selected Cohort');
  });

  it('5. Answers "Give me five MCQs on normalization." with 5 questions, options, and explanations', async () => {
    const res = await processStudyChat({
      message: 'Give me five MCQs on normalization.',
      subject: 'DBMS',
    });

    expect(res.success).toBe(true);
    expect(res.reply).toContain('MCQ');
    expect(res.reply).toContain('Q1');
    expect(res.reply).toContain('Q2');
    expect(res.reply).toContain('Q3');
    expect(res.reply).toContain('Q4');
    expect(res.reply).toContain('Q5');
    expect(res.reply).toContain('Correct Answer:');
    expect(res.reply).not.toContain('Analytical Summary for Selected Cohort');
  });

  it('6. Follow-up: Answers "Explain normalization in simpler words." with intuitive analogies', async () => {
    const history: ChatMessage[] = [
      { role: 'user', content: 'Explain normalization in DBMS.' },
      {
        role: 'assistant',
        content: 'Normalization decomposes relations to eliminate partial and transitive dependencies (1NF, 2NF, 3NF, BCNF).',
      },
    ];

    const res = await processStudyChat({
      message: 'Explain normalization in simpler words.',
      subject: 'DBMS',
      conversationHistory: history,
    });

    expect(res.success).toBe(true);
    expect(res.contextUsed.followUpDetected).toBe(true);
    expect(res.reply).toContain('Simple Words');
    expect(res.reply.toLowerCase()).toContain('spreadsheet');
    expect(res.reply).not.toContain('Analytical Summary for Selected Cohort');
  });

  it('Verifies all 6 test questions return completely distinct, non-repetitive answers', async () => {
    const questions = [
      'What is DBMS?',
      'Explain normalization in DBMS.',
      'Write a Python binary search program.',
      'Explain binary search line by line.',
      'Give me five MCQs on normalization.',
      'Explain normalization in simpler words.',
    ];

    const answers: string[] = [];
    const conversationHistory: ChatMessage[] = [];

    for (const q of questions) {
      const res = await processStudyChat({
        message: q,
        subject: q.includes('search') ? 'DAA' : 'DBMS',
        conversationHistory: [...conversationHistory],
      });

      expect(res.success).toBe(true);
      expect(res.reply.length).toBeGreaterThan(50);
      answers.push(res.reply);
      conversationHistory.push({ role: 'user', content: q });
      conversationHistory.push({ role: 'assistant', content: res.reply });
    }

    // Ensure all 6 answers are unique (distinct contents)
    const uniqueAnswers = new Set(answers);
    expect(uniqueAnswers.size).toBe(6);

    // Ensure none of them contain the generic cohort summary
    answers.forEach((ans) => {
      expect(ans).not.toContain('Analytical Summary for Selected Cohort');
      expect(ans).not.toContain('The cohort has an average Success Score');
    });
  });
});
