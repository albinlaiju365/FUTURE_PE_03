import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';

// We use a fast model for planning to keep latency low.
// Gemini Flash is perfect for this.
const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY
});

export const PlannerAgent = {
    async plan(query: string, context: string, persona: string) {
        try {
            const { object } = await generateObject({
                model: google('gemini-1.5-flash'),
                schema: z.object({
                    intent: z.enum(['technical_explanation', 'creative_writing', 'debugging', 'casual_chat', 'system_command']),
                    reasoning: z.string().describe("Brief internal thought process about why this plan was chosen."),
                    steps: z.array(z.string()).describe("High-level steps to construct the response."),
                    tone: z.enum(['professional', 'casual', 'concise', 'detailed']),
                }),
                prompt: `
                    You are the PLANNER NODE of NEXIS OS.
                    Analyze the incoming user query.
                    
                    USER QUERY: "${query}"
                    CURRENT PERSONA: ${persona}
                    AVAILABLE CONTEXT: ${context.substring(0, 1000)}...
                    
                    Decide the best strategy to answer this.
                    If the user asks for code, plan a technical explanation.
                    If the user says hello, plan a casual chat.
                `
            });
            return object;
        } catch (error) {
            console.error("Planner failure:", error);
            // Fallback plan
            return {
                intent: 'casual_chat',
                reasoning: 'Planner failed, defaulting to direct response.',
                steps: ['Respond directly to user'],
                tone: 'professional'
            };
        }
    }
};
