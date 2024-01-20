import express from "express";
import { getMeetingLink } from "../controllers/meet_controller";
const meetRouter = express.Router();

meetRouter.post("/meeting_link", getMeetingLink);

export default meetRouter;
