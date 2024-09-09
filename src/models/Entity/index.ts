import { IUser } from "models/User";

export * from "./IEntity";

export const getRefId = (entity?: Record<string, any> | null, key?: string) => {
  if (!entity) return "";
  const value = entity[key || "createdBy"];

  if (typeof value === "object") return value?._id;

  return value;
};

export const isUser = (entity?: any): entity is IUser => {
  return (
    !!entity &&
    ((entity as IUser).email !== undefined ||
      (entity as IUser).userName !== undefined)
  );
};
