import sys
import io
import os
import google.generativeai as genai
from app import get_question_answer_pairs

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

API_KEY = os.getenv("GENAI_API_KEY")
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")

def generate_text(input_text):
    """Generate a response using the Gemini API."""
    if not input_text.strip():
        return "Error: Input text cannot be empty"
    
    try:
        response = model.generate_content(input_text)
        return response.text.strip()
    except Exception as e:
        return f"Error generating text: {e}"

def generate_answer(prompt):
    """Get question-answer pairs and generate an explanation using the Gemini API."""
    question_answer_pairs = get_question_answer_pairs(prompt)
    if question_answer_pairs:
        question, answer = question_answer_pairs[0]
        combined_text = (
            f"Question: {prompt}\n Please prioritize the answer above. The following text is context from various sites, but focus on answering the question using your knowledge.\n\n Context from Sites: {question, answer}\n Answer in **bold**."
        )
        if not combined_text.strip():
            return "Error: Combined context is empty"
        
        return generate_text(combined_text)
    else:
        return "Error: Webscrape Failed."

if __name__ == "__main__":
    if len(sys.argv) > 1:
        user_input = sys.argv[1]
        ai_response = generate_answer(user_input)
        try:
            sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
            print(ai_response)
        except Exception as e:
            print(f"Error processing AI response: {e}")
    else:
        print("No input received.")
