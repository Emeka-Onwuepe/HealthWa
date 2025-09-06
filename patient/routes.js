import express from 'express';
import { handlePatient } from './views.js';

const patient_routes = express.Router();

patient_routes.post('/patient', handlePatient);
export default patient_routes;
