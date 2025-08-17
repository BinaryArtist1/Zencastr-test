import { Router, Request, Response, NextFunction } from "express";
import { KaodisClient } from "../kaodis-client/index.js";

const router = Router();
const KAODIS_URL = process.env.KAODIS_URL || "http://127.0.0.1:7379";
const client = new KaodisClient(KAODIS_URL);

// async wrapper so thrown/rejected errors reach the global error handler
const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// UI home
router.get("/", (_req, res) => res.render("index"));

// UI keys (will show global error if Kaodis is down)
router.get(
  "/keys",
  asyncHandler(async (_req, res) => {
    const data = await client.keys();
    res.render("keys", { keys: data.keys || [] });
  })
);

// UI form POST
router.post(
  "/set",
  asyncHandler(async (req, res) => {
    const { key, value } = req.body;
    if (!key || typeof key !== "string")
      return res.status(400).send("Key is required");
    await client.set(key, value);
    res.redirect("/keys");
  })
);

// JSON demo endpoints
router.post(
  "/demo/set",
  asyncHandler(async (req, res) => {
    res.json(await client.set(req.body.key, req.body.value));
  })
);

router.get(
  "/demo/get/:key",
  asyncHandler(async (req, res) => {
    res.json(await client.get(req.params.key));
  })
);

// Browser-friendly delete via GET and API delete via DELETE
router.get(
  "/demo/del/:key",
  asyncHandler(async (req, res) => {
    await client.del(req.params.key);
    res.redirect("/keys");
  })
);

router.delete(
  "/demo/del/:key",
  asyncHandler(async (req, res) => {
    res.json(await client.del(req.params.key));
  })
);

router.get(
  "/demo/keys",
  asyncHandler(async (_req, res) => {
    res.json(await client.keys());
  })
);

export default router;
