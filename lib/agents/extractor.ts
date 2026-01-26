import { generateObject } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { z } from 'zod';

// Specialized agent to extract and structure memories from conversations.
export const ExtractionAgent = {
    async extract(userMessage: string, aiResponse: string) {
        const groq = createGroq({
            apiKey: process.env.GROQ_API_KEY
        });

        try {
            const { object } = await generateObject({
                model: groq('llama-3.1-8b-instant'), // Using a smaller model for speed/efficiency in background tasks
                mode: 'json',
                schema: z.object({
                    memories: z.array(z.object({
                        content: z.string().describe("The hard fact to remember. e.g. 'User lives in Kerala'"),
                        type: z.enum(['identity', 'project', 'behavioral', 'ephemeral']),
                        importance: z.enum(['high', 'medium', 'low']),
                    })).describe("Key facts to store in long-term memory."),
                    updates: z.object({
                        name: z.string().optional().describe("If user explicitly stated a new name or corrected theirs"),
                        persona_preference: z.enum(['nexis', 'inventor']).optional().describe("If user expressed a preference for a specific bot personality")
                    }).optional()
                }),
                prompt: `
                    You are the NEURAL EXTRACTION NODE of NEXIS OS.
                    Analyze the following exchange between a USER and the AI.
                    Your goal is to ensure the AI 'learns' about the user organically.
                    
                    USER MESSAGE: "${userMessage}"
                    AI RESPONSE: "${aiResponse}"
                    
                    TASK A: EXTRACT MEMORIES
                    - Look for: Personal background, project details, preferences, skills, habits.
                    - 'identity': Core facts about who the user is.
                    - 'project': Specific work or tasks they are doing.
                    - 'behavioral': Likes, dislikes, and communication styles.
                    - 'ephemeral': Temporary facts that might be useful for a few days.
                    
                    TASK B: IDENTITY UPDATES
                    - If the user says "Call me [Name]" or "My name is [Name]", extract that name.
                    - If they ask the AI to change its personality, record the preference.
                    
                    Be precise. Do not invent facts.
                `
            });
            return object;
        } catch (error) {
            console.error("Extraction failure:", error);
            return null;
        }
    }
};
