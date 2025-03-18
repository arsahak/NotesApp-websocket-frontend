// "use client";

// import { useEffect, useState } from "react";
// import { io } from "socket.io-client";
// import {
//   createNote,
//   deleteNote,
//   getNotes,
//   updateNote,
// } from "../app/action/note";

// // Initialize socket connection
// const socket = io("http://localhost:8000", { autoConnect: false });

// export default function Note() {
//   const [notes, setNotes] = useState<
//     { _id: string; title: string; content: string }[]
//   >([]);
//   const [title, setTitle] = useState("");
//   const [content, setContent] = useState("");
//   const [editId, setEditId] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);

//   // Fetch Notes & Setup WebSocket
//   useEffect(() => {
//     async function fetchNotes() {
//       try {
//         setLoading(true);
//         const data = await getNotes();
//         setNotes(Array.isArray(data) ? data : []); // Ensure valid array
//       } catch (error) {
//         console.error("Error fetching notes:", error);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchNotes();
//     socket.connect();

//     // Listen for real-time updates
//     socket.on("noteUpdated", (updatedNote) => {
//       setNotes((prev) =>
//         prev.some((n) => n._id === updatedNote._id)
//           ? prev.map((n) => (n._id === updatedNote._id ? updatedNote : n))
//           : [...prev, updatedNote]
//       );
//     });

//     socket.on("noteDeleted", (deletedNote) => {
//       setNotes((prev) => prev.filter((n) => n._id !== deletedNote._id));
//     });

//     return () => {
//       socket.off("noteUpdated");
//       socket.off("noteDeleted");
//       socket.disconnect();
//     };
//   }, []);

//   // Create or Update Note
//   const handleSubmit = async () => {
//     if (!title.trim() || !content.trim()) return;

//     try {
//       setLoading(true);
//       if (editId) {
//         const updatedNote = await updateNote(editId, title, content);
//         setNotes((prev) =>
//           prev.map((n) => (n._id === editId ? updatedNote : n))
//         );
//         socket.emit("updateNote", updatedNote);
//       } else {
//         const newNote = await createNote(title, content);
//         setNotes((prev) => [...prev, newNote]);
//         socket.emit("createNote", newNote);
//       }

//       setTitle("");
//       setContent("");
//       setEditId(null);
//     } catch (error) {
//       console.error("Error saving note:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Edit Note
//   const handleEdit = (note: {
//     _id: string;
//     title: string;
//     content: string;
//   }) => {
//     setTitle(note.title);
//     setContent(note.content);
//     setEditId(note._id);
//   };

//   // Delete Note
//   const handleDelete = async (id: string) => {
//     try {
//       setNotes((prev) => prev.filter((n) => n._id !== id));
//       await deleteNote(id);
//       socket.emit("deleteNote", { _id: id });
//     } catch (error) {
//       console.error("Error deleting note:", error);
//     }
//   };

//   return (
//     <div className="max-w-2xl mx-auto mt-10">
//       <h1 className="text-2xl font-bold text-center mb-4">Notes</h1>

//       <div className="bg-gray-100 p-4 rounded-lg shadow-md">
//         <input
//           type="text"
//           placeholder="Title"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//           className="w-full p-2 mb-2 border rounded-md"
//         />
//         <textarea
//           placeholder="Content"
//           value={content}
//           onChange={(e) => setContent(e.target.value)}
//           className="w-full p-2 mb-2 border rounded-md"
//         />
//         <button
//           onClick={handleSubmit}
//           className={`w-full py-2 rounded-md transition ${
//             loading
//               ? "bg-gray-500 cursor-not-allowed"
//               : "bg-blue-500 hover:bg-blue-600 text-white"
//           }`}
//           disabled={loading}
//         >
//           {loading ? "Processing..." : editId ? "Update Note" : "Add Note"}
//         </button>
//       </div>

//       {loading && <p className="text-center mt-4">Loading notes...</p>}

//       <ul className="mt-6">
//         {notes.map((note) => (
//           <li
//             key={note._id}
//             className="flex justify-between items-center p-4 bg-white shadow-md rounded-md mb-2"
//           >
//             <div>
//               <h2 className="font-bold">{note.title}</h2>
//               <p>{note.content}</p>
//             </div>
//             <div className="flex gap-2">
//               <button
//                 onClick={() => handleEdit(note)}
//                 className="bg-green-500 text-white px-3 py-1 rounded-md"
//               >
//                 Edit
//               </button>
//               <button
//                 onClick={() => handleDelete(note._id)}
//                 className="bg-red-500 text-white px-3 py-1 rounded-md"
//               >
//                 Delete
//               </button>
//             </div>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

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
      setNotes((prev) => [...prev, newNote]); // Add new note to the list
    };

    const handleNoteUpdated = (updatedNote: any) => {
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
        // No need to manually update state, WebSocket will handle it
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
                {note.title}
              </h2>
              <p className="text-gray-700">{note.content}</p>
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
