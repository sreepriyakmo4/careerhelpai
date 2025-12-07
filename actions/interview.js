"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateQuiz() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  console.log("Generating quiz for user:", userId);

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      industry: true,
      skills: true,
    },
  });

  if (!user) throw new Error("User not found");

  if (!user.industry) {
    throw new Error("Please set your industry in profile settings first");
  }

  const prompt = `
Generate exactly 10 technical interview questions for a ${user.industry} professional${
    user.skills?.length ? ` with expertise in ${user.skills.join(", ")}` : ""
  }.

Each question should be multiple choice with exactly 4 options (A, B, C, D).

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": "string (must match one of the options exactly)",
      "explanation": "string"
    }
  ]
}

Do not include any markdown formatting or additional text.
`;

  try {
    console.log("Calling OpenAI API...");

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // or "gpt-4" if available
      messages: [
        {
          role: "system",
          content: "You are a technical interview question generator. Always respond with valid JSON only, no additional text."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" }, // This forces JSON output
    });

    console.log("OpenAI response received");
    const content = response.choices[0].message.content;
    
    console.log("=== RAW OPENAI OUTPUT START ===");
    console.log(content);
    console.log("=== RAW OPENAI OUTPUT END ===");

    // Parse the response
    const quiz = JSON.parse(content);
    
    if (!quiz.questions || !Array.isArray(quiz.questions)) {
      console.error("Invalid response structure:", quiz);
      throw new Error("Invalid response format from AI");
    }

    console.log(`Successfully generated ${quiz.questions.length} questions`);
    return quiz.questions;
    
  } catch (error) {
    console.error("Error generating quiz:", {
      error: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Fallback to sample questions
    return getFallbackQuestions(user.industry, user.skills);
  }
}

// Fallback function if OpenAI fails
function getFallbackQuestions(industry, skills) {
  return [
    {
      question: `In ${industry}, what is the primary purpose of version control systems?`,
      options: [
        "To automatically debug code",
        "To track changes and collaborate on code",
        "To improve code performance",
        "To generate documentation"
      ],
      correctAnswer: "To track changes and collaborate on code",
      explanation: "Version control systems like Git help teams track changes, collaborate efficiently, and maintain code history."
    },
    {
      question: `Which practice is most important for maintaining code quality in ${industry}?`,
      options: [
        "Writing extensive comments",
        "Regular code reviews",
        "Using the latest frameworks",
        "Hiring more developers"
      ],
      correctAnswer: "Regular code reviews",
      explanation: "Code reviews catch issues early, share knowledge, and maintain consistent coding standards."
    },
    {
      question: `What is the main advantage of automated testing in ${industry}?`,
      options: [
        "Eliminates all bugs",
        "Reduces development time",
        "Provides fast feedback on code changes",
        "Replaces manual testing entirely"
      ],
      correctAnswer: "Provides fast feedback on code changes",
      explanation: "Automated tests give immediate feedback, allowing developers to catch regressions quickly."
    }
  ];
}

export async function saveQuizResult(questions, answers, score) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const questionResults = questions.map((q, index) => ({
    question: q.question,
    answer: q.correctAnswer,
    userAnswer: answers[index],
    isCorrect: q.correctAnswer === answers[index],
    explanation: q.explanation,
  }));

  const wrongAnswers = questionResults.filter((q) => !q.isCorrect);

  let improvementTip = null;

  if (wrongAnswers.length > 0) {
    const wrongQuestionsText = wrongAnswers
      .map(
        (q) =>
          `Question: "${q.question}"
Correct Answer: "${q.answer}"
User Answer: "${q.userAnswer}"`
      )
      .join("\n\n");

    const improvementPrompt = `
The user got ${wrongAnswers.length} technical interview questions wrong in ${user.industry}.

Mistakes:
${wrongQuestionsText}

Based on these mistakes, provide one specific, actionable improvement tip (max 2 sentences).
Focus on what they should study or practice, not on the mistakes themselves.
Make it encouraging and helpful.
`;

    try {
      const tipResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You provide concise, actionable study tips for technical interviews."
          },
          {
            role: "user",
            content: improvementPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 150,
      });

      improvementTip = tipResponse.choices[0].message.content.trim();
      console.log("Generated improvement tip:", improvementTip);
    } catch (error) {
      console.error("Error generating improvement tip:", error);
      // Continue without improvement tip
    }
  }

  try {
    const assessment = await db.assessment.create({
      data: {
        userId: user.id,
        quizScore: score,
        questions: questionResults,
        category: "Technical",
        improvementTip,
      },
    });

    return assessment;
  } catch (error) {
    console.error("Error saving quiz result:", error);
    throw new Error("Failed to save quiz result");
  }
}

export async function getAssessments() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const assessments = await db.assessment.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return assessments;
  } catch (error) {
    console.error("Error fetching assessments:", error);
    throw new Error("Failed to fetch assessments");
  }
}