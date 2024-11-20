// This is the original EgdeGen script which is now outdated.
function getSimilarity(s1, s2) {
    let longer = s1;
    let shorter = s2;
    if (s1.length < s2.length) {
        longer = s2;
        shorter = s1;
    }
    const longerLength = longer.length;
    if (longerLength === 0) {
        return 1.0;
    }
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
            if (i === 0) {
                costs[j] = j;
            } else {
                if (j > 0) {
                    let newValue = costs[j - 1];
                    if (s1[i - 1] !== s2[j - 1]) {
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    }
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0) {
            costs[s2.length] = lastValue;
        }
    }
    return costs[s2.length];
}

function processQuestion() {
    const iframe = document.querySelector("#stageFrame");

    if (iframe) {
        try {
            const iframeDocument = iframe.contentWindow.document;
            console.log("Iframe document title:", iframeDocument.title);

            let previousButtonIndex = null;

            function processSingleQuestion() {
                const targetElement = iframeDocument.querySelector(".plainbtn.alt.icon.yellow.selected");

                if (targetElement) {
                    const parentElement = targetElement.parentElement;
                    console.log("Parent element found:", parentElement);

                    const buttonIndex = parseInt(parentElement.getAttribute("buttonindex"));

                    if (buttonIndex !== null) {
                        console.log("Question Button Index:", buttonIndex);

                        if (previousButtonIndex === null) {
                            previousButtonIndex = buttonIndex;
                        }

                        const questionContainer = iframeDocument.querySelector("body > div:nth-child(3) > div > div > div.question-container");

                        if (questionContainer) {
                            console.log("Question container found.");
                            checkInnerDiv(questionContainer, buttonIndex);
                        } else {
                            console.log("Question container not found.");
                        }
                    } else {
                        console.log("No 'buttonindex' attribute found on the parent element.");
                    }
                } else {
                    console.log("Target element not found.");
                }
            }

            function checkInnerDiv(questionContainer, buttonIndex) {
                let attemptCount = 0;
                const maxAttempts = 20;
                const intervalId = setInterval(() => {
                    const form = questionContainer.querySelector(`form[id="form${buttonIndex}"]`);

                    if (form) {
                        const formDiv = form.querySelector(`#form${buttonIndex} > div`);
                        if (formDiv) {
                            const innerDiv = formDiv.querySelector(`#form${buttonIndex} > div > div > div`);
                            if (innerDiv) {
                                console.log(`Inner div found inside form${buttonIndex}.`);
                                clearInterval(intervalId);
                                processInnerDiv(innerDiv, buttonIndex);
                            } else {
                                console.log("Inner div not found, continuing to check...");
                            }
                        } else {
                            console.log("Form div not found, continuing to check...");
                        }
                    } else {
                        console.log("No matching form found, continuing to check...");
                    }

                    attemptCount++;

                    if (attemptCount >= maxAttempts) {
                        clearInterval(intervalId);
                        alert("Inner div not found after multiple attempts. Please try running the script again.");
                        console.log("Max attempts reached. Stopping script.");
                    }
                }, 1000);
            }

            function processInnerDiv(innerDivElement, buttonIndex) {
                if (typeof buttonIndex !== 'number') {
                    console.error("buttonIndex is not a valid number:", buttonIndex);
                    return;
                }
            
                const textContent = Array.from(innerDivElement.querySelectorAll("*"))
                    .map(el => el.innerText.trim())
                    .filter(text => text)
                    .join(" ");
            
                console.log(`Final Text from form${buttonIndex}:\n`, textContent);
            
                const apiUrl = "http://localhost:3000/process-text";
                const finalTextWithInstructions = `${textContent}\nPLEASE PUT THE CORRECT ANSWER IN BOLD AND ONLY THE CORRECT ANSWER AND NOTHING ELSE!!!!`;
            
                fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ finalText: finalTextWithInstructions })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Response from Gemini API:', data.response);
                    const geminiResponse = data.response;
                    const regex = /\*\*(.*?)\*\*/;
                    const match = geminiResponse.match(regex);
            
                    if (match && match[1]) {
                        const correctAnswer = match[1].trim();
                        console.log("Extracted correct answer:", correctAnswer);
            
                        const matchingElement = Array.from(innerDivElement.querySelectorAll("*")).find(el => 
                            el.innerText.trim() === correctAnswer
                        );
            
                        if (matchingElement) {
                            const questionContainer = matchingElement.closest('.QuestionContainer');
            
                            if (questionContainer) {
                                const answerButton = questionContainer.querySelector('input.answer-choice-button');
                                if (answerButton) {
                                    const randomDelay = Math.floor(Math.random() * (1000 - 500 + 1)) + 500;
                                    setTimeout(() => {
                                        answerButton.click();
                                        console.log("Clicked the answer-choice button for the correct answer.");
                                    }, randomDelay);
                                } else {
                                    console.log("Answer choice button not found within QuestionContainer.");
                                }
                            } else {
                                console.log("QuestionContainer not found for the matching answer.");
                            }
                        } else {
                            console.log("No matching element found for the correct answer.");
                        }
                    } else {
                        console.log("No bold text found in the response.");
                    }
                })
                .catch(error => {
                    console.error('Error sending to proxy server:', error);
                });
            }
            
            processSingleQuestion();

        } catch (error) {
            console.error("Unable to access the iframe's document due to cross-origin policy.");
        }
    } else {
        console.log("Iframe with ID 'stageFrame' not found.");
    }
}

function showConfirmation(iframeDocument, previousButtonIndex) {
    const overlay = iframeDocument.createElement('div');
    overlay.id = 'confirmation-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '1000';
    overlay.style.transition = 'opacity 0.5s ease-in-out';
    overlay.style.opacity = '0';
    iframeDocument.body.appendChild(overlay);

    const confirmationBox = iframeDocument.createElement('div');
    confirmationBox.style.backgroundColor = '#fff';
    confirmationBox.style.padding = '20px';
    confirmationBox.style.borderRadius = '10px';
    confirmationBox.style.textAlign = 'center';
    confirmationBox.innerHTML = `
        <p>Check if this was done correctly before we automatically submit.</p>
        <button id="done-button">Done Correctly</button>
        <button id="not-done-button">Not Done Correctly</button>
    `;
    overlay.appendChild(confirmationBox);

    setTimeout(() => {
        overlay.style.opacity = '1';
    }, 100);

    iframeDocument.querySelector('#done-button').addEventListener('click', () => {
        submitAnswers(iframeDocument);
    });

    iframeDocument.querySelector('#not-done-button').addEventListener('click', () => {
        overlay.remove();
        showAnswersForReview(iframeDocument, previousButtonIndex);
    });
}

function submitAnswers(iframeDocument) {
    const submitButton = iframeDocument.querySelector('#submit');
    if (submitButton) {
        submitButton.click();
        console.log("Answers submitted.");
    } else {
        console.log("Submit button not found.");
    }
}

function showErrorMessage(iframeDocument) {
    const overlay = iframeDocument.createElement('div');
    overlay.id = 'error-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(255, 0, 0, 0.75)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '1000';
    overlay.style.transition = 'opacity 0.5s ease-in-out';
    overlay.style.opacity = '0';
    iframeDocument.body.appendChild(overlay);

    const errorBox = iframeDocument.createElement('div');
    errorBox.style.backgroundColor = '#fff';
    errorBox.style.padding = '20px';
    errorBox.style.borderRadius = '10px';
    errorBox.style.textAlign = 'center';
    errorBox.innerHTML = `
        <p>We ran into an error, report this and try a Google search. Sorry for the inconvenience.</p>
        <button id="okay-button">Okay</button>
    `;
    overlay.appendChild(errorBox);

    setTimeout(() => {
        overlay.style.opacity = '1';
    }, 100);

    iframeDocument.querySelector('#okay-button').addEventListener('click', () => {
        overlay.remove();
    });
}


function showAnswersForReview(iframeDocument, previousButtonIndex) {
    const answerLabels = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const questionContainer = iframeDocument.querySelector('div.question-container');
    if (questionContainer) {
        const form = questionContainer.querySelector(`form[id="form${previousButtonIndex}"]`);
        if (form) {
            const answerChoices = form.querySelectorAll('.answer-choice');
            answerChoices.forEach((choice, index) => {
                const label = answerLabels[index] || String.fromCharCode(65 + index);
                const answerText = choice.innerText;
                console.log(`${label}. ${answerText}`);
            });
        }
    }
}

processQuestion()
