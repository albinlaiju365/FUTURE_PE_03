import db from "@/lib/db";

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
    retrieve: (userId: number, query: string): MemoryV2[] => {
        // Simple heuristic: fetch all 'high' importance or 'identity' memories,
        // plus recent project memories.
        // In a full implementation, we'd use embedding similarity here.

        const stmt = db.prepare(`
            SELECT * FROM memories_v2 
            WHERE user_id = ? 
            ORDER BY 
                CASE importance 
                    WHEN 'high' THEN 1 
                    WHEN 'medium' THEN 2 
                    ELSE 3 
                END ASC,
                last_accessed DESC
            LIMIT 20
        `);

        const memories = stmt.all(userId) as any[];

        // Parse metadata JSON
        return memories.map(m => ({
            ...m,
            metadata: m.metadata ? JSON.parse(m.metadata) : {}
        }));
    },

    /**
     * Store a new structured memory.
     */
    store: (
        userId: number,
        content: string,
        type: MemoryType = "ephemeral",
        importance: "high" | "medium" | "low" = "medium"
    ) => {
        const stmt = db.prepare(`
            INSERT INTO memories_v2 (user_id, content, type, confidence, importance, last_accessed, decay_rate, metadata)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?)
        `);

        // Default decay based on type
        let decay: "slow" | "fast" | "none" = "slow";
        if (type === "identity") decay = "none";
        if (type === "ephemeral") decay = "fast";

        stmt.run(userId, content, type, 0.9, importance, decay, "{}");
    },

    /**
     * "Touch" a memory to update its last_accessed time (simulating reinforcement).
     */
    reinforce: (memoryId: number) => {
        const stmt = db.prepare(`UPDATE memories_v2 SET last_accessed = CURRENT_TIMESTAMP WHERE id = ?`);
        stmt.run(memoryId);
    }
};
