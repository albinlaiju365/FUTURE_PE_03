export const CriticAgent = {
    /**
     * Instead of a post-generation critique (which kills streaming speed),
     * The Critic "pre-visualizes" the constraints and injects a "CRITIC_MANDATE"
     * into the final execution prompt.
     */
    constructMandate: (plan: any) => {
        let mandate = `CRITIC_PROTOCOL_ACTIVE: Verify all assertions.`;

        if (plan.intent === 'technical_explanation') {
            mandate += `\n- CONSTRAINT: Code must be syntactically correct.\n- CONSTRAINT: Explain 'why' not just 'how'.`;
        }

        if (plan.intent === 'debugging') {
            mandate += `\n- CONSTRAINT: Check for common pitfalls.\n- CONSTRAINT: Suggest verification steps.`;
        }

        if (plan.tone === 'concise') {
            mandate += `\n- CONSTRAINT: Maximize information density. Remove filler.`;
        }

        return mandate;
    }
};
