import express from "express";
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";
import cors from 'cors';

import forumRoutes from './routes/forumRoutes.js';
import marketItemRoutes from "./routes/marketItemRoutes.js";
import weatherRoutes from "./routes/weatherRoutes.js";
import adviceRoutes from "./routes/adviceRoutes.js";

const app = express();

app.use(cors({ origin: process.env.CORS, credentials: true }));
app.use(express.json());         
app.use(cookieParser());

dotenv.config();

app.use(express.json());

app.on("error", (err, req, res, next) => {
    console.log(err);
    res.status(500).send(err);
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);

app.get("/test", (req, res) => {
    res.json({ message: "Test Route: Server is up and running" });
})

app.use("/api/market-items", marketItemRoutes);

app.use('/api/forum', forumRoutes);

app.use('/api/weather', weatherRoutes);

app.use('/api/advice', adviceRoutes);

const PORT = process.env.PORT || 5000;
(async function () {
    try {
        const db_connection = await mongoose.connect(process.env.MONGO_URI);
        console.log(db_connection.connection.host, "DB Connected");
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.log("Error Connecting DB: ", error);
        process.exit(1);
    }
})();



