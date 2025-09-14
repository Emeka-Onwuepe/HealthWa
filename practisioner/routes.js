import express from 'express';
import { handlePractitioner } from './views.js';

const practitioner_router = express.Router();

practitioner_router.post('/practitioner', handlePractitioner);

export default practitioner_router;
