import express from 'express';
import { get_all_doctors, handlePractitioner} from './views.js';
import { uploadMiddleware,doctorFiles } from '../file.js'

const practitioner_router = express.Router();

practitioner_router.post('/practitioner',doctorFiles, handlePractitioner);
// to be removed later
practitioner_router.get('/practitioner',get_all_doctors);

export default practitioner_router;
