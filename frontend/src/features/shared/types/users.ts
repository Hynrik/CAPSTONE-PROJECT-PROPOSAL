export type Role = "admin" | "superadmin";

export interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: Role;
  created_At: string;
  created_by?: number | null;
}