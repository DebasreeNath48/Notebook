import { useState } from "react";
import NoteContext from "./noteContext";

const NoteState = (props) => {
    const host = "http://localhost:5000";
    const notesInitial = [];
    const [notes, setNotes] = useState(notesInitial);

    // Get all notes
    const getNotes = async () => {
        const token = localStorage.getItem("token");
        console.log("Token:", token);  // Log the token for debugging
        try {
            const response = await fetch(`${host}/api/notes/fetchallnotes`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": token
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Unauthorized");
                } else {
                    throw new Error(`Error: ${response.statusText}`);
                }
            }

            const json = await response.json();
            console.log(json);

            if (Array.isArray(json)) {
                setNotes(json);
            } else {
                console.error("Fetched data is not an array", json);
                setNotes([]);
            }
        } catch (error) {
            console.error("Failed to fetch notes", error);
            if (error.message === "Unauthorized") {
                // Redirect to login if unauthorized
                props.navigate("/login");
            } else {
                setNotes([]);
            }
        }
    };

    // Add a Note
    const addNote = async (title, description, tag) => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${host}/api/notes/addnote`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": token
                },
                body: JSON.stringify({ title, description, tag })
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const note = await response.json();
            setNotes(notes.concat(note));
        } catch (error) {
            console.error("Failed to add note", error);
        }
    };

    // Delete a Note
    const deleteNote = async (id) => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${host}/api/notes/deletenote/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": token
                }
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const json = await response.json();
            console.log(json);

            const newNotes = notes.filter((note) => note._id !== id);
            setNotes(newNotes);
        } catch (error) {
            console.error("Failed to delete note", error);
        }
    };

    // Edit a Note
    const editNote = async (id, title, description, tag) => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${host}/api/notes/updatenote/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": token
                },
                body: JSON.stringify({ title, description, tag })
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const json = await response.json();
            console.log(json);

            let newNotes = JSON.parse(JSON.stringify(notes));
            // Client side editing
            for (let index = 0; index < newNotes.length; index++) {
                const element = newNotes[index];
                if (element._id === id) {
                    newNotes[index].title = title;
                    newNotes[index].description = description;
                    newNotes[index].tag = tag;
                    break;
                }
            }
            setNotes(newNotes);
        } catch (error) {
            console.error("Failed to edit note", error);
        }
    };

    return (
        <NoteContext.Provider value={{ notes, addNote, deleteNote, editNote, getNotes }}>
            {props.children}
        </NoteContext.Provider>
    );
};

export default NoteState;
