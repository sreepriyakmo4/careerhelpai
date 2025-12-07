import { db } from "../db.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { inngest } from "./client.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// CHANGED: gemini-1.5-flash to gemini-pro
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export const generateIndustryInsights = inngest.createFunction(
  { name: "Generate Industry Insights" },
  { cron: "0 0 * * 0" },
  async ({ step }) => {
    const industries = await step.run("Fetch Industries", async () => {
      return await db.industryInsight.findMany({
        select: { industry: true, nextUpdate: true },
      });
    });

    for (const { industry } of industries) {
      const prompt = `
        Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
        {
          "salaryRanges": [
            { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
          ],
          "growthRate": number,
          "demandLevel": "HIGH" | "MEDIUM" | "LOW",
          "topSkills": ["skill1", "skill2"],
          "marketOutlook": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
          "keyTrends": ["trend1", "trend2"],
          "recommendedSkills": ["skill1", "skill2"]
        }
        
        IMPORTANT RULES:
        - Return ONLY the JSON (no markdown, no text).
        - Enums MUST be UPPERCASE (HIGH/MEDIUM/LOW, POSITIVE/NEUTRAL/NEGATIVE).
        - Include at least 5 common roles for salaryRanges.
        - Growth rate should be a percentage (number).
        - Include at least 5 skills and 5 trends.
      `;

      const insights = await step.run(`Generate ${industry} Insights`, async () => {
        try {
          const result = await model.generateContent(prompt);
          const text = result.response.candidates[0].content.parts[0].text || "";
          const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
          return JSON.parse(cleanedText);
        } catch (error) {
          console.error(`Failed to generate insights for ${industry}:`, error);
          
          // Return fallback data instead of crashing
          return {
            salaryRanges: [
              { "role": "Junior Role", "min": 50000, "max": 80000, "median": 65000, "location": "United States" },
              { "role": "Mid Level", "min": 80000, "max": 120000, "median": 100000, "location": "United States" },
              { "role": "Senior Role", "min": 110000, "max": 160000, "median": 135000, "location": "United States" }
            ],
            growthRate: 7.5,
            demandLevel: "MEDIUM",
            topSkills: ["Communication", "Technical Skills", "Problem Solving"],
            marketOutlook: "POSITIVE",
            keyTrends: ["Digital Transformation", "Remote Work", "AI Adoption"],
            recommendedSkills: ["Data Analysis", "Project Management", "Leadership"]
          };
        }
      });

      await step.run(`Update ${industry} Insights`, async () => {
        await db.industryInsight.update({
          where: { industry },
          data: {
            ...insights,
            lastUpdated: new Date(),
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      });
    }
  }
);