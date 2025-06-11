const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { Server } = require("socket.io");
const express = require("express")
const helmet = require("helmet");
const cors = require("cors");
const authRouter = require("./routers/authRouter");
const session = require("express-session");
const stockOwnershipRouter = require("./routers/stockOwnership.js");
const portfolioRouter = require("./routers/portfolioRouter.js");
const budgetRouter = require("./routers/budgetRouter.js")
const app = express();
const server = require("http").createServer(app);

// get info from React Front end on port 3000 or vercel website
const allowedOrigins = [
  'http://localhost:3000',
  'https://inf124-rdwtnswjf-rafees-projects-9188c2be.vercel.app', 
  'https://inf124.vercel.app', 
  'https://inf124-frontend.vercel.app/'
];

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
    },
});

app.use(helmet());
app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
        // methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        // allowedHeaders: ['Content-Type', 'Authorization'],
        // exposedHeaders: ['set-cookie']
    })
);

app.use(express.json());
app.use(session({ // create cookies so user doesn't have to relog when refreshing page
    secret: process.env.COOKIE_SECRET,
    credentials: true,
    name: "sid",
    saveUninitialized: false,
    cookie: {
        secure: true,  // Force secure in production
        httpOnly: true,
        sameSite: 'lax', // Required for cross-site cookies
        expires: 1000 * 60 * 60 * 24 * 7, // 7 days
        domain: 'https://inf124-backend-production.up.railway.app/' // Adjust this to match your Railway domain
    },
})
);

app.use("/auth", authRouter);
app.use("/api/stocks", stockOwnershipRouter);
app.use("/api/portfolio", portfolioRouter); 
app.use("/api/budget", budgetRouter);


io.on("connect", socket => {
    console.log("Socket connected");
});

// EXPRESS SERVER
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// health check
app.get("/health", (req, res) => {
  res.status(200).send("Server is healthy");
});

module.exports = app