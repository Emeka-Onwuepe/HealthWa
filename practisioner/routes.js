import express from 'express';
import { get_all_doctors, handlePractitioner } from './views.js';

const practitioner_router = express.Router();

practitioner_router.post('/practitioner', handlePractitioner);
// to be removed later
practitioner_router.get('/practitioner',get_all_doctors);

export default practitioner_router;
