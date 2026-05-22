import "dotenv/config";
import express from "express";
import { checkAuth } from "./middleware/checkAuth.js";

const app = express();

app.use(express.json());

app.get("/api/permissions", checkAuth, (req, res) => {
  res.json({
    message: "You are authenticated.",
    user: req.user,
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});