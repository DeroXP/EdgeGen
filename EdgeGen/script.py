import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import os
import google.generativeai as genai

project_path = r"C:\EdgeGen\Google-Q-A-Scraper-main" # Change to your project path
if project_path not in sys.path:
    sys.path.append(project_path)

try:
    from app import get_question_answer_pairs
except ModuleNotFoundError as e:
    print(f"ModuleNotFoundError: {e}")
    print("Please check that 'app.py' is in the directory and the path is correct.")
    sys.exit(1)

API_KEY = "YOUR_API_KEY" # get a gemini spi key for free online and paste it here
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")


def generate_text(input_text):
    """
    Generate a response using the Gemini API.
    """
    if not input_text.strip():
        return "Error: Input text cannot be empty"
    
    try:
        response = model.generate_content(input_text)
        return response.text.strip()
    except Exception as e:
        return f"Error generating text: {e}"


def generate_answer(prompt):
    """
    Get the question-answer pairs from app.py and generate an explanation using the Gemini API.
    """
    question_answer_pairs = get_question_answer_pairs(prompt)
    if question_answer_pairs:
        question, answer = question_answer_pairs[0]
        combined_text = (
            f"Question: {prompt}\n Please note that the answer to the question above should be prioritized. The following text is sourced from various sites, and while the sites may provide context or additional information, they are not directly needed to answer the question. Focus on providing the correct answer to the question above based on your knowledge and the context provided below.\n\n Context from Sites: {question, answer}\n Please provide your answer to the question in bold (meaning between two **), and include any relevant details from the context that might help, but do not rely solely on the sites."
        )

        if not combined_text.strip():
            return "Error: Combined context is empty"
        
        generated_response = generate_text(combined_text)
        return generated_response
    else:
        generated_response = generate_text(prompt)
        return generated_response


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
