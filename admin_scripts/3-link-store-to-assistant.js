// admin_scripts/3-link-store-to-assistant.js
import OpenAI from 'openai';
import 'dotenv/config';

// --- PASTE YOUR SAVED IDs HERE ---
const ASSISTANT_ID = "asst_izG16o3Nm10JCJrUns2uceBq"; // Replace with your Assistant ID from Step 2
const VECTOR_STORE_ID = "vs_68512da62fe08191aca1c2ce7862e798";   // Replace with your Vector Store ID from Step 3

// Initialize the OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function linkVectorStoreToAssistant() {
    if (!ASSISTANT_ID.startsWith('asst_') || !VECTOR_STORE_ID.startsWith('vs_')) {
        console.error("Please update the ASSISTANT_ID and VECTOR_STORE_ID in the script before running.");
        return;
    }

    console.log(`Linking Vector Store (ID: ${VECTOR_STORE_ID}) to Assistant (ID: ${ASSISTANT_ID})...`);

    try {
        const updatedAssistant = await openai.beta.assistants.update(ASSISTANT_ID, {
            tools: [{ type: "file_search" }],
            tool_resources: {
                file_search: {
                    vector_store_ids: [VECTOR_STORE_ID]
                }
            }
        });

        console.log("Assistant updated successfully!");
        console.log("---------------------------------");
        console.log("The Assistant is now configured with the File Search tool and linked to your Vector Store.");
        console.log("Updated Assistant details:", updatedAssistant);
        console.log("---------------------------------");

    } catch (error) {
        console.error("Error updating Assistant:", error);
    }
}

// Run the function
linkVectorStoreToAssistant();