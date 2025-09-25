import express from 'express';
import { get_all_patients, handlePatient } from './views.js';

const patient_routes = express.Router();

patient_routes.post('/patient', handlePatient);
// get patients details to be removed later
patient_routes.get('/patient', get_all_patients);
export default patient_routes;
