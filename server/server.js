
import 'dotenv/config'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import express from 'express';
import connectDB from './configs/db.js'
import userRouter from './routes/userRoute.js'
import sellerRouter from './routes/sellerRoute.js'
import connectCloudinary from './configs/cloudinary.js'
import productRouter from './routes/productRoute.js'
import cartRouter from './routes/cartRoute.js'
import addressRouter from './routes/addressRoute.js'
import orderRouter from './routes/orderRoute.js'
import { stripeWebhooks } from './controllers/orderController.js'


const app = express();
const port = process.env.PORT || 4000

await connectDB()
await connectCloudinary()
//allow multiple origins
const allowedOrigins = ['http://localhost:5173', 'https://sokoni-client.vercel.app']

app.post('/stripe', express.raw({type: 'application/json'}), stripeWebhooks)
///middleware configuration
app.use(cookieParser())
app.use(cors({origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,}))
app.use(express.json())  
app.get('/',(req, res)=> res.send('api is working'))

//routes
app.use('/api/user',userRouter)
app.use('/api/seller',sellerRouter)
app.use('/api/product',productRouter)
app.use('/api/cart',cartRouter)
app.use('/api/address',addressRouter)
app.use('/api/order',orderRouter)

app.listen(port, ()=>{
    console.log(`Server is running on http://localhost:${port}`)
})