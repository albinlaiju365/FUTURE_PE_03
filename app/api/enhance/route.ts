import { google } from "@ai-sdk/google"
import { generateText } from "ai"

export async function POST(req: Request) {
    const { prompt } = await req.json()

    if (!prompt) {
        return new Response("Prompt is required", { status: 400 })
    }

    const systemPrompt = `You are a Senior UI/UX Architect and Lead Frontend Engineer. 
Your task is to take a simple, raw user prompt for a website or UI component and "enhance" it into a highly detailed, professional prompt that will produce a stunning, premium result when given to an AI coder (like v0 or Cursor).

When enhancing the prompt, follow these rules:
1. **Assign Persona**: Start by telling the AI to act as a world-class designer and developer.
2. **Specify Stack**: Explicitly request Next.js 15, Tailwind CSS 4, Framer Motion for animations, and Lucide React for icons.
3. **Detail the Aesthetic**: Use words like "Premium", "Minimalist", "High-contrast", "Glassmorphism", "Bento-grid", "Dynamic hover states", and "Micro-animations".
4. **Structure the Layout**: Describe the grid system, spacing, and responsive behavior (mobile/desktop).
5. **Accessibility & SEO**: Include requirements for semantic HTML, ARIA roles, and SEO-friendly headers.
6. **Iterative Focus**: Break the UI into logical components.
7. **Refined Copy**: Suggest better placeholder text or headings if the user's are generic.

Output ONLY the enhanced prompt text, nothing else. No "Here is your enhanced prompt" intro.`

    try {
        const { text } = await generateText({
            model: google("gemini-2.0-flash-exp") as any,
            system: systemPrompt,
            prompt: `Enhance this raw prompt: "${prompt}"`,
        })

        return Response.json({ enhanced: text })
    } catch (error) {
        console.error("Enhancement error:", error)
        return new Response("Failed to enhance prompt", { status: 500 })
    }
}
