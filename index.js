import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import session from "express-session";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const saltRounds = parseInt(process.env.SALT_ROUNDS);


app.use(
  session({
    secret: process.env.SESSION_SECRET ,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
  })
);




const db = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

db.connect()
  .then(() => console.log("Connected to Render PostgreSQL"))
  .catch(err => console.error("DB Connection Error: ", err));


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");


//  HOME PAGE 
app.get("/", async (req, res) => {
  try {
    const result1 = await db.query(
      "SELECT * FROM works WHERE user_id = $1 ORDER BY id ASC",
      [req.session.userId]
    );

    const result2 = await db.query("SELECT * FROM users");

    res.render("index.ejs", {
      listTitle: "Today",
      taskItems: result1.rows,
      users: result2.rows,
      loggedInUser: req.session.username || null,
    });
  } catch (err) {
    console.log(err);
  }
});


//  ADD TASK 
app.post("/add", async (req, res) => {
  try {
    await db.query(
      "INSERT INTO works (title, user_id) VALUES ($1, $2)",
      [req.body.newTask, req.session.userId]
    );
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});


// REGISTER / LOGIN 
app.post("/user", async (req, res) => {
  const userName = req.body.username;
  const enteredPassword = req.body.password;

  try {
    const checkUser = await db.query("SELECT * FROM users WHERE name = $1", [
      userName,
    ]);

    // LOGIN 
    if (checkUser.rows.length > 0) {
      const user = checkUser.rows[0];

      bcrypt.compare(enteredPassword, user.password, (err, match) => {
        if (match) {
          req.session.userId = user.id;
          req.session.username = user.name;
          return res.redirect("/");
        } else {
          return res.send("Incorrect Password");
        }
      });
      return;
    }

    // REGISTER 
    bcrypt.hash(enteredPassword, saltRounds, async (err, hash) => {
      const result = await db.query(
        "INSERT INTO users (name, password) VALUES ($1, $2) RETURNING id",
        [userName, hash]
      );

      req.session.userId = result.rows[0].id;
      req.session.username = userName;

      res.redirect("/");
    });

  } catch (err) {
    console.log(err);
  }
});


// DELETE 
app.post("/delete", async (req, res) => {
  try {
    await db.query("DELETE FROM works WHERE id = $1 AND user_id = $2", [
      req.body.deleteItemId,
      req.session.userId
    ]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});


// EDIT 
app.post("/edit", async (req, res) => {
  try {
    await db.query(
      "UPDATE works SET title = $1 WHERE id = $2 AND user_id = $3",
      [req.body.updatedItemTitle, req.body.updatedItemId, req.session.userId]
    );
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});


// CONSTANT USER 
app.post("/constant", (req, res) => {
  req.session.userId = 1;
  req.session.username = "Guest";
  res.redirect("/");
});


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
