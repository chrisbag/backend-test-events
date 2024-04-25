import { users } from "./controller";

export const isExistingUserId = (userId: number) => {
  const user = users.find((user) => user.id === userId);
  return user ? true : false;
};
