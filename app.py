from flask import Flask, request, jsonify
from flask_cors import CORS
from textblob import TextBlob
import requests

app = Flask(__name__)
CORS(app)

@app.route('/analyze')
def analyze():

    product = request.args.get("product")

    if not product:
        return jsonify({"error":"No product"}),400

    # Demo reviews (replace later with real APIs)
    reviews = [
        f"{product} performance is excellent",
        f"{product} battery life is average",
        f"{product} value for money is good",
        f"I had some issues with {product}"
    ]

    total = 0

    for review in reviews:
        total += TextBlob(review).sentiment.polarity

    avg = total / len(reviews)

    score = int((avg + 1) * 50)

    return jsonify({
        "reviews": reviews,
        "score": score
    })

if __name__ == "__main__":
    app.run(port=5000, debug=True)

    