from flask import Flask, request, jsonify
import tensorflow as tf
from tensorflow.keras.preprocessing.sequence import pad_sequences
import pickle
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ✅ Base directory (safe for any working dir)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ✅ Load model and preprocessors
model = tf.keras.models.load_model(os.path.join(BASE_DIR, 'emotion_detection_model.h5'))

with open(os.path.join(BASE_DIR, 'tokenizer.pickle'), 'rb') as handle:
    tokenizer = pickle.load(handle)

with open(os.path.join(BASE_DIR, 'label_encoder.pickle'), 'rb') as f:
    label_encoder = pickle.load(f)

MAX_SEQUENCE_LENGTH = 50

@app.route('/detect_emotion', methods=['POST'])
def predict_emotion():
    data = request.get_json()
    message = data.get('message', '')

    sequence = tokenizer.texts_to_sequences([message])
    padded = pad_sequences(sequence, maxlen=MAX_SEQUENCE_LENGTH, padding='post')

    prediction = model.predict(padded)
    predicted_class = prediction.argmax(axis=1)[0]
    predicted_emotion = label_encoder.inverse_transform([predicted_class])[0]

    return jsonify({'emotion': predicted_emotion})

if __name__ == '__main__':
    app.run(debug=True)
