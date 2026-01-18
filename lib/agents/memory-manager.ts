import * as db from "@/lib/db";

export type MemoryType = "identity" | "project" | "behavioral" | "ephemeral";

export interface MemoryV2 {
    id: number;
    user_id: number;
    content: string;
    type: MemoryType;
    confidence: number;
    importance: "high" | "medium" | "low";
    last_accessed: string;
    decay_rate: "slow" | "fast" | "none";
    metadata: any;
}

export const MemoryManager = {
    /**
     * Retrieve relevant memories for the current context.
     * In a real vector DB, this would be semantic search.
     * For SQLite, we'll use keyword matching and recency/importance weighting.
     */
    retrieve: async (userId: number, query: string): Promise<MemoryV2[]> => {
        // Simple heuristic: fetch all 'high' importance or 'identity' memories,
        // plus recent project memories.

        try {
            const { rows } = await db.sql`
                SELECT * FROM memories_v2 
                WHERE user_id = ${userId}
                ORDER BY 
                    CASE importance 
                        WHEN 'high' THEN 1 
                        WHEN 'medium' THEN 2 
                        ELSE 3 
                    END ASC,
                    last_accessed DESC
                LIMIT 20
            `;

            return rows.map((m: any) => ({
                id: m.id,
                user_id: m.user_id,
                content: m.content,
                type: m.type,
                confidence: m.confidence,
                importance: m.importance,
                last_accessed: m.last_accessed,
                decay_rate: m.decay_rate,
                metadata: m.metadata || {} // Postgres handles JSONB parsing automatically
            }));
        } catch (error) {
            console.error("Memory Retrieve Error:", error);
            return [];
        }
    },

    /**
     * Store a new structured memory.
     */
    store: async (
        userId: number,
        content: string,
        type: MemoryType = "ephemeral",
        importance: "high" | "medium" | "low" = "medium"
    ) => {
        try {
            // Default decay based on type
            let decay: "slow" | "fast" | "none" = "slow";
            if (type === "identity") decay = "none";
            if (type === "ephemeral") decay = "fast";

            await db.sql`
                INSERT INTO memories_v2 (user_id, content, type, confidence, importance, last_accessed, decay_rate, metadata)
                VALUES (${userId}, ${content}, ${type}, 0.9, ${importance}, CURRENT_TIMESTAMP, ${decay}, '{}'::jsonb)
            `;
        } catch (error) {
            console.error("Memory Store Error:", error);
        }
    },

    /**
     * "Touch" a memory to update its last_accessed time (simulating reinforcement).
     */
    reinforce: async (memoryId: number) => {
        try {
            await db.sql`UPDATE memories_v2 SET last_accessed = CURRENT_TIMESTAMP WHERE id = ${memoryId}`;
        } catch (error) {
            console.error("Memory Reinforce Error:", error);
        }
    }
};
