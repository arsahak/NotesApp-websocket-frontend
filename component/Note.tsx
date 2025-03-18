"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { io } from "socket.io-client";

import {
  createNote,
  deleteNote,
  getNotes,
  updateNote,
} from "../app/action/note";

import { formatDate } from "./shared/DateFormat";

type EditHistory = {
  userName: string;
  editedAt: string;
};

interface NoteProps {
  _id: string;
  title: string;
  content: string;
  editHistory?: { userName: string; editedAt: string }[];
}

// Initialize socket connection
const socket = io("http://localhost:8000", { autoConnect: false });

export default function Note() {
  const [notes, setNotes] = useState<NoteProps[]>([]);
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
        console.log("Fetched Notes:", data);
        setNotes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching notes:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNotes();
    socket.connect();

    // WebSocket Event Handlers
    const handleNoteCreated = (newNote: any) => {
      setNotes((prev) => [...prev, newNote]);
    };

    const handleNoteUpdated = (updatedNote: NoteProps) => {
      setNotes((prev) =>
        prev.some((n) => n._id === updatedNote._id)
          ? prev.map((n) => (n._id === updatedNote._id ? updatedNote : n))
          : [...prev, updatedNote]
      );
    };

    const handleNoteDeleted = (deletedNote: any) => {
      setNotes((prev) => prev.filter((n) => n._id !== deletedNote._id));
    };

    socket.on("noteCreated", handleNoteCreated);
    socket.on("noteUpdated", handleNoteUpdated);
    socket.on("noteDeleted", handleNoteDeleted);

    return () => {
      socket.off("noteCreated", handleNoteCreated);
      socket.off("noteUpdated", handleNoteUpdated);
      socket.off("noteDeleted", handleNoteDeleted);
      socket.disconnect();
    };
  }, []);

  // Create or Update Note
  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required!");
      return;
    }

    try {
      setLoading(true);
      if (editId) {
        const updatedNote = await updateNote(editId, title, content);
        setNotes((prev) =>
          prev.map((n) => (n._id === editId ? updatedNote : n))
        );
        socket.emit("updateNote", updatedNote);
        toast.success("Note updated successfully! ✅");
      } else {
        const newNote = await createNote(title, content);
        socket.emit("createNote", newNote);
        toast.success("Note created successfully! 🎉");
      }

      setTitle("");
      setContent("");
      setEditId(null);
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("Failed to save note! ❌");
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
      toast.success("Note deleted successfully! 🗑️");
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note! ❌");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Notes
      </h1>

      <div className="bg-white shadow-md p-6 rounded-lg">
        <input
          type="text"
          placeholder="Enter title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 mb-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          placeholder="Write your note here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-3 mb-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
        />
        <button
          onClick={handleSubmit}
          className={`w-full py-3 rounded-lg transition font-semibold ${
            loading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
          disabled={loading}
        >
          {loading ? "Processing..." : editId ? "Update Note" : "Add Note"}
        </button>
      </div>

      {loading && (
        <p className="text-center mt-4 text-gray-500">Loading notes...</p>
      )}

      <ul className="mt-6 space-y-4">
        {notes.map((note) => (
          <li
            key={note._id}
            className="flex justify-between items-start p-5 bg-white shadow-md rounded-lg transition hover:shadow-lg"
          >
            <div className="flex-1">
              <h2 className="font-semibold text-lg text-gray-900">
                <strong>Title: </strong>
                {note.title}
              </h2>
              <p className="text-gray-700">
                <strong>Content: </strong>
                {note.content}
              </p>
              <div className="flex items-center flex-wrap space-x-2">
                <h2 className="text-sm text-gray-900">Edit History:</h2>

                {note?.editHistory && note.editHistory.length > 0 ? (
                  note.editHistory.map((history, index) => (
                    <div
                      className="flex items-center space-x-2 my-2 border-l-2 pl-2 border-gray-200"
                      key={index}
                    >
                      <div className="relative inline-flex items-center justify-center w-6 h-6 overflow-hidden bg-gray-200 rounded-full">
                        <span className="text-xs text-gray-600">
                          {history.userName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs">{history.userName}</p>
                        <p className="text-xs italic">
                          {formatDate(history.editedAt)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <h2 className="text-xs text-gray-900">No available</h2>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(note)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(note._id)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
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
