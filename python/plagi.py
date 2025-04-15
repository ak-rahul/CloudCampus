import os
import nltk
from nltk.corpus import wordnet as wn
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import word_tokenize

lemmatizer = WordNetLemmatizer()

def lemmatize_text(text):
    tokens = word_tokenize(text)
    lemmatized_tokens = [lemmatizer.lemmatize(word.lower()) for word in tokens]
    return ' '.join(lemmatized_tokens)

def synonym_replacement(text):
    tokens = word_tokenize(text)
    new_tokens = []
    for word in tokens:
        synsets = wn.synsets(word)
        if synsets:
            synonyms = synsets[0].lemmas()
            if synonyms:
                new_tokens.append(synonyms[0].name()) 
            else:
                new_tokens.append(word)
        else:
            new_tokens.append(word)
    return ' '.join(new_tokens)

def vectorize(Text):
    lemmatized_texts = [lemmatize_text(text) for text in Text]
    synonym_texts = [synonym_replacement(text) for text in lemmatized_texts]
    return TfidfVectorizer().fit_transform(synonym_texts).toarray()

def similarity(doc1, doc2):
    return cosine_similarity([doc1, doc2])

def classify_similarity(score):
    if score >= 0.95:
        return "Complete Plagiarism"
    elif score >= 0.70:
        return "Direct Plagiarism"
    elif score >= 0.5:
        return "Paraphrased"
    else:
        return "No Plagiarism"

student_files = [doc for doc in os.listdir() if doc.endswith('.txt')]
student_notes = [open(_file, encoding='utf-8').read() for _file in student_files]

vectors = vectorize(student_notes)
s_vectors = list(zip(student_files, vectors))
plagiarism_results = set()

def check_plagiarism():
    global s_vectors
    for student_a, text_vector_a in s_vectors:
        new_vectors = s_vectors.copy()
        current_index = new_vectors.index((student_a, text_vector_a))
        del new_vectors[current_index]
        for student_b, text_vector_b in new_vectors:
            sim_score = similarity(text_vector_a, text_vector_b)[0][1]
            label = classify_similarity(sim_score)
            student_pair = sorted((student_a, student_b))
            score = (student_pair[0], student_pair[1], sim_score, label)
            plagiarism_results.add(score)
    return plagiarism_results

for data in check_plagiarism():
    print(f"{data[0]} - {data[1]}: {round(float(data[2]), 4)} -> {data[3]}")