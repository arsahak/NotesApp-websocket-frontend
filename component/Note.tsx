"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import {
  createNote,
  deleteNote,
  getNotes,
  updateNote,
} from "../app/action/note";

// Initialize socket connection
const socket = io("http://localhost:8000", { autoConnect: false });

export default function Note() {
  const [notes, setNotes] = useState<
    { _id: string; title: string; content: string }[]
  >([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch Notes & Setup WebSocket
  useEffect(() => {
    async function fetchNotes() {
      try {
        setLoading(true);
        const data = await getNotes();
        setNotes(Array.isArray(data) ? data : []); // Ensure valid array
      } catch (error) {
        console.error("Error fetching notes:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNotes();
    socket.connect();

    // Listen for real-time updates
    socket.on("noteUpdated", (updatedNote) => {
      setNotes((prev) =>
        prev.some((n) => n._id === updatedNote._id)
          ? prev.map((n) => (n._id === updatedNote._id ? updatedNote : n))
          : [...prev, updatedNote]
      );
    });

    socket.on("noteDeleted", (deletedNote) => {
      setNotes((prev) => prev.filter((n) => n._id !== deletedNote._id));
    });

    return () => {
      socket.off("noteUpdated");
      socket.off("noteDeleted");
      socket.disconnect();
    };
  }, []);

  // Create or Update Note
  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;

    try {
      setLoading(true);
      if (editId) {
        const updatedNote = await updateNote(editId, title, content);
        setNotes((prev) =>
          prev.map((n) => (n._id === editId ? updatedNote : n))
        );
        socket.emit("updateNote", updatedNote);
      } else {
        const newNote = await createNote(title, content);
        setNotes((prev) => [...prev, newNote]);
        socket.emit("createNote", newNote);
      }

      setTitle("");
      setContent("");
      setEditId(null);
    } catch (error) {
      console.error("Error saving note:", error);
    } finally {
      setLoading(false);
    }
  };

  // Edit Note
  const handleEdit = (note: {
    _id: string;
    title: string;
    content: string;
  }) => {
    setTitle(note.title);
    setContent(note.content);
    setEditId(note._id);
  };

  // Delete Note
  const handleDelete = async (id: string) => {
    try {
      setNotes((prev) => prev.filter((n) => n._id !== id));
      await deleteNote(id);
      socket.emit("deleteNote", { _id: id });
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h1 className="text-2xl font-bold text-center mb-4">Notes</h1>

      <div className="bg-gray-100 p-4 rounded-lg shadow-md">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 mb-2 border rounded-md"
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-2 mb-2 border rounded-md"
        />
        <button
          onClick={handleSubmit}
          className={`w-full py-2 rounded-md transition ${
            loading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
          disabled={loading}
        >
          {loading ? "Processing..." : editId ? "Update Note" : "Add Note"}
        </button>
      </div>

      {loading && <p className="text-center mt-4">Loading notes...</p>}

      <ul className="mt-6">
        {notes.map((note) => (
          <li
            key={note._id}
            className="flex justify-between items-center p-4 bg-white shadow-md rounded-md mb-2"
          >
            <div>
              <h2 className="font-bold">{note.title}</h2>
              <p>{note.content}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(note)}
                className="bg-green-500 text-white px-3 py-1 rounded-md"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(note._id)}
                className="bg-red-500 text-white px-3 py-1 rounded-md"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
