const express = require('express')
require('dotenv').config();
const cookieParser = require('cookie-parser')
const cors = require('cors');
const MongoDBConnect = require('./config/MongoConnection');
const UserRouter = require('./Routes & Controller/UserRouterController');
const PanditRouter = require('./Routes & Controller/PanditRouterController');
const AuthRouter = require('./Routes & Controller/AuthRouterController');
const AdminRouter = require('./Routes & Controller/AdminRouterController');
const RitualRouter = require('./Routes & Controller/RitualsRouterController');
const BookingRouter = require('./Routes & Controller/BookingRouterController');
const FeedbackRouter = require('./Routes & Controller/FeedbackRouterController');
const DisputeRouter = require('./Routes & Controller/DisputeRouterController');

// create server app
const app = express();

/*=================== MIDDLEWARE ======================================*/
const corsExtra = {
    origin: process.env.CLIENT_URL,
    methods: 'GET, POST, PUT, DELETE, PATCH, HEAD',
    credentials: true
}
app.use(cors(corsExtra))
app.use(express.json({ limit: "10MB" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser())

/*================ ROUTES ============================== */
app.get("/", (req, res) => {
    res.status(200).json({ message: "PujaConnect app is run successfully" })
})

app.use('/user', UserRouter)
app.use('/pandit', PanditRouter)
app.use('/auth', AuthRouter)
app.use('/admin', AdminRouter)
app.use('/ritual', RitualRouter)
app.use('/booking', BookingRouter)
app.use('/feedback', FeedbackRouter)
app.use('/dispute', DisputeRouter)


/*============== Server Listening and Error Handling===================================== */
app.use((err, req, res, next) => {
    res.status(500).json({ error: "Server is not responding..." })
})

const port = process.env.SERVER_PORT || 5000;
MongoDBConnect().then(() => {
    app.listen(port, () => {
        console.log(`PujaConnect server running on port ${port}`)
    })
})