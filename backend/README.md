# Hastkala - Backend Repository

This is the backend server for the Hastkala application. It focuses on providing a secure proxy for AI services (like Gemini AI pricing) to ensure API keys are not exposed to the client.

## Project Structure

- `routes/`: Express route definitions connecting URLs to AI services (e.g., `ai.js`).
- `server.js`: The main entry point that initializes the Express application.

## Getting Started

1. **Install Dependencies:**
   Navigate into the `backend` directory and install the necessary npm packages:
   ```bash
   cd backend
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file in the root of the `backend` directory with the necessary keys. For example:
   ```env
   PORT=5001
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. **Run the Server:**
   To start the server for development with hot-reloading:
   ```bash
   npm run dev
   ```
   To start the server in standard mode:
   ```bash
   npm start
   ```

## Architecture Notes
- The application uses Firebase Authentication and Firestore as the single source of truth for the database and user management.
- The Express backend is currently used strictly as a secure gateway for AI requests (e.g., Dynamic Pricing engine).
- Do not add database logic (MongoDB/Mongoose) or JWT logic here.
