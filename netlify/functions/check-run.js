// netlify/functions/check-run.js
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

exports.handler = async (event) => {
    // --- NEW AND FINAL DEBUGGING LOGS ---
    console.log("--- Check-run function started ---");
    console.log("Raw event.body received by function:", event.body);
    // --- END OF LOGS ---

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { threadId, runId } = JSON.parse(event.body);

        const run = await openai.beta.threads.runs.retrieve(threadId, runId);

        if (run.status === 'completed') {
            const messages = await openai.beta.threads.messages.list(threadId);
            const assistantMessage = messages.data.find(m => m.role === 'assistant');
            const replyText = assistantMessage?.content[0]?.text?.value || "I couldn't find a specific answer.";

            return {
                statusCode: 200,
                body: JSON.stringify({ status: 'completed', message: replyText }),
            };
        } else if (run.status === 'failed') {
            return {
                statusCode: 200,
                body: JSON.stringify({ status: 'failed', message: 'The run failed.' }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ status: run.status }),
        };

    } catch (error) {
        // Log the full error to see what's happening
        console.error("Error in check-run function:", error);
        return { statusCode: 500, body: JSON.stringify({ status: 'failed', message: 'An error occurred.' }) };
    }
};