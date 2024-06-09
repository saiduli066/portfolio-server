const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 5000;

// Middleware

// app.use(cors());
app.use(
  cors({
    origin: "https://portfolio-server-seven-alpha.vercel.app",
  })
);
app.use(express.json());

// MongoDB Connection URL
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log("Connected to MongoDB");

    // const collection = db.collection("users");

    const portfolioDB = client.db("my-portfolio");
    const skillsCollection = portfolioDB.collection("skills");
    const projectsCollection = portfolioDB.collection("projects");
    const blogsCollection = portfolioDB.collection("blogs");

    // User Registration
    // app.post("/api/v1/register", async (req, res) => {
    //   const { name, email, password } = req.body;

    //   // Check if email already exists
    //   const existingUser = await collection.findOne({ email });
    //   if (existingUser) {
    //     return res.status(400).json({
    //       success: false,
    //       message: "User already exists",
    //     });
    //   }

    // Hash the password
    //   const hashedPassword = await bcrypt.hash(password, 10);

    //   // Insert user into the database
    //   await collection.insertOne({ name, email, password: hashedPassword });

    //   res.status(201).json({
    //     success: true,
    //     message: "User registered successfully",
    //   });
    // });

    // User Login
    app.post("/api/v1/login", async (req, res) => {
      const { email, password } = req.body;

      // Find user by email
      const user = await collection.findOne({ email }); //find from  local storage
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Compare hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate JWT token
      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
        expiresIn: process.env.EXPIRES_IN,
      });

      res.json({
        success: true,
        message: "Login successful",
        token,
      });
    });

    // ==============================================================

    //skills

    //post
    app.post("/skills", async (req, res) => {
      const { name, icon_url } = req.body;
      try {
        const result = await skillsCollection.insertOne({ name, icon_url });
        res.json({
          success: true,
          message: "Skill added successfully",
        });
      } catch (error) {
        console.error("Error adding skill:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    // Get skills
    app.get("/skills", async (req, res) => {
      try {
        const skills = await skillsCollection.find({}).toArray();
        res.json(skills);
      } catch (error) {
        console.error("Error fetching skills:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });
    //update skill
    app.patch("/skills/:id", async (req, res) => {
      const { id } = req.params;
      const { name, icon_url } = req.body;
      try {
        const result = await skillsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { name, icon_url } }
        );
        if (result.matchedCount === 0) {
          return res.status(404).json({ message: "Skill not found" });
        }
        res.json({
          success: true,
          message: "Skill updated successfully",
        });
      } catch (error) {
        console.error("Error updating skill:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    // Delete skill
    app.delete("/skills/:id", async (req, res) => {
      const { id } = req.params;
      try {
        const result = await skillsCollection.deleteOne({
          _id: new ObjectId(id),
        });
        if (result.deletedCount === 0) {
          return res.status(404).json({ message: "Skill not found" });
        }
        res.json({
          success: true,
          message: "Skill deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting skill:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    //
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } finally {
  }
}

run().catch(console.dir);

// Test route
app.get("/", (req, res) => {
  const serverStatus = {
    message: "Server is running smoothly",
    timestamp: new Date(),
  };
  res.json(serverStatus);
});
