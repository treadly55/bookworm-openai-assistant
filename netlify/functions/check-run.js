// netlify/functions/check-run.js
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

exports.handler = async (event) => {
    console.log("--- Check-run function started ---");
    console.log("1. Raw event.body received:", event.body);

    try {
        // Step-by-step parsing with logs
        console.log("2. Attempting to parse event.body...");
        const parsedBody = JSON.parse(event.body);
        console.log("3. Successfully parsed body into object:", parsedBody);

        // Explicitly get variables instead of destructuring
        const threadId = parsedBody.threadId;
        const runId = parsedBody.runId;

        console.log(`4. Value of threadId variable before API call: [${threadId}]`);
        console.log(`5. Value of runId variable before API call: [${runId}]`);

        // A final check to be absolutely sure
        if (!threadId || typeof threadId !== 'string' || !threadId.startsWith('thread_')) {
            throw new Error(`Validation failed! threadId is not a valid string: [${threadId}]`);
        }
        
        console.log("6. Validation passed. Calling OpenAI API...");
        const run = await openai.beta.threads.runs.retrieve(threadId, runId);

        // If we get here, it worked. The rest of the function proceeds.
        if (run.status === 'completed') {
            const messages = await openai.beta.threads.messages.list(threadId);
            const assistantMessage = messages.data.find(m => m.role === 'assistant');
            const replyText = assistantMessage?.content[0]?.text?.value || "I couldn't find a specific answer.";
            
            return {
                statusCode: 200,
                body: JSON.stringify({ status: 'completed', message: replyText }),
            };
        }
        
        // If not completed, return the current status
        return {
            statusCode: 200,
            body: JSON.stringify({ status: run.status }),
        };

    } catch (error) {
        console.error("FINAL CATCH BLOCK: Error in check-run function:", error);
        return { statusCode: 500, body: JSON.stringify({ status: 'failed', message: 'An error occurred.' }) };
    }
};