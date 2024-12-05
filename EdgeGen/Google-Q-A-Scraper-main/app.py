from bs4 import BeautifulSoup
import requests
import sys

def scrape_google(question):
    url = f"https://www.google.com/search?q={question}"
    headers = {'User-Agent': 'Mozilla/5.0'}
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, 'html.parser')
    return soup

def extract_question_answer_boxes(soup):
    question_boxes = soup.find_all("div", class_="BNeawe vvjwJb AP7Wnd")
    answer_boxes = soup.find_all("div", class_="BNeawe s3v9rd AP7Wnd")
    question_answer_pairs = []
    for question_box, answer_box in zip(question_boxes, answer_boxes):
        question = question_box.get_text()
        answer = answer_box.get_text()
        question_answer_pairs.append((question, answer))
    return question_answer_pairs

def get_question_answer_pairs(question):
    search_results = scrape_google(question)
    question_answer_pairs = extract_question_answer_boxes(search_results)
    return question_answer_pairs[:4] # Return the first 4 pairs, can be changed to whatever you like.

if __name__ == "__main__":
    if len(sys.argv) > 1:
        question = sys.argv[1]
        filtered_pairs = get_question_answer_pairs(question)
        for q, a in filtered_pairs:
            print(f"Question: {q}\nAnswer: {a}\n")
    else:
        print("No question received.")
