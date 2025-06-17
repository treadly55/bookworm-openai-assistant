// src/main.js
import './style.css'

// --- HTML Element References ---
const questionField = document.getElementById('questionField');
const submitButton = document.getElementById('submitButton');
const responseSpace = document.getElementById('responsespace');
const responseArea = document.getElementById('responseArea');
const retryButton = document.getElementById('retry');
const loadingOverlay = document.getElementById('loadingOverlay');

/**
 * Sends the user's question to our secure Netlify Function.
 * @param {string} userQuestion The question from the text area.
 * @returns {Promise<object>} An object with the result from the backend.
 */
async function getAIRecommendation(userQuestion) {
  // Show the loading state
  loadingOverlay.style.display = 'flex';
  responseSpace.style.display = 'none';
  submitButton.disabled = true;

  try {
    // Make a POST request to our function endpoint
    const response = await fetch('/api/ask-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: userQuestion }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    return await response.json();

  } catch (error) {
    console.error("Error calling backend function:", error);
    return { success: false, error: 'Could not connect to the AI. Please try again.' };
  } finally {
    // Hide the loading state and re-enable the button
    loadingOverlay.style.display = 'none';
    submitButton.disabled = false;
  }
}

// --- Setup Event Listeners ---
submitButton.addEventListener('click', async () => {
  const question = questionField.value.trim();
  if (!question) {
    alert('Please describe what kind of book you are looking for.');
    return;
  }

  const result = await getAIRecommendation(question);

  if (result.success) {
    // Format the AI's text to handle newlines properly
    responseArea.innerHTML = result.text.replace(/\n/g, "<br>");
  } else {
    responseArea.textContent = result.error || "An unexpected issue occurred.";
  }

  responseSpace.style.display = 'block';
});

retryButton.addEventListener('click', () => {
  questionField.value = "";
  responseSpace.style.display = 'none';
  questionField.focus();
});