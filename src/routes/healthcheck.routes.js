import { Router } from "express";
import { healthCheck } from "../controllers/healthcheck.controller.js";

const router=Router();
router.route("/").get(healthCheck);
// A Healthcheck is the perfect use case for .get() because of the nature of the request: you are asking the server how it feels, not telling it to change anything.

export default router;