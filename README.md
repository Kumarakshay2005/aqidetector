# AQI Nearby Location App (Microservices)

This project is a simple microservice architecture app under the `3-tier` folder.

It takes user input:
- Name
- Location

And shows nearby AQI information for the entered location.

## Services

- `frontend` (port `3000`): User interface for input and AQI display
- `api-gateway` (port `4000`): Handles frontend requests and validates payload
- `aqi-service` (port `5000`): Fetches geolocation and AQI data using Open-Meteo APIs

## Run with Docker Compose

From the root folder:

```bash
docker compose up
```

Then open:

- http://localhost:3000

## Build Docker Images For Microservices

From the root folder:

```bash
docker build -t your-dockerhub-user/frontend:v1 ./frontend
docker build -t your-dockerhub-user/api-gateway:v1 ./services/api-gateway
docker build -t your-dockerhub-user/aqi-service:v1 ./services/aqi-service
```

Push images to your registry:

```bash
docker push your-dockerhub-user/frontend:v1
docker push your-dockerhub-user/api-gateway:v1
docker push your-dockerhub-user/aqi-service:v1
```

## Run Without Docker

Open 3 terminals from the root folder:

1. AQI service

```bash
cd services/aqi-service
npm install
npm start
```

2. API gateway

```bash
cd services/api-gateway
npm install
npm start
```

3. Frontend

```bash
cd frontend
npm install
npm start
```

Open http://localhost:3000

## Deploy On Kubernetes With Helm

Chart path:

```bash
helm/aqi-microservices
```

Install using the deployment and environment values files:

```bash
helm install aqi-app ./helm/aqi-microservices \
  -f ./helm/aqi-microservices/values-deployment.yaml \
  -f ./helm/aqi-microservices/values-env.yaml
```

Upgrade release after changes:

```bash
helm upgrade aqi-app ./helm/aqi-microservices \
  -f ./helm/aqi-microservices/values-deployment.yaml \
  -f ./helm/aqi-microservices/values-env.yaml
```

Uninstall release:

```bash
helm uninstall aqi-app
```

## API Contract

Gateway endpoint:

- `POST /api/aqi`

Request body:

```json
{
  "name": "Akshay",
  "location": "Bengaluru"
}
```

Response example:

```json
{
  "name": "Akshay",
  "locationInput": "Bengaluru",
  "resolvedLocation": "Bengaluru, India",
  "coordinates": {
    "latitude": 12.9762,
    "longitude": 77.6033
  },
  "aqi": 76,
  "category": "Moderate",
  "source": "open-meteo us_aqi"
}
```
