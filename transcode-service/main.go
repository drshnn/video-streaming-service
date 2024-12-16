package main

import (
	"bytes"
	"context"
	"fmt"
	"log"
	"os"
	"os/exec"
	"path"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

var bucketName string = "sample-hls-stream-bucket"
var keyName string = "final/"

func main() {
	start := time.Now()
	var wg sync.WaitGroup
	res := []string{"1920x1080", "1280x720", "800x480", "640x360"}
	destPath := "./dest"
	videoPath := "./sample.mp4"
	wg.Add(4)
	for _, r := range res {
		go transcode(destPath, videoPath, r, &wg, &start)
	}
	wg.Wait()

	cfg, err := config.LoadDefaultConfig(context.TODO(),

		config.WithRegion("ap-south-1"),
	)
	if err != nil {
		log.Fatal("unable to load aws config", err)
	}

	destFolder := filepath.Join(".", "dest")

	files, err := os.ReadDir(destFolder)
	if err != nil {
		log.Println("Error reading directory:", err)
		return
	}

	var wg1 sync.WaitGroup

	// for _, file := range files {
	// 	wg1.Add(1)
	// 	log.Println(filepath.Join(destFolder, file.Name()))
	// 	go uploadFileTos3(&cfg, filepath.Join(destFolder, file.Name()), &wg1)
	// }
	maxP := runtime.NumCPU()
	semaphore := make(chan struct{}, maxP)

	for _, file := range files {
		wg1.Add(1)
		log.Println(filepath.Join(destFolder, file.Name()))

		go func(filename string) {
			defer wg1.Done()
			semaphore <- struct{}{}
			defer func() { <-semaphore }()

			uploadFileTos3(&cfg, filename)

		}(filepath.Join(destFolder, file.Name()))

	}
	wg1.Wait()

}

func transcode(destPath string, videoPath string, r string, wg *sync.WaitGroup, start *time.Time) {

	defer wg.Done()
	// for _, r := range res {
	//ffmpeg -i some_fun_video_name.mp4 -profile:v baseline -level 3.0 -s 640x360 -start_number 0 -hls_time 10 -hls_list_size 0 -f hls ./media/some_fun_video_name/hls/360_out.m3u8
	videoName := getFileNameWithoutExtension(path.Base(videoPath))
	dest := videoName + "_" + strings.Split(r, "x")[1] + ".m3u8"
	fmt.Println(videoName, r, destPath)

	// destPlaylistFilePath = path.Join(destPath, )

	cmd := exec.Command("ffmpeg", "-i", videoPath, "-profile:v", "baseline", "-level", "3.0", "-s", r, "-start_number", "0", "-hls_time", "10", "-hls_list_size", "0", "-f", "hls", filepath.Join(destPath, dest))
	fmt.Println("Running command:", cmd.String())
	cmdOutput, err := cmd.CombinedOutput()
	fmt.Println("time taken for res:", r, ", time:", time.Since(*start))
	if err != nil {
		log.Println("Error running command:", err)
		log.Println(string(cmdOutput))
		//should handle error ( retry )
	} else {
		fmt.Println("Command completed successfully.")
	}
}

func getFileNameWithoutExtension(fileName string) string {
	return strings.TrimSuffix(filepath.Base(fileName), filepath.Ext(fileName))
}

func deleteFile(filePath string) {

	err := os.Remove(filePath)

	if err != nil {
		log.Println("error deleting a file", err)
	}

	log.Println("file successfully deleted: ", filePath)

}

func uploadFileTos3(cfg *aws.Config, f string) {

	s3Config := s3.NewFromConfig(*cfg)

	// filepath := "./test/test.txt"

	file, err := os.Open(f)
	if err != nil {
		log.Fatal("failed to open file ", f, err)
	}
	defer deleteFile(f)
	defer file.Close()

	// Get file info to determine content length
	fileInfo, err := file.Stat()
	if err != nil {
		log.Fatal("failed to get file info: %w", err)
	}

	fileContent := make([]byte, fileInfo.Size())
	_, err = file.Read(fileContent)
	if err != nil {
		log.Fatal("failed to read file: %w", err)
	}
	k := keyName + filepath.Base(f)

	// Upload the file to S3
	_, err = s3Config.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:        &bucketName,
		Key:           &k,
		Body:          bytes.NewReader(fileContent),
		ContentLength: aws.Int64(fileInfo.Size()),
		ContentType:   aws.String("application/octet-stream"),
	})

	if err != nil {
		log.Fatal("failed to upload file to S3: %w", err)
	}
	log.Printf("Successfully uploaded %s to bucket %s\n", k, bucketName)
}
