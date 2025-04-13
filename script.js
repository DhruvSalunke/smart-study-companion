const GEMINI_API_KEY = "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"; 

const inputTextElement = document.getElementById("inputText");
const generateButton = document.querySelector("button");
const summaryElement = document.getElementById("summary");
const explanationElement = document.getElementById("explanation");
const questionsElement = document.getElementById("questions");

async function generateOutput() {
  const inputText = inputTextElement.value.trim();

  if (!inputText) {
    alert("Please paste some study material.");
    return;
  }


  generateButton.disabled = true;
  summaryElement.innerHTML = "Generating summary...";
  explanationElement.innerHTML = "Generating explanation...";
  questionsElement.innerHTML = "Generating questions...";
  summaryElement.style.color = "";
  explanationElement.style.color = "";
  questionsElement.style.color = "";

  const prompt = `
You are a helpful study assistant. Analyze the following text from study material and perform these tasks clearly separated:
1. **Summary:** Provide a concise summary of the main points. Start this section with "Summary:".
2. **Simple Explanation:** Explain the core concepts in very simple terms, as if explaining to a beginner. Start this section with "Simple Explanation:".
3. **Sample Questions:** Generate 3 distinct exam-style questions based on the text. Start this section with "Sample Questions:". Ensure each question is on a new line.

Text:
"${inputText}"

Respond clearly, using the specified headings for each section.
`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GEMINI_API_KEY}`
      },
      body: JSON.stringify({
        model: "google/gemini-pro",

        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = `API Error ${response.status}: ${errorData?.error?.message || response.statusText}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const resultText = data?.choices?.[0]?.message?.content?.trim() || "No content received.";

    let summary = "Summary not found.";
    let explanation = "Explanation not found.";
    let questions = "Questions not found.";

    const lowerText = resultText.toLowerCase();
    const summaryIndex = lowerText.indexOf("summary:");
    const explanationIndex = lowerText.indexOf("simple explanation:");
    const questionsIndex = lowerText.indexOf("sample questions:");

    if (summaryIndex !== -1) {
      const start = summaryIndex + "summary:".length;
      const end = explanationIndex !== -1 ? explanationIndex : (questionsIndex !== -1 ? questionsIndex : resultText.length);
      summary = resultText.substring(start, end).trim();
    }

    if (explanationIndex !== -1) {
      const start = explanationIndex + "simple explanation:".length;
      const end = questionsIndex !== -1 ? questionsIndex : resultText.length;
      explanation = resultText.substring(start, end).trim();
    }

    if (questionsIndex !== -1) {
      const start = questionsIndex + "sample questions:".length;
      questions = resultText.substring(start).trim();
    }
    summaryElement.innerHTML = summary.replace(/\n/g, "<br>");
    explanationElement.innerHTML = explanation.replace(/\n/g, "<br>");
    questionsElement.innerHTML = questions.replace(/\n/g, "<br>");

  } catch (error) {
    console.error("Error:", error);
    summaryElement.textContent = `An error occurred: ${error.message}`;
    summaryElement.style.color = "red";
    explanationElement.textContent = "See error above.";
    explanationElement.style.color = "red";
    questionsElement.textContent = "See error above.";
    questionsElement.style.color = "red";
  } finally {
    generateButton.disabled = false;
  }
}
generateButton.addEventListener("click", generateOutput);
