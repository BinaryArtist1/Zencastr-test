import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url";
import demoRouter from "./routes/demo.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

// routes
app.use("/", demoRouter);

// global error handler (AFTER routes)
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  const code = err?.code || err?.cause?.code;
  const isConnErr =
    code === "ECONNREFUSED" ||
    code === "ENOTFOUND" ||
    code === "ECONNRESET" ||
    code === "EAI_AGAIN";

  if (isConnErr) {
    // UI pages expect HTML; API callers may want JSON
    if (req.accepts("json")) {
      return res
        .status(503)
        .json({ ok: false, error: "error connecting Kaodis" });
    }
    return res.status(503).send("error connecting Kaodis");
  }

  // fallback
  if (req.accepts("json")) {
    return res.status(500).json({ ok: false, error: "internal error" });
  }
  return res.status(500).send("internal error");
});

const port = Number(process.env.APP_PORT || 3000);
app.listen(port, () =>
  console.log(`Zencastr app running on http://127.0.0.1:${port}`)
);
