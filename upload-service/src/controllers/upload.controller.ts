import { NextFunction, Request, Response } from "express";
import {
    CreateMultipartUploadCommand,
    UploadPartCommand,
    CompleteMultipartUploadCommand,
    AbortMultipartUploadCommand,
    S3Client,
    ListPartsCommand,
} from "@aws-sdk/client-s3";
import { getAwsClient } from "../utils/awsClient";
import { InternalServerError } from "../errors/app.error";

export const initUpload = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log('Initialising Upload');
        const { fileName } = req.body;
        console.log(req.body);
        const bucketName = process.env.AWS_BUCKET_NAME;
        console.log(bucketName);

        const s3Client = getAwsClient();
        const createParams = {
            Bucket: bucketName,
            Key: fileName,
            ContentType: 'video/mp4'
        };

        const multipartParams = await s3Client.send(
            new CreateMultipartUploadCommand(createParams)
        )
        console.log("multipartparams---- ", multipartParams);
        const uploadId = multipartParams.UploadId;

        res.status(200).json({ uploadId });
    } catch (err) {
        console.error('Error initializing upload:', err);
        next(err);
    }
}

// Upload chunk
export const uploadChunk = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log('Uploading Chunk');
        const { fileName, chunkIndex, uploadId } = req.body;
        const bucketName = process.env.AWS_BUCKET_NAME;
        const s3Client = getAwsClient();

        const partParams = {
            Bucket: bucketName,
            Key: fileName,
            UploadId: uploadId,
            PartNumber: parseInt(chunkIndex) + 1,
            Body: req.file?.buffer,
        };

        const data = await s3Client.send(
            new UploadPartCommand(partParams)
        )
        console.log("data------- ", data);
        res.status(200).json({ success: true });
    } catch (err) {
        console.error('Error uploading chunk:', err);
        next(err);
    }
};

export const completeUpload = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log('Completing Upload');
        const { fileName, totalChunks, uploadId, title, description, author } = req.body;
        console.log(title, description, author);

        const uploadedParts = [];

        // Build uploadedParts array from request body
        for (let i = 0; i < totalChunks; i++) {
            uploadedParts.push({ PartNumber: i + 1, ETag: req.body[`part${i + 1}`] });
        }

        const s3Client = getAwsClient();
        const bucketName = process.env.AWS_BUCKET_NAME;

        const completeParams = {
            Bucket: bucketName,
            Key: fileName,
            UploadId: uploadId,
        };

        // Listing parts using promise
        const data = await s3Client.send(
            new ListPartsCommand(completeParams)
        );

        if (!data.Parts) {
            throw new InternalServerError("Internal Server Error");
        }

        const parts = data.Parts.map(part => ({
            ETag: part.ETag,
            PartNumber: part.PartNumber
        }));

        const completeRequest = {
            ...completeParams,
            MultipartUpload: {
                Parts: parts
            }
        }

        // Completing multipart upload using promise
        const uploadResult = await s3Client.send(
            new CompleteMultipartUploadCommand(completeRequest)
        );

        console.log("data----- ", uploadResult);

        return res.status(200).json({ message: "Uploaded successfully!!!" });
    } catch (err) {
        console.error(err);
        next(err);
    }
}
