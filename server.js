import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import user_router from './users/routes.js';
import patient_routes from './patient/routes.js';
import practitioner_router from './practisioner/routes.js'
import connection from './connection.js';
const port = process.env.PORT || 5000;
import cors from 'cors';
// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// add middleware for CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");  
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");  // allow access from localhost:3000
  res.header("Access-Control-Allow-Origin", "http://localhost:8081");  // allow access from localhost:8081
  next();
});

app.use(cors());
// add allowed hosts
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8081']
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }))


// const port = 5000;
// app.use(express.json());


// setup static folder
app.use(express.static(path.join(__dirname, 'statics')));


// Basic route
app.get('/', (req, res) => {
    res.send('HealthWa server is running!');
});

app.use('/api/user', user_router);
app.use('/api/patient', patient_routes);
app.use('/api/practitioner', practitioner_router);
  

// Start server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});