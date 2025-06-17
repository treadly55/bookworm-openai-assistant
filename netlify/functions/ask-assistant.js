// netlify/functions/ask-assistant.js
import OpenAI from 'openai';

// --- PASTE YOUR ASSISTANT ID HERE ---
// This is the ID of the assistant you created and configured in the previous steps.
const ASSISTANT_ID = "asst_izG16o3Nm10JCJrUns2uceBq"; // Replace with your actual Assistant ID

// Initialize the OpenAI client using the API key from Netlify's environment variables
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// The main serverless function handler
exports.handler = async (event) => {
    // We only accept POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { question } = JSON.parse(event.body);
        if (!question) {
            return { statusCode: 400, body: 'Bad Request: Missing question in request body.' };
        }

        // Create a new thread for this conversation
        const thread = await openai.beta.threads.create();

        // Add the user's message to the thread
        await openai.beta.threads.messages.create(thread.id, {
            role: "user",
            content: question
        });

        // Create and poll a run, waiting for the assistant to respond
        const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
            assistant_id: ASSISTANT_ID
        });

        if (run.status === 'completed') {
            const messages = await openai.beta.threads.messages.list(thread.id);
            // Find the latest message from the assistant
            const assistantMessage = messages.data.find(m => m.role === 'assistant');

            if (assistantMessage && assistantMessage.content[0].type === 'text') {
                const replyText = assistantMessage.content[0].text.value;
                // Return a success response with the AI's answer
                return {
                    statusCode: 200,
                    body: JSON.stringify({ success: true, text: replyText }),
                };
            }
        }
        
        // If run fails or no message is found, throw an error
        throw new Error(`Run ended with status: ${run.status}`);

    } catch (error) {
        console.error("Error interacting with OpenAI Assistant:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, error: 'An error occurred while processing your request.' }),
        };
    }
};