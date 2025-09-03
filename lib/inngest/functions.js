import { Inngest } from "inngest";
import { db } from "../lib/db.js";

export const generateIndustryInsights = inngest.createFunction(
    { name: "Generate Industry Insights" },
    { cron: "0 0 * * 0" }, 
    async ({ step}) => {
      const industries = await step.run("Fetch Industries", async () => {
        return await db.industryInsight.findMany({
            select: { industry: true, nextUpdate: true },
        });
    });
        for(const {industry} of industries ){
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
  const res = await step.ai.wrap("gemini" , async(p) =>{
    return  await model.generateContent(p);

  },prompt);
  const text= res.response.candidates[0].content.parts[0].text || "";
  const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
  const insights = JSON.parse(cleanedText);
  

  await step.run('Update ${industry} Insights', async () => {
    
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