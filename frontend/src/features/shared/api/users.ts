import api from "./axios";
import type { User, Role } from "../types/users";

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get<User[]>("/users");
  return response.data;
};

export const createUser = async (data: {
  username: string;
  password: string;
  full_name: string;
  email: string;
  role: User["role"];
}) => {
  const response = await api.post("/users", data);
  return response.data;
};

export const updateUser = async (id: number, data: Pick<User, "username" | "full_name" | "email" | "role">) => {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: number) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

export type EditableUser = Pick<User, "username" | "full_name" | "email"> & { role: Role };