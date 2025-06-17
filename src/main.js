// src/main.js
import './style.css'

// --- HTML Element References ---
const questionField = document.getElementById('questionField');
const submitButton = document.getElementById('submitButton');
const responseSpace = document.getElementById('responsespace');
const responseArea = document.getElementById('responseArea');
const retryButton = document.getElementById('retry');
const loadingOverlay = document.getElementById('loadingOverlay');

let pollingInterval; // To hold the interval ID

// Function to check the run status
async function checkRunStatus(threadId, runId) {
    try {
        const response = await fetch('/api/check-run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ threadId, runId }),
        });
        const result = await response.json();

        if (result.status === 'completed') {
            clearInterval(pollingInterval); // Stop polling
            responseArea.innerHTML = result.message.replace(/\n/g, "<br>");
            loadingOverlay.style.display = 'none';
            responseSpace.style.display = 'block';
            submitButton.disabled = false;
        } else if (result.status === 'failed') {
            clearInterval(pollingInterval); // Stop polling
            responseArea.textContent = "The AI request failed. Please try again.";
            loadingOverlay.style.display = 'none';
            responseSpace.style.display = 'block';
            submitButton.disabled = false;
        }
        // If status is 'in_progress', do nothing and let the interval continue
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

        if (result.threadId && result.runId) {
            // Start polling every 2 seconds
            pollingInterval = setInterval(() => {
                checkRunStatus(result.threadId, result.runId);
            }, 2000);
        } else {
            throw new Error('Failed to start run.');
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