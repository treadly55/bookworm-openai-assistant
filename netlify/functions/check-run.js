// netlify/functions/check-run.js
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { threadId, runId } = JSON.parse(event.body);

        // Retrieve the current status of the run
        const run = await openai.beta.threads.runs.retrieve(threadId, runId);

        if (run.status === 'completed') {
            // If completed, get the messages
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
        
        // If still in progress, just return the status
        return {
            statusCode: 200,
            body: JSON.stringify({ status: run.status }),
        };

    } catch (error) {
        console.error("Error in check-run function:", error);
        return { statusCode: 500, body: JSON.stringify({ status: 'failed', message: 'An error occurred.' }) };
    }
};