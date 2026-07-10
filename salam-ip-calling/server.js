const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const fs = require("fs");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.json());
app.use(express.static("public"));

const USERS_FILE = path.join(__dirname, "users.json");

function loadUsers() {
    try {
        if (!fs.existsSync(USERS_FILE)) {
            fs.writeFileSync(USERS_FILE, "{}");
        }

        return JSON.parse(
            fs.readFileSync(
                USERS_FILE,
                "utf8"
            )
        );

    } catch {

        return {};

    }
}

function saveUsers(users) {

    fs.writeFileSync(

        USERS_FILE,

        JSON.stringify(

            users,

            null,

            2

        )

    );

}

let users = loadUsers();

const ADMIN = {

    username: "salam",

    password: "864"

};

app.post("/api/login", (req, res) => {

    const {

        username,

        password

    } = req.body;

    if (

        username === ADMIN.username &&

        password === ADMIN.password

    ) {

        return res.json({

            success: true,

            role: "admin",

            users

        });

    }

    if (

        users[username] &&

        users[username].password === password

    ) {

        return res.json({

            success: true,

            role: "user",

            user: users[username]

        });

    }

    res.json({

        success: false,

        message: "Invalid Username Or Password"

    });

});
