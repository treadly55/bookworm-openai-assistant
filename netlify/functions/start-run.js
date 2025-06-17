// netlify/functions/start-run.js
import OpenAI from 'openai';

const ASSISTANT_ID = "asst_izG16o3Nm10JCJrUns2uceBq"; // <-- Make sure your REAL Assistant ID is here

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }
    
    try {
        const { question } = JSON.parse(event.body);
        
        const thread = await openai.beta.threads.create();
        
        await openai.beta.threads.messages.create(thread.id, {
            role: "user",
            content: question,
        });
        
        const run = await openai.beta.threads.runs.create(thread.id, {
            assistant_id: ASSISTANT_ID,
        });

        // Immediately return the IDs needed for polling
        return {
            statusCode: 200,
            body: JSON.stringify({ threadId: thread.id, runId: run.id }),
        };
        
    } catch (error) {
        console.error("Error in start-run function:", error);
        return { statusCode: 500, body: JSON.stringify({ message: 'Error starting run.' }) };
    }
};