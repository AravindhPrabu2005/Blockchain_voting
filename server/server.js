const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = 7000;
app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const userSchema = new mongoose.Schema({ email: String, password: String });
const User = mongoose.model("User", userSchema);

const adminSchema = new mongoose.Schema({ name: String, email: String, password: String });
const Admin = mongoose.model("Admin", adminSchema);

const pollSchema = new mongoose.Schema({
  title: String,
  description: String,
  startDate: Date,
  endDate: Date,
  choices: [String],
});
const Poll = mongoose.model("Poll", pollSchema);

const voteSchema = new mongoose.Schema({
  pollId: mongoose.Schema.Types.ObjectId,
  choice: String,
  blockHash: String,
  previousHash: String,
  timestamp: String,
});
const Vote = mongoose.model("Vote", voteSchema);

let blockchain = [];

function createBlock(choice, previousHash = "") {
  const timestamp = new Date().toISOString();
  const data = choice + timestamp + previousHash;
  const blockHash = require("crypto").createHash("sha256").update(data).digest("hex");
  return { choice, timestamp, previousHash, blockHash };
}

app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ error: "User already exists" });
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashedPassword });
  await user.save();
  res.status(201).json({ message: "User registered" });
});

app.post("/admin/register", async (req, res) => {
  const { name, email, password } = req.body;
  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) return res.status(400).json({ error: "Admin already exists" });
  const hashedPassword = await bcrypt.hash(password, 10);
  const admin = new Admin({ name, email, password: hashedPassword });
  await admin.save();
  res.json({ message: "Admin registered successfully" });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  let user = await User.findOne({ email });
  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ id: user._id, email: user.email, isAdmin: false }, process.env.JWT_SECRET, { expiresIn: "1h" });
    console.log("User Token:", token);
    return res.json({ success: true, token, user: { isAdmin: false, isLoggedIn: true, email: user.email } });
  }
  let admin = await Admin.findOne({ email });
  if (admin && await bcrypt.compare(password, admin.password)) {
    const token = jwt.sign({ id: admin._id, email: admin.email, isAdmin: true }, process.env.JWT_SECRET, { expiresIn: "1h" });
    console.log("Admin Token:", token);
    return res.json({ success: true, token, user: { isAdmin: true, isLoggedIn: true, email: admin.email } });
  }
  return res.status(401).json({ success: false, error: "Invalid credentials" });
});


app.post("/api/create-poll", async (req, res) => {
  try {
    const { title, description, startDate, endDate, choices } = req.body;
    if (!title || !description || !startDate || !endDate || !Array.isArray(choices) || choices.filter((c) => c.trim() !== "").length === 0) {
      return res.status(400).json({ error: "All fields are required and choices must not be empty" });
    }
    const newPoll = new Poll({
      title,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      choices: choices.filter((c) => c.trim() !== ""),
    });
    await newPoll.save();
    res.status(201).json({ message: "Poll created successfully", poll: newPoll });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

app.get("/api/get-polls", async (req, res) => {
  const polls = await Poll.find();
  res.json(polls);
});

app.post("/api/vote", async (req, res) => {
  const { pollId, choice } = req.body;
  const lastBlock = blockchain[blockchain.length - 1];
  const previousHash = lastBlock ? lastBlock.blockHash : "0";
  const newBlock = createBlock(choice, previousHash);
  blockchain.push(newBlock);
  const newVote = new Vote({ pollId, choice, blockHash: newBlock.blockHash, previousHash, timestamp: newBlock.timestamp });
  await newVote.save();
  res.json({ message: "Vote recorded", vote: newVote });
});

app.get("/api/vote-count/:pollId", async (req, res) => {
  const { pollId } = req.params;
  const votes = await Vote.find({ pollId });
  const result = {};
  votes.forEach(v => {
    result[v.choice] = (result[v.choice] || 0) + 1;
  });
  res.json(result);
});

app.get("/protected", (req, res) => {
  res.json({ message: "Protected data (no auth now)" });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
