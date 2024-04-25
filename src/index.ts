import express from "express";

import services from "./services";

const app = express();
const PORT = 3040;

// Middleware
app.use(express.json());

// Configures services
services(app);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
