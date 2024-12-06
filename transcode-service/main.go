package main

import (
	"fmt"
	"log"
	"os/exec"
	"path"
	"path/filepath"
	"strings"
	"sync"
	"time"
)

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
}

func transcode(destPath string, videoPath string, r string, wg *sync.WaitGroup, start *time.Time) {

	defer wg.Done()
	// for _, r := range res {
	//ffmpeg -i some_fun_video_name.mp4 -profile:v baseline -level 3.0 -s 640x360 -start_number 0 -hls_time 10 -hls_list_size 0 -f hls ./media/some_fun_video_name/hls/360_out.m3u8
	videoName := getFileNameWithoutExtension(path.Base(videoPath))
	dest := videoName + "_" + strings.Split(r, "x")[1] + ".m3u8"
	fmt.Println(videoName, r, destPath)

	// destPlaylistFilePath = path.Join(destPath, )

	cmd := exec.Command("ffmpeg", "-i", "D:\\Darshan\\transcoding\\golang\\sample.mp4", "-profile:v", "baseline", "-level", "3.0", "-s", r, "-start_number", "0", "-hls_time", "10", "-hls_list_size", "0", "-f", "hls", "D:\\Darshan\\transcoding\\golang\\dest\\"+dest)
	fmt.Println("Running command:", cmd.String())
	cmdOutput, err := cmd.CombinedOutput()
	fmt.Println("time taken for res:", r, ", time:", time.Since(*start))
	if err != nil {
		log.Println("Error running command:", err)
		log.Println(string(cmdOutput))
		// handle error here, e.g., write to a log file or send an email alert
	} else {
		fmt.Println("Command completed successfully.")
		// fmt.Println("Output:", string(cmdOutput))
		// handle output here, e.g., save to a log file or send an email notification
		// fmt.Println("Created playlist:", destPlaylistFilePath)
		// return destPlaylistFilePath
	}
	// fmt.Println(command)
	// }

}

func getFileNameWithoutExtension(fileName string) string {
	return strings.TrimSuffix(filepath.Base(fileName), filepath.Ext(fileName))
}
