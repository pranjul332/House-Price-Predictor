from flask import Flask, request, jsonify
import pickle
import pandas as pd
import os

app = Flask(__name__)

model = None
locations = []

def load_model():
    global model
    with open("RidgeModel.pkl", "rb") as f:
        model = pickle.load(f)

def load_locations():
    global locations
    df = pd.read_csv("Cleaned_data.csv")
    locations = sorted(df["location"].unique().tolist())

load_model()
load_locations()

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json

        input_df = pd.DataFrame({
            "location": [data["location"]],
            "total_sqft": [float(data["total_sqft"])],
            "bath": [float(data["bath"])],
            "bhk": [int(data["bhk"])]
        })

        prediction = model.predict(input_df)[0]

        return jsonify({
            "prediction": round(prediction, 2)
        })

    except Exception as e:
        return jsonify({ "error": str(e) }), 500

@app.route("/locations", methods=["GET"])
def get_locations():
    return jsonify({ "locations": locations })

@app.route("/health", methods=["GET"])
def health():
    return jsonify({ "status": "ok" })

if __name__ == "__main__":
    app.run(port=5001)
