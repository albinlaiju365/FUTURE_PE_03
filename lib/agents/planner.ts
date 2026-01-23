import { generateObject } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { z } from 'zod';

// We use a fast model for planning to keep latency low.
export const PlannerAgent = {
    async plan(query: string, context: string, persona: string) {
        const groq = createGroq({
            apiKey: process.env.GROQ_API_KEY
        });

        try {
            const { object } = await generateObject({
                model: groq('llama-3.3-70b-versatile'),
                mode: 'json',
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
