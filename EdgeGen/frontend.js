javascript:void function() {
  (function() {
      const responseFrameId = "aiResponseFrame";
      const typingDots = ["•", "••", "•••"];
      let typingInterval;

      function createTypingAnimation(button) {
          let dotIndex = 0;
          typingInterval = setInterval(() => {
              button.innerText = typingDots[dotIndex];
              dotIndex = (dotIndex + 1) % typingDots.length;
          }, 500);
      }

      function stopTypingAnimation(button, finalText = "✔") {
          clearInterval(typingInterval);
          button.innerText = finalText;
      }

      function showTypingText(target, text) {
        target.innerHTML = ""; // Clear any existing content
        let charIndex = 0;
        let isBold = false; // Track if we are inside a bold section
        let buffer = ""; // Buffer to accumulate characters
    
        const interval = setInterval(() => {
            if (charIndex < text.length) {
                const char = text[charIndex];
                
                if (char === "*" && text.slice(charIndex, charIndex + 4) === "****") {
                    // Handle bold toggling
                    if (isBold) {
                        target.innerHTML += `<b>${buffer}</b>`;
                    } else {
                        target.innerHTML += buffer;
                    }
                    buffer = ""; // Clear buffer
                    isBold = !isBold; // Toggle bold state
                    charIndex += 3; // Skip next 3 asterisks
                } else if (char === " ") {
                    buffer += "&nbsp;"; // Add non-breaking space for visible spacing
                } else {
                    buffer += char; // Accumulate normal character
                }
                charIndex++;
            } else {
                // Append remaining text in the buffer
                if (isBold) {
                    target.innerHTML += `<b>${buffer}</b>`;
                } else {
                    target.innerHTML += buffer;
                }
                clearInterval(interval); // Stop animation when done
            }
        }, 4); // Adjust typing speed here
      }

      function createOverlay(responseText) {
          let overlay = document.getElementById(responseFrameId);
          if (!overlay) {
              overlay = document.createElement("div");
              overlay.id = responseFrameId;

              Object.assign(overlay.style, {
                  position: "fixed",
                  bottom: "80px",
                  left: "10px",
                  right: "10px",
                  maxHeight: "300px",
                  overflowY: "auto",
                  backgroundColor: "white",
                  borderRadius: "10px",
                  padding: "20px",
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                  fontFamily: "'Arial', sans-serif",
                  fontSize: "16px",
                  color: "#333",
                  display: "flex",
                  alignItems: "center",
                  zIndex: "10000",
              });

              // Icon behind the text
              const icon = document.createElement("div");
              Object.assign(icon.style, {
                  width: "40px",
                  height: "40px",
                  backgroundColor: "#4CAF50",
                  borderRadius: "50%",
                  marginRight: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "bold",
                  flexShrink: "0",
              });
              icon.textContent = "AI";

              // Text container
              const textContainer = document.createElement("div");
              textContainer.style.flex = "1";

              overlay.appendChild(icon);
              overlay.appendChild(textContainer);
              document.body.appendChild(overlay);
          }

          const textContainer = overlay.querySelector("div:nth-child(2)");
          showTypingText(textContainer, responseText);

          overlay.style.display = "flex";
      }

      if (!document.getElementById("aiTriggerButton")) {
          const button = document.createElement("button");
          button.id = "aiTriggerButton";
          button.innerText = "↑";
          Object.assign(button.style, {
              position: "fixed",
              bottom: "20px",
              right: "20px",
              padding: "10px 20px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              zIndex: "10000",
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              fontSize: "16px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
          });
          document.body.appendChild(button);

          button.addEventListener("click", () => {
              const iframe = document.querySelector("#stageFrame");
              if (iframe) {
                  const doc = iframe.contentDocument || iframe.contentWindow.document;
                  let questionText = "";
                  const questionContainers = doc.querySelectorAll(".question-container");

                  questionContainers.forEach((container) => {
                      questionText += container.innerText + "\n";
                  });

                  createTypingAnimation(button);

                  fetch("http://localhost:3000/api/question", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ text: questionText }),
                  })
                      .then((response) => response.json())
                      .then((data) => {
                          stopTypingAnimation(button, "✔");
                          setTimeout(() => {
                              button.innerText = "↑";
                          }, 2000);
                          createOverlay(data.response);
                      })
                      .catch((err) => {
                          console.error("Error fetching AI response:", err);
                          stopTypingAnimation(button, "!");
                          button.style.backgroundColor = "#f44336"; // Red for error
                          setTimeout(() => {
                              button.innerText = "↑";
                              button.style.backgroundColor = "#4CAF50";
                          }, 2000);
                      });
              }
          });
      }
  })();
}();
