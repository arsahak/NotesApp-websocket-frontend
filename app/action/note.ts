// "use server";

// import { fetchWithAuth } from "./fetchWithAuth";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// export const createNote = async (title: string, content: string) => {
//   const response = await fetchWithAuth(`${API_URL}/api/notes`, {
//     method: "POST",
//     body: JSON.stringify({ title, content }),
//   });

//   return response || {}; // Ensure response is always valid
// };

// export const getNotes = async () => {
//   const response = await fetchWithAuth(`${API_URL}/api/notes`);
//   return response || []; // Return empty array if undefined
// };

// export const updateNote = async (
//   id: string,
//   title: string,
//   content: string
// ) => {
//   const response = await fetchWithAuth(`${API_URL}/api/notes/${id}`, {
//     method: "PUT",
//     body: JSON.stringify({ title, content }),
//   });

//   return response || {}; // Prevent undefined errors
// };

// export const deleteNote = async (id: string) => {
//   const response = await fetchWithAuth(`${API_URL}/api/notes/${id}`, {
//     method: "DELETE",
//   });

//   return response || {}; // Ensure response consistency
// };

"use server";

import { fetchWithAuth } from "./fetchWithAuth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Create a new note with public/private option
export const createNote = async (
  title: string,
  content: string,
  isPublic: boolean = false
) => {
  const response = await fetchWithAuth(`${API_URL}/api/notes`, {
    method: "POST",
    body: JSON.stringify({ title, content, isPublic }),
  });

  return response || {}; // Ensure response is always valid
};

// Get all notes (user's own notes + public notes)
export const getNotes = async () => {
  const response = await fetchWithAuth(`${API_URL}/api/notes`);
  return response || []; // Return empty array if undefined
};

// Get a single note by ID
export const getNoteById = async (id: string) => {
  const response = await fetchWithAuth(`${API_URL}/api/notes/${id}`);
  return response || null; // Return null if not found
};

// Update a note (including edit history)
export const updateNote = async (
  id: string,
  title: string,
  content: string
) => {
  const response = await fetchWithAuth(`${API_URL}/api/notes/${id}`, {
    method: "PUT",
    body: JSON.stringify({ title, content }),
  });

  return response || {}; // Prevent undefined errors
};

// Delete a note
export const deleteNote = async (id: string) => {
  const response = await fetchWithAuth(`${API_URL}/api/notes/${id}`, {
    method: "DELETE",
  });

  return response || {}; // Ensure response consistency
};
