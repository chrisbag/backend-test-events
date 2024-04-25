import { Express } from "express";
import {
  createEvent,
  getEvent,
  getEvents,
  patchEvent,
  deleteEvent,
} from "./controller";

export default (app: Express) => {
  app.get("/events", getEvents);

  app.post("/events", createEvent);

  app.get("/events/:id", getEvent);

  app.patch("/events/:id", patchEvent);

  app.delete("/events/:id", deleteEvent);
};
