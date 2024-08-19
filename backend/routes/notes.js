const express = require("express"); //import express
const router = express.Router();
const Note = require("../models/Note");
const fetchuser = require("../middleware/fetchuser");
const { body, validationResult } = require('express-validator');


//ROUTE 1:  Get all the notes using: GET "/api/notes/login". Doesnt require Auth -----> Endpoint
router.get("/fetchallnotes", fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occurred!!");
    }
})

//ROUTE 2:  Add a new note using: POST "/api/notes/addnote". Login required -----> Endpoint
router.post("/addnote", fetchuser, [
    body('title', "enter a valid title").isLength({ min: 3 }),
    body('description', "Description must be atleast 5 characters").isLength({ min: 5 })
], async (req, res) => {
    try {
        const { title, description, tag } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const note = new Note({
            title, description, tag, user: req.user.id
        })
        const savedNotes = await note.save()
        res.json(savedNotes)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occurred!!");
    }
})

//ROUTE 3:  Updating an existing note using: PUT "/api/notes/updatenote". Login required -----> Endpoint
router.put("/updatenote/:id", fetchuser, async (req, res) => {
    const { title, description, tag } = req.body;
    try {
        //creating a newNote object
        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };

        //find the note to be updated and update it
        let note = await Note.findById(req.params.id);
        if (!note) {
            res.status(404).send("Not found!");
        }
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed!!");
        }
        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json({ note });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occurred!!");
    }

})


//ROUTE 4:  Delete an existing note using: DELETE "/api/notes/deletenote". Login required -----> Endpoint
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
    try {
        //find the note to be deleted and delete it
        let note = await Note.findById(req.params.id);
        if (!note) {
            res.status(404).send("Not found!");
        }
        //allow deletion only if user owns this note
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed!!");
        }
        note = await Note.findByIdAndDelete(req.params.id)
        res.json({ "Success": "Note has been deleted !!", note: note });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occurred!!");
    }

})
module.exports = router