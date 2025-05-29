const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const http = require("http");
const RED = require("node-red");

const app = express();
const server = http.createServer(app);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(session({
  secret: "secret-lina-123", // secret pour la session
  resave: false,
  saveUninitialized: true
}));

// Paramètres Node-RED
const settings = {
  httpAdminRoot: "/red",
  httpNodeRoot: "/api",
  userDir: "./.nodered",
  functionGlobalContext: {}
};

RED.init(server, settings);

// Middleware auth
function requireLogin(req, res, next) {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/");
  }
}

// Page login
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/login.html");
});

// Traitement login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "lina123") {
    req.session.loggedIn = true;
    res.redirect("/api/ui"); // red ou "/ui" si tu préfères aller directement au dashboard
  } else {
    res.send(`<p>Identifiants incorrects. <a href="/">Revenir</a></p>`);
  }
});

// Protège l’accès à Node-RED
app.use("/red", requireLogin, RED.httpAdmin);
app.use("/api", requireLogin, RED.httpNode);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Serveur sur http://localhost:${PORT}`);
});

RED.start();
