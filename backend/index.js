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
  'https://inf124-frontend.vercel.app',
  'https://inf124-frontend-bzn7iaxwi-rafees-projects-9188c2be.vercel.app'
];

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
    },
});

app.use(helmet());
app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // if using cookies or auth headers
}));

app.options('*', cors());

app.use(express.json());
app.use(session({ // create cookies so user doesn't have to relog when refreshing page
    secret: process.env.COOKIE_SECRET,
    name: "sid",
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',  // Force secure in production
        httpOnly: true,
        sameSite: 'lax', // Required for cross-site cookies
        expires: 1000 * 60 * 60 * 24 * 7, // 7 days
        domain: process.env.NODE_ENV === 'production' ? 'inf124-backend-production.up.railway.app' : undefined, // Adjust this to match your Railway domain
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