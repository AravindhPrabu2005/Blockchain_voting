const express = require("express")
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const cors = require("cors")
require("dotenv").config()

const app = express()
const port = 5000
app.use(express.json())
app.use(cors())

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => console.log("MongoDB connected")).catch((err) => console.log(err))

const userSchema = new mongoose.Schema({ email: String, password: String })
const User = mongoose.model("User", userSchema)

const adminSchema = new mongoose.Schema({ name: String, email: String, password: String })
const Admin = mongoose.model("Admin", adminSchema)

const pollSchema = new mongoose.Schema({
  title: String,
  description: String,
  startDate: String,
  endDate: String,
  choices: [String]
})
const Poll = mongoose.model("Poll", pollSchema)

const voteSchema = new mongoose.Schema({
  pollId: mongoose.Schema.Types.ObjectId,
  choice: String,
  blockHash: String,
  previousHash: String,
  timestamp: String
})
const Vote = mongoose.model("Vote", voteSchema)

let blockchain = []

function createBlock(choice, previousHash = "") {
  const timestamp = new Date().toISOString()
  const data = choice + timestamp + previousHash
  const blockHash = require("crypto").createHash("sha256").update(data).digest("hex")
  return { choice, timestamp, previousHash, blockHash }
}

const generateToken = (user) => jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" })

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]
  if (!token) return res.status(401).json({ error: "Access denied" })
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(400).json({ error: "Invalid token" })
  }
}

app.post("/register", async (req, res) => {
  const { email, password } = req.body
  const hashedPassword = await bcrypt.hash(password, 10)
  const user = new User({ email, password: hashedPassword })
  await user.save()
  res.json({ message: "User registered" })
})

app.post("/admin/register", async (req, res) => {
  const { name, email, password } = req.body
  const existingAdmin = await Admin.findOne({ email })
  if (existingAdmin) return res.status(400).json({ error: "Admin already exists" })
  const hashedPassword = await bcrypt.hash(password, 10)
  const admin = new Admin({ name, email, password: hashedPassword })
  await admin.save()
  res.json({ message: "Admin registered successfully" })
})

app.post("/login", async (req, res) => {
  const { email, password } = req.body
  let user = await User.findOne({ email })
  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ id: user._id, email: user.email, isAdmin: false }, process.env.JWT_SECRET, { expiresIn: "1h" })
    return res.json({ success: true, token, user: { isAdmin: false, isLoggedIn: true, email: user.email } })
  }
  let admin = await Admin.findOne({ email })
  if (admin && await bcrypt.compare(password, admin.password)) {
    const token = jwt.sign({ id: admin._id, email: admin.email, isAdmin: true }, process.env.JWT_SECRET, { expiresIn: "1h" })
    return res.json({ success: true, token, user: { isAdmin: true, isLoggedIn: true, email: admin.email } })
  }
  return res.status(401).json({ success: false, error: "Invalid credentials" })
})

app.post("/api/create-poll", authMiddleware, async (req, res) => {
  const { title, description, startDate, endDate, choices } = req.body
  const newPoll = new Poll({ title, description, startDate, endDate, choices })
  await newPoll.save()
  res.json({ message: "Poll created", poll: newPoll })
})

app.get("/api/get-polls", async (req, res) => {
  const polls = await Poll.find()
  res.json(polls)
})

app.post("/api/vote", authMiddleware, async (req, res) => {
  const { pollId, choice } = req.body
  const lastBlock = blockchain[blockchain.length - 1]
  const previousHash = lastBlock ? lastBlock.blockHash : "0"
  const newBlock = createBlock(choice, previousHash)
  blockchain.push(newBlock)
  const newVote = new Vote({ pollId, choice, blockHash: newBlock.blockHash, previousHash, timestamp: newBlock.timestamp })
  await newVote.save()
  res.json({ message: "Vote recorded", vote: newVote })
})

app.get("/api/vote-count/:pollId", async (req, res) => {
  const { pollId } = req.params
  const votes = await Vote.find({ pollId })
  const result = {}
  votes.forEach(v => {
    result[v.choice] = (result[v.choice] || 0) + 1
  })
  res.json(result)
})

app.get("/protected", authMiddleware, (req, res) => {
  res.json({ message: "Protected data", user: req.user })
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})

