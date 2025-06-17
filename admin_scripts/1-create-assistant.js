// admin_scripts/1-create-assistant.js
import OpenAI from 'openai';
import 'dotenv/config'; // Use dotenv to load the API key from .env

// Initialize the OpenAI client with the API key
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function createAssistant() {
    console.log("Attempting to create a new Assistant...");

    try {
        const assistantConfig = {
            name: "Movie Recommender",
            instructions: "You are an expert at recommending movies based on user preferences. When asked a question, use the information in the provided file to form a friendly response. If you cannot find the answer in the file, do your best to infer what the answer should be.",
            model: "gpt-4o",
            tools: [] // Tools will be added in a later step
        };

        const assistant = await openai.beta.assistants.create(assistantConfig);

        console.log("✅🎉 Assistant created successfully!");
        console.log("---------------------------------");
        console.log("Please save the following Assistant ID for the next steps:");
        console.log(`Assistant ID: ${assistant.id}`);
        console.log("---------------------------------");

    } catch (error) {
        console.error("🔴 Error during Assistant creation:", error);
    }
}

// Run the function
createAssistant();
