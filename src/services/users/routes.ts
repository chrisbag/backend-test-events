import { Express } from "express";
import { getUsers } from "./controller";

export default (app: Express) => {
  app.get("/users", getUsers);
};
