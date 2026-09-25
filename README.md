# web_node_full

# Học lái xe Tuyên Quang

Website landing page và blog SEO cho dịch vụ học lái xe ô tô và xe máy tại Tuyên Quang.

## Frontend

- React + Vite + TailwindCSS

## Backend

- Node.js + Express + MongoDB + Mongoose

## Run

```bash
cd client
npm install
npm run dev

cd ../server
npm install
cp .env.example .env
npm run dev
```

The app defaults to port 5001 for the API to avoid local conflicts on port 5000.

## Production notes

- Configure MongoDB connection in `server/.env`.
- Update the contact and SEO content in the frontend and API data as needed.
- For real Dashboard visitor and page-view metrics, create a Google Analytics 4 service account with Viewer access to the property, then set `GA_PROPERTY_ID` and `GOOGLE_APPLICATION_CREDENTIALS` in `server/.env`. The Dashboard reads the last 30 days from the GA4 Data API.
