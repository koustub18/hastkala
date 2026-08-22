# Hastkala - Backend Repository

This is the backend server for the Hastkala application. It focuses on providing APIs for the frontend to manage artisans, products, users, and orders.

## Project Structure

- \`src/models/\`: Mongoose or other ORM/ODM schemas for database structure (e.g., \`User.js\`, \`Product.js\`).
- \`src/controllers/\`: The logic for handling API requests (e.g., \`authController.js\`, \`productController.js\`).
- \`src/routes/\`: Express route definitions connecting URLs to controllers (e.g., \`authRoutes.js\`).
- \`src/middleware/\`: Custom middleware functions like authentication or error handling.
- \`src/config/\`: Configuration files like database connection strings or environment setup.
- \`server.js\`: The main entry point that initializes the Express application.

## Getting Started

1. **Install Dependencies:**
   Navigate into the \`backend\` directory and install the necessary npm packages:
   \`\`\`bash
   cd backend
   npm install
   \`\`\`

2. **Environment Variables:**
   Create a \`.env\` file in the root of the \`backend\` directory with the necessary keys. For example:
   \`\`\`env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   \`\`\`

3. **Run the Server:**
   To start the server for development with hot-reloading:
   \`\`\`bash
   npm run dev
   \`\`\`
   To start the server in standard mode:
   \`\`\`bash
   npm start
   \`\`\`

## Notes for Backend Team
- Currently, the frontend is built using React with Vite. Since it's in a separated \`/src\` directory at the root, keep your code self-contained within this \`/backend\` directory.
- Feel free to restructure to meet whatever architecture pattern your team prefers! This is just a boilerplate.
