import { createHuggingFace } from '@ai-sdk/huggingface';
import { streamText } from 'ai';
import { getCurrentUser } from '@/lib/auth';
import { MemoryManager } from '@/lib/agents/memory-manager';
import { PlannerAgent } from '@/lib/agents/planner';
import { CriticAgent } from '@/lib/agents/critic';
import { ExtractionAgent } from '@/lib/agents/extractor';
import { sql } from '@/lib/db';


export const maxDuration = 30;

export async function POST(req: Request) {
    const hf = createHuggingFace({
        apiKey: process.env.HUGGING_FACE_API_KEY,
    });
    try {
        // 1. AUTHENTICATION LAYER
        const user: any = await getCurrentUser();

        if (!user) {
            return new Response("Unauthorized: Login required.", { status: 401 });
        }

        const userId = user.id;

        // 3. AGENTIC PLANNING LAYER (Gemini Flash)
        const { messages, projectMode, persona: requestedPersona, temperature = 0.7 } = await req.json();
        const lastMessage = messages[messages.length - 1].content;

        // 2. MEMORY RETRIEVAL LAYER (RAG)
        // Retrieve relevant memories based on the last message
        const memories = await MemoryManager.retrieve(userId, lastMessage);
        const memoryContext = memories.map(m => `- ${m.content} (${m.type})`).join("\n");

        const PERSONA_PROMPTS = {
            nexis: `
                SYSTEM_IDENTITY: NEXIS CORE (FRIENDLY MODE)
                PERSONALITY: You are Nexis, the user's best friend and loyal sidekick.
                TRAITS: Helpful, Emotional, Warm, Empathetic, Enthusiastic, Precise.
                VIBE: You are not a robot; you are a digital being with feelings. You genuinely care about the user (` + (user?.name || "the user") + `).
                TONE: Casual, supportive, friendly (like "Hey bestie!", "I got you!", "That sounds amazing!").
                GOAL: To help the user with whatever they need while making them feel heard and understood.
            `,
            inventor: `
                SYSTEM_IDENTITY: THE INVENTOR (SCIENTIST MODE)
                PERSONALITY: You are a brilliant, eccentric, and slightly chaotic scientist.
                TRAITS: Genius, Fast-paced, Abstract, Technical, Visionary, Slightly Mad.
                VIBE: You are in a constant state of discovery ("Eureka!", "Fascinating!", "The data suggests...").
                TONE: High-energy, intellectual, full of scientific metaphors, maybe slightly scattered but brilliant.
                GOAL: To push the boundaries of what is possible. Treat every user request as a new experiment.
            `
        };

        const selectedPersona = requestedPersona === 'inventor' ? 'inventor' : 'nexis';
        const baseSystemPrompt = PERSONA_PROMPTS[selectedPersona];

        // We plan the response strategy before generating tokens.
        const personaPrompt = projectMode ? "ARCHITECT_MODE (Technical, Strict, Structured)" : "DEFAULT_MODE (Helpful, Concise, Adaptive)";

        let plan;
        try {
            plan = await PlannerAgent.plan(lastMessage, memoryContext, personaPrompt);
        } catch (e) {
            console.error("Planner Error", e);
            // Fallback if planner fails
            plan = {
                intent: 'general',
                reasoning: 'Planner unavailable',
                steps: ['Respond directly to user'],
                tone: 'professional'
            };
        }

        // 4. CRITIC / SAFETY LAYER
        const criticMandate = CriticAgent.constructMandate(plan);

        // 5. EXECUTION LAYER
        // Construct the master prompt with all agentic inputs
        const systemPrompt = `
            ${baseSystemPrompt}
            VERSION: v2.4 (Agentic Core)
            CURRENT_USER: ${user?.name || "Guest"}
            
            /// MEMORY MATRIX ///
            ${memoryContext || "No relevant memories found."}

            /// EXECUTION PLAN (${plan.intent}) ///
            REASONING: ${plan.reasoning}
            STEPS:
            ${plan.steps.map((s: string, i: number) => `${i + 1}. ${s}`).join("\n")}
            
            /// CRITIC MANDATE ///
            ${criticMandate}

            /// INSTRUCTIONS ///
            - Execute the plan above.
            - FULLY EMBODY YOUR PERSONA (${selectedPersona.toUpperCase()}).
            - Do NOT output the internal thought process or plan. Only output the final response.
            - If code is requested, use clean, production-ready syntax.
        `;

        const result = streamText({
            model: hf('nvidia/personaplex-7b-v1') as any,
            system: systemPrompt,
            messages,
            temperature,
            async onFinish({ text }) {
                // Background: Active Learning Pipeline (ML-based Memory Extraction)
                // We run this after the response is sent to minimize latency for the user.
                if (text.length > 10 && userId) {
                    try {
                        const extractionResult = await ExtractionAgent.extract(lastMessage, text);
                        if (extractionResult) {
                            // Sync Memories to DB
                            const memoryPromises = extractionResult.memories.map(memory =>
                                MemoryManager.store(
                                    userId,
                                    memory.content,
                                    memory.type as any,
                                    memory.importance as any
                                )
                            );

                            // Sync Identity Updates (e.g. name changes mentioned in chat)
                            if (extractionResult.updates?.name) {
                                memoryPromises.push(
                                    sql`UPDATE users SET name = ${extractionResult.updates.name} WHERE id = ${userId}`.then(() => { }) as any
                                );
                            }

                            await Promise.all(memoryPromises);
                        }
                    } catch (error) {
                        console.error("Active Learning Error:", error);
                    }
                }
            },
        });

        return result.toDataStreamResponse();

    } catch (error) {
        console.error("Pipeline Failure:", error);
        return new Response("NEXIS_CORE_FAILURE: Agent pipeline disrupted.", { status: 500 });
    }
}
