import express from 'express';
import multer from 'multer';
import { completeUpload, initUpload, uploadChunk } from '../controllers/upload.controller';

//multer configurations
const upload = multer();

const uploadRouter = express.Router();

// init uplaod
uploadRouter.post('/init', upload.none(), initUpload);

//chunk upload
uploadRouter.post('/chunk', upload.single('chunk'), uploadChunk);

//complete upload
uploadRouter.post('/complete', completeUpload);

export default uploadRouter;
