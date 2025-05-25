const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');      
const commentRoutes = require('./routes/commentRoutes'); 
const uploadRoutes = require('./routes/uploadRoutes');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

dotenv.config();
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// MongoDB connection 
mongoose.connect(process.env.MONGO_URI, {

})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

app.use('/posts', postRoutes);
app.use('/comments', commentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/',(req,res)=>{
    return res.send("Quillspace server running successfully")

})

app.listen(PORT,()=>{
    console.log(`server is running at http://localhost:${PORT}`)
})

