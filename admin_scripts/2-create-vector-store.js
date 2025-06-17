// admin_scripts/2-create-vector-store.js
import OpenAI from 'openai';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const filePath = path.join(process.cwd(), 'public', 'books.txt');

async function createVectorStoreAndUploadFile() {
    console.log("Attempting to create a new Vector Store and upload file...");

    try {
        console.log("Creating Vector Store...");
        const vectorStore = await openai.vectorStores.create({
            name: "Book Files Knowledge Base"
        });
        console.log(`✅ Vector Store created! ID: ${vectorStore.id}`);

        console.log(`Reading file from: ${filePath}`);
        const fileStream = fs.createReadStream(filePath);

        // --- THIS IS THE CORRECTED PART ---
        // We pass { files: [fileStream] } instead of { file: fileStream }
        console.log("Uploading file to Vector Store... (This may take a moment)");
        const uploadResult = await openai.vectorStores.fileBatches.uploadAndPoll(
            vectorStore.id,
            { files: [fileStream] } // The file must be in a 'files' array
        );

        console.log(`✅ File upload completed with status: ${uploadResult.status}`);
        console.log(`File counts: ${JSON.stringify(uploadResult.file_counts)}`);

        console.log("---------------------------------");
        console.log("Please save the following Vector Store ID for the next step:");
        console.log(`Vector Store ID: ${vectorStore.id}`);
        console.log("---------------------------------");

    } catch (error) {
        console.error("🔴 Error during Vector Store setup:", error);
    }
}

createVectorStoreAndUploadFile();