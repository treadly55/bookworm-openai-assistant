// src/main.js (with added debugging logs)
import './style.css'

// --- HTML Element References ---
const questionField = document.getElementById('questionField');
const submitButton = document.getElementById('submitButton');
const responseSpace = document.getElementById('responsespace');
const responseArea = document.getElementById('responseArea');
const retryButton = document.getElementById('retry');
const loadingOverlay = document.getElementById('loadingOverlay');

let pollingInterval;

// Function to check the run status
async function checkRunStatus(threadId, runId) {
    // --- LOG #2: Values received by checkRunStatus ---
    console.log(`Checking status for threadId: ${threadId}, runId: ${runId}`);

    try {
        const requestBody = { threadId, runId };
        // --- LOG #3: The exact object being sent to the server ---
        console.log('Sending this body to /api/check-run:', JSON.stringify(requestBody));

        const response = await fetch('/api/check-run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });
        const result = await response.json();

        if (result.status === 'completed') {
            clearInterval(pollingInterval);
            responseArea.innerHTML = result.message.replace(/\n/g, "<br>");
            loadingOverlay.style.display = 'none';
            responseSpace.style.display = 'block';
            submitButton.disabled = false;
        } else if (result.status === 'failed') {
            clearInterval(pollingInterval);
            responseArea.textContent = "The AI request failed. Please try again.";
            loadingOverlay.style.display = 'none';
            responseSpace.style.display = 'block';
            submitButton.disabled = false;
        }
    } catch (error) {
        clearInterval(pollingInterval);
        console.error("Error checking status:", error);
        submitButton.disabled = false;
    }
}

// Function to start the run
async function startRun(question) {
    loadingOverlay.style.display = 'flex';
    submitButton.disabled = true;
    responseSpace.style.display = 'none';

    try {
        const response = await fetch('/api/start-run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question }),
        });
        const result = await response.json();

        // --- LOG #1: The data received from start-run ---
        console.log('Received from /api/start-run:', result);

        if (result.threadId && result.runId) {
            pollingInterval = setInterval(() => {
                checkRunStatus(result.threadId, result.runId);
            }, 2000);
        } else {
            throw new Error('Failed to get valid IDs from start-run.');
        }
    } catch (error) {
        console.error("Error starting run:", error);
        loadingOverlay.style.display = 'none';
        submitButton.disabled = false;
        responseArea.textContent = "Could not start the AI request.";
        responseSpace.style.display = 'block';
    }
}

// --- Setup Event Listeners ---
submitButton.addEventListener('click', () => {
    const question = questionField.value.trim();
    if (question) {
        startRun(question);
    }
});

retryButton.addEventListener('click', () => {
    questionField.value = "";
    responseSpace.style.display = 'none';
    questionField.focus();
    if (pollingInterval) clearInterval(pollingInterval);
});