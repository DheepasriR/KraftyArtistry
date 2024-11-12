const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");
const bcrypt = require("bcrypt");

// ---------------------------------------------

const app = express();
const port = 3000;

// ---------------------------------------------

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// for saving sessions using encryption only when needed
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
  })
);

// for fetching files from public directory
app.use(express.static(path.join(__dirname, "public")));

// ---------------------------------------------

// for connecting the database to a local mysql databse
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "KraftyArtistry",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Database connected");
});

// ---------------------------------------------

// Routes

// gets register page
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "register.html"))
);

// for handling registration functionality
app.post("/register", async (req, res) => {
  const {
    firstname,
    lastname,
    birthday,
    gender,
    phone,
    residence,
    email,
    username,
    password,
  } = req.body;

  // Check if email already exists
  const checkEmailSql = "SELECT email FROM users WHERE email = ?";
  db.query(checkEmailSql, [email], async (err, results) => {
    if (err) {
      console.error("Error checking email:", err);
      return res.status(500).send("Server error");
    }

    if (results.length > 0) {
      return res.status(400).send("Email already exists");
    }

    // If email is unique, proceed to hash password and insert user
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `INSERT INTO users (firstname, lastname, birthday, gender,  phone, residence, email, username, password) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(
      sql,
      [
        firstname,
        lastname,
        birthday,
        gender,
        phone,
        residence,
        email,
        username,
        hashedPassword,
      ],
      (err, result) => {
        if (err) {
          console.error("Error inserting user data:", err);
          return res.status(500).send("Error registering user");
        }

        res.redirect("/login");
      }
    );
  });
});

// ---------------------------------------------

// gets login page
app.get("/login", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "login.html"))
);

// for handling login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // SQL Query to find the user by email
  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error("Error fetching user data:", err);
      return res.redirect("/login?error=Error logging in");
    }

    if (results.length === 0) {
      return res.redirect("/login?error=User not found...Try Again");
    }

    const user = results[0];

    // Check if the password matches
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.redirect("/login?error=Incorrect password...Try again");
    }

    // Saves user data in session
    req.session.user = {
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
    };

    res.redirect("/home");
  });
});

// ---------------------------------------------

// gets home page
app.get("/home", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  res.sendFile(path.join(__dirname, "views", "home.html"));
});

// ---------------------------------------------

// gets products page
app.get("/products", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "products.html"))
);

// ---------------------------------------------

// gets about us page
app.get("/aboutus", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "aboutus.html"))
);

// ---------------------------------------------

// Serves profile page
app.get("/profile", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login"); // Redirect to login if not logged in
  }
  res.sendFile(path.join(__dirname, "views", "profile.html"));
});

// API endpoint to fetch user data
app.get("/api/profile", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not logged in" });
  }

  const email = req.session.user.email;

  // SQL Query the database for the user's profile data
  const sql =
    "SELECT firstname, lastname, phone, residence, email, username FROM users WHERE email = ?";

  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error("Error fetching user data:", err);
      return res.status(500).json({ error: "Error fetching profile data" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Sends the user data as JSON to the client
    res.json(results[0]);
  });
});

// for updating the edited user profile data
app.post("/profile", (req, res) => {
  const { firstname, lastname, phone, residence, username } = req.body;

  const email = req.session.user.email;

  const sql = `UPDATE users SET firstname = ?, lastname = ?,  phone = ?, residence = ?, username = ? WHERE email = ?`;

  db.query(
    sql,
    [firstname, lastname, phone, residence, username, email],
    (err, result) => {
      if (err) {
        console.error("Error updating user data:", err);
        return res.status(500).send("Error updating profile");
      }

      req.session.user.firstname = firstname;
      req.session.user.lastname = lastname;
      req.session.user.username = username;

      res.redirect("/profile");
    }
  );
});

// ---------------------------------------------

// processes logout
// for destroying the user session and redirects to login/register page
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send("Failed to log out.");
    }
    res.redirect("/");
  });
});

// ---------------------------------------------

// for staring the server at post 3000
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
