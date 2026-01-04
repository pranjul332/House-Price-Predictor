"use client"
import React, { useState, useEffect } from "react";
import {
  Home,
  MapPin,
  Bath,
  Bed,
  Square,
  TrendingUp,
  Info,
} from "lucide-react";

const API_URL = "http://localhost:4000/api";

export default function HousePricePredictor() {
  const [locations, setLocations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);

  const [formData, setFormData] = useState({
    location: "",
    total_sqft: "",
    bath: "",
    bhk: "",
  });

  useEffect(() => {
    fetchLocations();
    // fetchStats();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await fetch(`${API_URL}/locations`);
      const data = await response.json();
      setLocations(data.locations || []);

    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  // const fetchStats = async () => {
  //   try {
  //     const response = await fetch(`${API_URL}/stats`);
  //     const data = await response.json();
  //     if (data.success) {
  //       setStats(data.stats);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching stats:", error);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPrediction(null);
    const sqft = Number(formData.total_sqft);
    const bhk = Number(formData.bhk);

    if (sqft < 300) {
      alert("Total square feet must be at least 300.");
      setLoading(false);
      return;
    }

    if (bhk * 250 > sqft) {
      alert("Total square feet is too small for the selected BHK.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setPrediction(data);
      } else {
        alert(data.error || "Prediction failed");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to get prediction. Make sure Flask server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Home className="w-12 h-12 text-indigo-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">
              Bengaluru House Price Predictor
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Predict house prices using machine learning
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Price</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    ₹{stats.avg_price.toFixed(0)}L
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-indigo-400" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Locations</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {stats.total_locations}
                  </p>
                </div>
                <MapPin className="w-8 h-8 text-indigo-400" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Area</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {stats.avg_sqft.toFixed(0)}
                  </p>
                </div>
                <Square className="w-8 h-8 text-indigo-400" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Properties</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {stats.total_properties}
                  </p>
                </div>
                <Info className="w-8 h-8 text-indigo-400" />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-black">
          {/* Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Property Details
            </h2>

            <div className="space-y-6">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 mr-2" />
                  Location
                </label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select Location</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Square className="w-4 h-4 mr-2" />
                  Total Square Feet
                </label>
                <input
                  type="number"
                  name="total_sqft"
                  value={formData.total_sqft}
                  onChange={handleChange}
                  min="300"
                  max="10000"
                  step="50"
                  placeholder="e.g., 1200 (min 300)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Bed className="w-4 h-4 mr-2" />
                    BHK
                  </label>
                  <input
                    type="number"
                    name="bhk"
                    value={formData.bhk}
                    onChange={handleChange}
                    min="1"
                    max="10"
                    placeholder="e.g., 2"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Bath className="w-4 h-4 mr-2" />
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    name="bath"
                    value={formData.bath}
                    onChange={handleChange}
                    min="1"
                    max="10"
                    placeholder="e.g., 2"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Predicting..." : "Predict Price"}
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Prediction Results
            </h2>

            {prediction ? (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
                  <p className="text-sm opacity-90 mb-2">Estimated Price</p>
                  <p className="text-4xl font-bold">
                    ₹{prediction.prediction} Lakhs
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-sm text-gray-600 mb-2">Price per Sq Ft</p>
                  <p className="text-2xl font-bold text-gray-800">
                    ₹{prediction.price_per_sqft.toFixed(0)}
                  </p>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-800 mb-4">
                    Input Summary
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">
                        {prediction.input.location}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Area:</span>
                      <span className="font-medium">
                        {prediction.input.total_sqft} sq ft
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">BHK:</span>
                      <span className="font-medium">
                        {prediction.input.bhk}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bathrooms:</span>
                      <span className="font-medium">
                        {prediction.input.bath}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> This prediction is based on
                    historical data from Bengaluru housing market and uses Ridge
                    Regression model with 82.3% accuracy.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <Home className="w-16 h-16 mb-4" />
                <p className="text-lg">
                  Enter property details to get prediction
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-600">
          <p className="text-sm">
            Built with Next.js, Flask, and Ridge Regression ML Model
          </p>
          <p className="text-xs mt-2">
            Dataset: Bengaluru House Prices | Accuracy: 82.3%
          </p>
        </div>
      </div>
    </div>
  );
}
