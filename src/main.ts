import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import { handleBotRequest } from "./BotService";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/get-daily-news", async (req: Request, res: Response) => {
  try {
    const email = (req.query.email as string) || undefined;
    const categoryParams = (req.query.category as string) || undefined;
    const result = await handleBotRequest(email, categoryParams);

    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
  } catch (error: unknown) {
    console.error("❌ Bot service error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    res.status(500).json({
      success: false,
      message: `Internal server error: ${errorMessage}`,
      greeting: "",
      summary: null,
      sentTo: "",
    });
  }
});

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
