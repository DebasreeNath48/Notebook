const express = require("express"); //import express
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require("../middleware/fetchuser");

const JWT_SECRET = "iamagoodgirl@yes";
//ROUTE 1:  Create a User using: POST "/api/auth/createuser". Doesnt require Auth -----> Endpoint
router.post("/createuser", [
    body('email', "enter a valid email").isEmail(),
    body('name', "enter a valid name").isLength({ min: 3 }),
    body('password', "Password must be atleast 5 characters").isLength({ min: 5 })
], async (req, res) => {
    let success =false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }
    //check whether the user with this email exists already
    try {
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ success, error: "sorry a user with email already exists" });
        }
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);

        user = await User.create({
            name: req.body.name,
            password: secPass,
            email: req.body.email
        });
        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authToken });
        // res.json(user)
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occurred!!");
    }
    // .then(user => res.json(user))
    // .catch(err => {console.log(err)
    //     res.json({error: "please enter a unique value", message: err.message})
    // });

    // res.send(req.body);
})

//Another endpoint
//ROUTE 2:  Authenticate a User using: POST "/api/auth/login". Doesnt require Auth -----> Endpoint
router.post("/login", [
    body('email', "enter a valid email").isEmail(),
    body('password', "password cannot be blank").exists(),
], async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            success = false;
            return res.status(400).json({ error: "please try to login with correct credentials" });
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            success = false;
            return res.status(400).json({ success, error: "please try to login with correct credentials" });
        }
        //payload
        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authToken });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("internal server error occurred!!");
    }
})

//ROUTE 3:  Get logged in User details using: POST "/api/auth/getuser". login required -----> Endpoint
router.post("/getuser",fetchuser,async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("internal server error occurred!!");
    }
})

module.exports = router