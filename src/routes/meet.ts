import express from "express";
import { getMeetingLink } from "../controllers/meet_controller";
// import { joinZoomLink } from "../controllers/zoom_controller";
const meetRouter = express.Router();

meetRouter.post("/meeting_link", getMeetingLink);
// meetRouter.post("/join_zoom", joinZoomLink);

export default meetRouter;
