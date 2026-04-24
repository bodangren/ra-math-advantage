import { getRequestSessionClaims } from '@/lib/auth/server';
import { NextRequest, NextResponse } from 'next/server';
import { resolveOpenRouterProviderFromEnv, assembleLessonChatbotContext } from '@math-platform/ai-tutoring';
import { fetchInternalMutation, fetchInternalQuery, internal } from '@/lib/convex/server';

const rateLimitsInternal = internal.rateLimits;
const studentInternal = internal.student;

interface ChatbotRequest {
  lessonId: string;
  phaseNumber: number;
  question: string;
}

function sanitizeInput(input: string): string {
  return input
    .replace(/\r?\n/g, ' ')
    .replace(/\b(Human|Assistant|System|User)\s*:/gi, '')
    .replace(/[<>{}]/g, '')
    .replace(/`/g, '')
    .replace(/~/g, '')
    .replace(/"""/g, '\\"\\"\\"')
    .trim();
}

function buildPrompt(
  context: {
    lessonTitle: string;
    unitTitle: string;
    phaseTitle: string;
    learningObjectives: string[];
    contentSummary: string;
  },
  question: string,
): string {
  return `You are a helpful math tutor for an Integrated Math 3 textbook. Answer only about the current lesson. Do not use external knowledge.

Lesson context:
- Unit: ${context.unitTitle}
- Lesson: ${context.lessonTitle}
- Phase: ${context.phaseTitle}
- Learning objectives: ${context.learningObjectives.join(', ')}
- Lesson content summary: ${context.contentSummary}

Student question:
"""
${question}
"""

Answer concisely, using only the lesson context above.`;
}

export async function POST(request: NextRequest) {
  const session = await getRequestSessionClaims(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.role !== 'student') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const profile = await fetchInternalQuery(
    internal.activities.getProfileByUsername,
    { username: session.username }
  );

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  let body: ChatbotRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { lessonId, phaseNumber, question } = body;

  if (!lessonId || typeof lessonId !== 'string' || lessonId.trim().length === 0) {
    return NextResponse.json({ error: 'Missing or invalid lessonId' }, { status: 400 });
  }

  if (!phaseNumber || typeof phaseNumber !== 'number' || phaseNumber < 1 || phaseNumber > 50) {
    return NextResponse.json({ error: 'Missing or invalid phaseNumber' }, { status: 400 });
  }

  if (!question || typeof question !== 'string') {
    return NextResponse.json({ error: 'Missing or invalid question' }, { status: 400 });
  }

  const sanitizedQuestion = sanitizeInput(question);
  if (sanitizedQuestion.length === 0 || sanitizedQuestion.length > 1000) {
    return NextResponse.json({ error: 'Question must be between 1 and 1000 characters' }, { status: 400 });
  }

  const isEnrolled = await fetchInternalQuery(
    studentInternal.isStudentEnrolledInClassForLesson,
    { studentId: profile.id, lessonId }
  );

  if (!isEnrolled) {
    return NextResponse.json(
      { error: 'Not enrolled in a class that has access to this lesson' },
      { status: 403 }
    );
  }

  try {
    const rateLimitResult = await fetchInternalMutation(
      rateLimitsInternal.checkAndIncrementRateLimit,
      { userId: profile.id }
    );

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment before trying again.' },
        { status: 429 }
      );
    }
  } catch (error) {
    console.error('[lesson-chatbot] Rate limit check failed:', error);
    return NextResponse.json(
      { error: 'Service temporarily unavailable. Please try again later.' },
      { status: 503 }
    );
  }

  try {
    const lessonData = await fetchInternalQuery(
      studentInternal.getLessonForChatbot,
      { lessonIdentifier: lessonId }
    );

    if (!lessonData) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    const phase = lessonData.phases.find((p: { phaseNumber: number }) => p.phaseNumber === phaseNumber);
    if (!phase) {
      return NextResponse.json({ error: 'Phase not found' }, { status: 404 });
    }

    const textSections = phase.sections
      .filter((s: { sectionType: string }) => s.sectionType === 'text')
      .map((s: { content: { markdown?: string } }) => s.content.markdown || '')
      .join('\n\n');

    const context = assembleLessonChatbotContext(
      { title: lessonData.lessonTitle, unit: { title: lessonData.unitTitle } },
      {
        title: phase.title,
        learningObjectives: lessonData.learningObjectives || [],
        content: textSections,
      }
    );

    const provider = resolveOpenRouterProviderFromEnv();
    if (!provider) {
      return NextResponse.json({ error: 'AI provider not configured' }, { status: 503 });
    }

    const prompt = buildPrompt(context, sanitizedQuestion);
    const aiResponse = await provider(prompt);

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error('[lesson-chatbot] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}