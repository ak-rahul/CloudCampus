from flask import Flask, request, jsonify
import nltk
from nltk.corpus import wordnet as wn
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import word_tokenize
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from flask_cors import CORS

nltk.download('punkt')
nltk.download('wordnet')

app = Flask(__name__)
CORS(app)  # Consider specifying origins if necessary

lemmatizer = WordNetLemmatizer()

def lemmatize_text(text):
    tokens = word_tokenize(text)
    return ' '.join([lemmatizer.lemmatize(word.lower()) for word in tokens])

def synonym_replacement(text):
    tokens = word_tokenize(text)
    new_tokens = []
    for word in tokens:
        synsets = wn.synsets(word)
        if synsets:
            synonyms = synsets[0].lemmas()
            new_tokens.append(synonyms[0].name() if synonyms else word)
        else:
            new_tokens.append(word)
    return ' '.join(new_tokens)

def vectorize(texts):
    lemmatized = [lemmatize_text(t) for t in texts]
    synonymed = [synonym_replacement(t) for t in lemmatized]
    return TfidfVectorizer().fit_transform(synonymed).toarray()

def similarity(doc1, doc2):
    return cosine_similarity([doc1, doc2])[0][1]

def classify_similarity(score):
    if score >= 0.95:
        return "Complete Plagiarism"
    elif score >= 0.70:
        return "Direct Plagiarism"
    elif score >= 0.5:
        return "Paraphrased"
    else:
        return "No Plagiarism"

@app.route('/check-plagiarism', methods=['POST'])
def check_plagiarism():
    try:
        data = request.json
        files = data.get('files', [])

        if not files:
            return jsonify({"error": "No files provided"}), 400

        texts = [file['text'] for file in files]
        emails = [file['email'] for file in files]

        # Log all emails and texts clearly
        print("\n==== Received Data ====")
        for i, (email, text) in enumerate(zip(emails, texts)):
            print(f"\n--- Document {i+1} ---")
            print(f"Email: {email}")
            print(f"Text:\n{text}\n")

        if len(texts) != len(emails):
            return jsonify({"error": "Mismatch between texts and emails"}), 400

        vectors = vectorize(texts)
        results = []

        for i in range(len(vectors)):
            for j in range(i + 1, len(vectors)):
                score = similarity(vectors[i], vectors[j])
                result = {
                    "email": emails[i],
                    "with": emails[j],
                    "percentage": round(score * 100, 2),
                    "status": classify_similarity(score)
                }
                results.append(result)

        return jsonify(results)

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": "An error occurred while processing the request"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
