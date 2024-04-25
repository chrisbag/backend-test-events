import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

import { defaultEvents } from "./data";
import { BunjiEvent } from "./types";
import { createEventSchema, patchEventSchema } from "./validation";
import { isExistingUserId } from "../users/helpers";

let events = defaultEvents;

// In-memory storage for events

export const createEvent = async (req: Request, res: Response) => {
  try {
    await createEventSchema.validate(req.body, {
      stripUnknown: false,
      abortEarly: false,
    });
  } catch (error: any) {
    return res
      .status(400)
      .json({ error: error.message, details: error.errors });
  }

  const {
    description,
    isDone,
    startAtDate,
    startAtTime,
    endAtDate,
    endAtTime,
    userId,
  } = req.body;

  if (!isExistingUserId(userId)) {
    return res.status(400).json({ error: "User not found" });
  }

  const newEvent: BunjiEvent = {
    id: uuidv4(),
    isDone,
    description: description || null,
    startAtDate,
    startAtTime,
    endAtDate,
    endAtTime,
    userId,
  };

  events.push(newEvent);
  res.status(201).json(newEvent);
};

export const getEvents = (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1; // Default to page 1 if page query parameter is not provided
  const limit = 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const results = events.slice(startIndex, endIndex);

  res.json({
    total: events.length,
    totalPages: Math.ceil(events.length / limit),
    currentPage: page,
    events: results,
  });
};

export const getEvent = async (req: Request, res: Response) => {
  const eventId = req.params.id;
  const event = events.find((event) => event.id === eventId);
  if (event) {
    res.json(event);
  } else {
    res.status(404).json({ error: "Event not found" });
  }
};

export const patchEvent = async (req: Request, res: Response) => {
  const eventId = req.params.id;

  try {
    await patchEventSchema.validate(req.body, {
      stripUnknown: false,
      abortEarly: false,
    });
  } catch (error: any) {
    console.log(error);

    return res
      .status(400)
      .json({ error: error.message, details: error.errors });
  }

  const {
    description,
    isDone,
    startAtDate,
    startAtTime,
    endAtDate,
    endAtDateTime,
    userId,
  } = req.body;

  if (userId && !isExistingUserId(userId)) {
    return res.status(400).json({ error: "User not found" });
  }

  const eventIndex = events.findIndex((event) => event.id === eventId);

  if (eventIndex !== -1) {
    // Update fields
    const updatedEvent = {
      ...events[eventIndex],
      isDone: isDone || events[eventIndex].isDone,
      description: description || events[eventIndex].description,
      startAtDate: startAtDate || events[eventIndex].startAtDate,
      startAtTime: startAtTime || events[eventIndex].startAtTime,
      endAtDate: endAtDate || events[eventIndex].endAtDate,
      endAtTime: endAtDateTime || events[eventIndex].endAtTime,
      userId: userId || events[eventIndex].userId,
    };

    // Update event in memory
    events[eventIndex] = updatedEvent;
    return res.json(updatedEvent);
  } else {
    return res.status(404).json({ error: "Event not found" });
  }
};

export const deleteEvent = (req: Request, res: Response) => {
  const eventId = req.params.id;
  events = events.filter((event) => event.id !== eventId);
  res.sendStatus(204);
};
