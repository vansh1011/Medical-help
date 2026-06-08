import { useEffect, useState } from "react";
import toast from "react-hot-toast";

function NearestHospital() {
  const [radius, setRadius] = useState("");
  const [lat, setLat] = useState(null);
  const [long, setLong] = useState(null);
  const [hospital, setHospital] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Using maximumAge to keep user coordinates updated without refresh

    const options = {
      enableHighAccuracy: true,
      maximumAge: 30000,
    };

    const success = (position) => {
      setLat(position.coords.latitude);
      setLong(position.coords.longitude);
    };

    const error = (err) => {
      console.error(err.message);
    };
    // Geolocation API uses callbacks instead of promises (watchPosition triggers callback with updated location)
    const watchID = navigator.geolocation.watchPosition(
      success,
      error,
      options,
    );

    return () => navigator.geolocation.clearWatch(watchID);
    // Cleanup geolocation watcher to prevent memory leaks
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!lat || !long || !radius) return;

    setLoading(true);

    try {
      const query = `
       [out:json][timeout:30];
       nwr(around:${Number(radius) * 1000},${lat},${long})["amenity"="hospital"];
       out center;
      `;

      const response = await fetch(
        "https://overpass.kumi.systems/api/interpreter",
        {
          method: "POST",
          headers: {
            "Content-Type": "text/plain",
          },
          body: query,
        },
      );

      if (!response.ok) {
        throw new Error("Server error while fetching hospitals");
      }

      const text = await response.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        throw new Error("Invalid response from server");
      }

      const hospitalData = data.elements.map((hos) => ({
        name: hos.tags?.name || "Unknown Hospital",
        lat: hos.lat ?? hos.center?.lat,
        lon: hos.lon ?? hos.center?.lon,
        phone: hos.tags?.phone || "Not available",
        address:
          hos.tags?.["addr:full"] ||
          hos.tags?.["addr:street"] ||
          "Address not available",
      }));

      setHospital(hospitalData);
    } catch (error) {
      console.error(error);

      toast.error(error.message || "Failed to fetch hospitals");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 sm:px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Nearest Hospitals
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Find hospitals around your current location
          </p>
        </div>

        <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 sm:p-6 mb-6">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 sm:items-center"
          >
            <input
              type="number"
              value={radius}
              onChange={(e) => setRadius(Math.min(e.target.value, 20))}
              placeholder="Enter radius (max 20 km)"
              className="w-full sm:w-64 px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:border-cyan-500 transition"
            />

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 transition shadow-sm shadow-cyan-200"
            >
              {loading ? "Searching..." : "Find Hospitals"}
            </button>
          </form>

          <div className="mt-3 text-xs text-slate-400">
            {lat && long
              ? "Location detected ✔"
              : "Waiting for location access..."}
          </div>
        </div>

        {hospital.length === 0 && !loading && (
          <div className="text-center text-slate-400 mt-10">
            No hospitals found yet
          </div>
        )}

        {loading && (
          <div className="text-center text-slate-500 mt-10">
            Loading nearby hospitals...
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {hospital.map((hos, index) => (
            <div
              key={index}
              className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-start gap-3">
                <h2 className="text-lg font-semibold text-slate-800">
                  {hos.name}
                </h2>

                <span className="text-xs px-2 py-1 bg-cyan-50 text-cyan-700 rounded-md">
                  Hospital
                </span>
              </div>

              <div className="mt-3 space-y-1 text-sm text-slate-600">
                <p>
                  <span className="font-medium text-slate-500">Phone:</span>{" "}
                  {hos.phone}
                </p>
                <p>
                  <span className="font-medium text-slate-500">Address:</span>{" "}
                  {hos.address}
                </p>
              </div>

              <a
                href={`https://www.google.com/maps?q=${hos.lat},${hos.lon}`}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-4 px-4 py-2 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
              >
                View on Map
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NearestHospital;
