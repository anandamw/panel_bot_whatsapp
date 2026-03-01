import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import expressLayouts from "express-ejs-layouts"; // Import layouts
import BotManager from "./services/BotManager.js";
import routes from "./routes/index.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Setup View Engine
app.use(expressLayouts); // Use layouts middleware
app.set("layout", "./layouts/main"); // Set default layout
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "assets")));
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Bot Manager
const botManager = new BotManager(io);
botManager.initializeBots(); // Restore sessions
app.set("botManager", botManager);

// Routes
app.use("/", routes);

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
