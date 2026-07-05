const form = document.getElementById("aqiForm");
const result = document.getElementById("result");

function renderError(message) {
  result.classList.remove("hidden");
  result.innerHTML = `<p class="error">${message}</p>`;
}

function renderResult(payload) {
  result.classList.remove("hidden");
  result.innerHTML = `
    <h2>Hello, ${payload.name}</h2>
    <p><strong>Location:</strong> ${payload.resolvedLocation}</p>
    <p><strong>Nearby AQI:</strong> ${payload.aqi}</p>
    <p><strong>Category:</strong> ${payload.category}</p>
    <p><strong>Coordinates:</strong> ${payload.coordinates.latitude.toFixed(4)}, ${payload.coordinates.longitude.toFixed(4)}</p>
  `;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const name = formData.get("name")?.toString().trim();
  const location = formData.get("location")?.toString().trim();

  if (!name || !location) {
    renderError("Please enter both name and location.");
    return;
  }

  result.classList.remove("hidden");
  result.innerHTML = "<p>Fetching nearby AQI...</p>";

  try {
    const response = await fetch(`${window.APP_CONFIG.apiBaseUrl}/api/aqi`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, location })
    });

    const data = await response.json();

    if (!response.ok) {
      renderError(data.error || "Failed to fetch AQI details.");
      return;
    }

    renderResult(data);
  } catch (_error) {
    renderError("Unable to connect to the backend services.");
  }
});
