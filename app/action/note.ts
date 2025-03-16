"use server";

import { cookies } from "next/headers";
import { io } from "socket.io-client";

// Ensure socket is only initialized once
const socket = io("http://localhost:8000");

export const createNote = async (title: string, content: string) => {
  const token = (await cookies()).get("accessToken")?.value;

  const res = await fetch("http://localhost:8000/api/notes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${token}`,
    },
    body: JSON.stringify({ title, content }),
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to create note");

  const newNote = await res.json();

  // Emit event to notify others
  socket.emit("noteUpdated", newNote);

  return newNote;
};

export const getNotes = async () => {
  const token = (await cookies()).get("accessToken")?.value;

  const res = await fetch("http://localhost:8000/api/notes", {
    headers: { Authorization: `${token}` },
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch notes");
  return res.json();
};

export const getNote = async (id: string) => {
  const token = (await cookies()).get("accessToken")?.value;

  const res = await fetch(`http://localhost:8000/api/notes/${id}`, {
    headers: { Authorization: `${token}` },
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch note");
  return res.json();
};

export const updateNote = async (
  id: string,
  title: string,
  content: string
) => {
  const token = (await cookies()).get("accessToken")?.value;

  const res = await fetch(`http://localhost:8000/api/notes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${token}`,
    },
    body: JSON.stringify({ title, content }),
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to update note");

  const updatedNote = await res.json();

  // Emit event to notify others
  socket.emit("noteUpdated", updatedNote);

  return updatedNote;
};

export const deleteNote = async (id: string) => {
  const token = (await cookies()).get("accessToken")?.value;

  const res = await fetch(`http://localhost:8000/api/notes/${id}`, {
    method: "DELETE",
    headers: { Authorization: `${token}` },
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to delete note");

  const deletedNote = await res.json();

  // Emit event to notify others
  socket.emit("noteDeleted", { _id: id });

  return deletedNote;
};
