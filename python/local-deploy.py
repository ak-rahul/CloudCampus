from flask import Flask, request, jsonify, send_file
from PIL import Image
from transformers import AutoModelForCausalLM
import io
import os
import tempfile
from pdf2image import convert_from_bytes
from flask_cors import CORS

# Load the Moondream2 model
model = AutoModelForCausalLM.from_pretrained(
    "vikhyatk/moondream2",
    revision="2025-01-09",
    trust_remote_code=True,
    # device_map={"": "cuda"}  # Uncomment if using GPU
)

app = Flask(__name__)
CORS(app)

@app.route('/upload', methods=['POST'])
def upload_pdf():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    print(f"Received file: {file.filename}")
    print(f"File content type: {file.content_type}")

    try:
        pdf_bytes = file.read()
        images = convert_from_bytes(pdf_bytes)
    except Exception as e:
        print(f"Error while converting PDF: {str(e)}")
        return jsonify({"error": f"Failed to process PDF: {str(e)}"}), 500

    extracted_text = ""

    try:
        for i, image in enumerate(images):
            print(f"Processing page {i + 1}...")
            encoded = model.encode_image(image)
            result = model.query(encoded, "Extract all the handwritten text from the image")
            extracted_text += f"\n--- Page {i+1} ---\n{result['answer']}\n"
    except Exception as e:
        print(f"Model inference error: {str(e)}")
        return jsonify({"error": f"Model error: {str(e)}"}), 500

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".txt", mode="w+", encoding='utf-8') as temp_file:
            temp_file.write(extracted_text)
            temp_path = temp_file.name
    except Exception as e:
        print(f"Error writing temp file: {str(e)}")
        return jsonify({"error": f"File write error: {str(e)}"}), 500

    return send_file(temp_path, mimetype='text/plain', as_attachment=True, download_name='extracted_text.txt')


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
