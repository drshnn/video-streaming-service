import axios, { AxiosResponse } from "axios";
import { useState } from "react"

export default function UploadPage() {
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [video, setVideo] = useState<File | null>(null);
    const [username, setUsername] = useState<string>('');

    /**
     * uploads a video by dividing it into chunks
     * taken from the keerti purswani's code
     */
    const uploadHandler = async () => {
        if (!video || username === '' || title === '') return;
        console.log("uploading video...");
        try {
            // Initiate upload process by sending the file name to the server.
            const initFormData = new FormData();
            initFormData.append('fileName', video.name);
            const initRes = await axios.post<string>('http://localhost:3000/upload/init', initFormData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            })
            const uploadId = initRes.data;
            console.log('upload id: ', uploadId);

            //start uploading once the uploadId is received
            const chunkSize = 1024 * 1024 * 2 //2 mb chunks
            const totalChunkSize = Math.ceil(video.size / chunkSize);

            let start = 0;
            const uploadPromises: Promise<AxiosResponse<string, any>>[] = [];
            for (let i = 0; i < totalChunkSize; i++) {
                const chunk = video.slice(start, start + chunkSize);
                start += chunkSize;
                const chunkFormData = new FormData();
                chunkFormData.append('fileName', video.name);
                chunkFormData.append('chunk', chunk);
                chunkFormData.append('totalChunks', totalChunkSize.toString());
                chunkFormData.append('chunkIndex', i.toString());
                chunkFormData.append('uploadId', uploadId);
                const uploadPromise = axios.post<string>('http://localhost:3000/upload/chunk', chunkFormData, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                })
                uploadPromises.push(uploadPromise);
            }
            await Promise.all(uploadPromises);

            // finalize the upload
            const completeRes = await axios.post<string>('http://localhost:3000/upload/complete', {
                fileName: video.name,
                totalChunks: totalChunkSize,
                uploadId: uploadId,
                title: title,
                description: description,
                author: username
            })
            console.log(completeRes.data);
        } catch (error) {
            console.error(error);
        }
    }

    return (

        <div className="bg-red-100 w-full h-full ">
            <form encType="multipart/form-data" className="flex flex-col items-center gap-1">
                <input type="text" name="username" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                <input type="text" name="title" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <textarea name="description" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
                <input type="file" name="video" onChange={(e) => setVideo(e.target.files?.[0] ?? null)} />
                {video &&
                    <div>
                        <p>size:{(video.size / 1024).toFixed(2)} KB</p>
                    </div>
                }
                <button type="button" onClick={uploadHandler} disabled={!video || title === '' || username === ''} className="disabled:bg-gray-200 bg-black disabled:text-black text-white">Upload</button>
            </form>
        </div>

    )
}
