/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Member, MemberForm } from "../../shared/types/member";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/members`;

// helper
const getToken = () => localStorage.getItem("token");

// ================= GET MEMBERS =================
export const getMembers = async (): Promise<Member[]> => {
  const token = getToken();

  const res = await fetch(API_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    console.error("GET MEMBERS ERROR:", error);
    throw new Error("Failed to fetch members");
  }

  return res.json();
};

// ================= CREATE MEMBER =================
export const createMember = async (form: MemberForm) => {
  const token = getToken();

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(form),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error("CREATE MEMBER ERROR:", error);
    throw new Error("Failed to create member");
  }

  return res.json();
};

// ================= UPDATE MEMBER =================
export const updateMember = async (id: number, data: any) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message || "Failed to update member");
  }

  return result;
};