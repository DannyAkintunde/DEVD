const { tmpdir } = require("os");
const { exec } = require("child_process");
const { promisify } = require('util');
const crypto = require("crypto");
const sharp = require('sharp');
const path = require("path");
const fs = require("fs");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);

const execPromise = promisify(exec);

function getVideoDuration(videoPath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(videoPath)) return reject(new ReferenceError(`${videoPath} does not exist.`))
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        return reject(err);
      }
      const duration = metadata.format.duration;
      resolve(duration)
    });
  });
}

function toAudio(buffer, ext) {
    return ffmpeg(
        buffer,
        ["-vn", "-ac", "2", "-b:a", "128k", "-ar", "44100", "-f", "mp3"],
        ext,
        "mp3"
    );
}

function toPTT(buffer, ext) {
    return ffmpeg(
        buffer,
        [
            "-vn",
            "-c:a",
            "libopus",
            "-b:a",
            "128k",
            "-vbr",
            "on",
            "-compression_level",
            "10"
        ],
        ext,
        "opus"
    );
}

function toVideo(buffer, ext) {
    return ffmpeg(
        buffer,
        [
            "-c:v",
            "libx264",
            "-c:a",
            "aac",
            "-ab",
            "128k",
            "-ar",
            "44100",
            "-crf",
            "32",
            "-preset",
            "slow"
        ],
        ext,
        "mp4"
    );
}

async function videoToWebp(media, time,format='mp4') {
    const tmpFileOut = path.join(
        tmpdir(),
        `${crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`
    );
    const tmpFileIn = path.join(
        tmpdir(),
        `${crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.${format}`
    );

    fs.writeFileSync(tmpFileIn, media);

    await new Promise((resolve, reject) => {
        ffmpeg(tmpFileIn)
            .on("error", reject)
            .on("end", () => resolve(true))
            .addOutputOptions([
                "-vcodec",
                "libwebp",
                "-vf",
                "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse",
                "-loop",
                "0",
                "-ss",
                "00:00:00",
                "-t",
                time,
                "-preset",
                "default",
                "-an",
                "-vsync",
                "0"
            ])
            .toFormat("webp")
            .save(tmpFileOut);
    });

    const buff = fs.readFileSync(tmpFileOut);
    fs.unlinkSync(tmpFileOut);
    fs.unlinkSync(tmpFileIn);
    return buff;
}

async function addColoredBgToGif(gifBuffer, color, time, padding, size, mode="buff", outputFomart="gif") {
    const tmpFileIn = path.join(tmpdir(), `${crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.gif`);
    
    fs.writeFileSync(tmpFileIn, gifBuffer);
    
    const tmpFileOut = path.join(tmpdir(), `${crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.${outputFomart}`);
    
    let command = `
        read width height < <(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of default=noprint_wrappers=1:nokey=1 ${tmpFileIn});
        ffmpeg -stream_loop -1 -i ${tmpFileIn} -f lavfi -i color=${color}:s=$((width + ${padding*2}))X$((width + ${padding*2})) -filter_complex "[0:v]scale='if(gt(iw,ih),iw,-1)':'if(gt(iw,ih),-1,ih)'[gif];[1:v]scale='min(iw,ih)':'min(iw,ih)'[bg];[bg][gif]overlay=(W-w)/2:(H-h)/2" -loop 0 -t ${time} -shortest ${tmpFileOut}
    `;
    
    if (size) {
      width = size[0]
      height = size[-1]
      max_gif_width=width - (2 * padding)
      max_gif_height=height - (2 * padding)
      command = `
      ffmpeg -f lavfi -i color=${color}:s=${width}x${height} -stream_loop -1 -i ${tmpFileIn} -filter_complex "[1:v]scale='min(${max_gif_width},iw)':'min(${max_gif_height},ih)'[gif];[0:v][gif]overlay=((W-w)/2):((H-h)/2)" -loop 0 -t ${time} ${tmpFileOut}`
    }
    
    try {
        await execPromise(command);
        
        switch (mode) {
            case "buff":
                const buff = fs.readFileSync(tmpFileOut);
                fs.unlinkSync(tmpFileOut);
                return buff;
            case "file":
                return tmpFileOut;
            default:
                throw new Error("Invalid mode specified");
        }
    } catch (err) {
        throw new Error(err);
    } finally {
        // Clean up the input file
        fs.unlinkSync(tmpFileIn);
    }
}

async function addImageBgToGif(gifBuffer, imageBuffer, time, padding, size, imgext="jpg", mode="buff", outputFomart="gif") {
  const tmpFileIn = path.join(tmpdir(), `${crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.gif`);
    
  fs.writeFileSync(tmpFileIn, gifBuffer);
  
  const tmpImage = path.join(tmpdir(), `${crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.${imgext}`);
  
  fs.writeFileSync(tmpImage, imageBuffer)
  
  const tmpFileOut = path.join(tmpdir(), `${crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.${outputFomart}`);
  
  let command = `
      # Get background dimensions using ffprobe
      bg_dimensions=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=x ${tmpImage})
      bg_width=$(echo $bg_dimensions | cut -d'x' -f1)
      bg_height=$(echo $bg_dimensions | cut -d'x' -f2)
      
      # Now run ffmpeg using those dimensions
      ffmpeg -i ${imageBuffer} -stream_loop -1 -i ${tmpFileIn} -filter_complex "[1:v]scale='min($bg_width-${padding*2},iw)':'min($bg_height-${padding*2},ih)'[scaled];[0:v][scaled]overlay=x=($bg_width-overlay_w)/2:y=($bg_height-overlay_h)/2" -loop 0 -t ${time} ${tmpFileOut}
  `;
  
  if (size) {
    width = size[0];
    height = size[-1]
    command = `
      # Get background dimensions using ffprobe
      bg_dimensions=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=x ${tmpImage})
      bg_width=$(echo $bg_dimensions | cut -d'x' -f1)
      bg_height=$(echo $bg_dimensions | cut -d'x' -f2)
      
      ffmpeg -i ${tmpImage} -stream_loop -1 -i ${tmpFileIn} -filter_complex "[1:v]scale='if(gt(iw,$bg_width-${padding*2}),$bg_width-${padding*2},iw)':'if(gt(ih,$bg_height-${padding*2}),$bg_height-${padding*2},ih)'[scaled];[0:v][scaled]overlay=x=($bg_width-overlay_w)/2:y=($bg_height-overlay_h)/2,scale='if(gt(a,${width}/${height}),${width},-2)':'if(gt(a,${width}/${height}),-2,${height})'" -loop 0 -t ${time} ${tmpFileOut}
    `;
  }
  
  try {
      await execPromise(command);
      
      switch (mode) {
          case "buff":
              const buff = fs.readFileSync(tmpFileOut);
              fs.unlinkSync(tmpFileOut);
              return buff;
          case "file":
              return tmpFileOut;
          default:
              throw new Error("Invalid mode specified");
      }
  } catch (err) {
      throw new Error(err);
  } finally {
      // Clean up the input file
      fs.unlinkSync(tmpFileIn);
  }
}

async function addVideoBgToGif(gifBuffer, videoBuffer, time, padding, size, videoext="mp4", mode="buff", outputFomart="gif") {
  const tmpFileIn = path.join(tmpdir(), `${crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.gif`);
    
  fs.writeFileSync(tmpFileIn, gifBuffer);
  
  const tmpVideo = path.join(tmpdir(), `${crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.${videoext}`);
  
  fs.writeFileSync(tmpVideo, videoBuffer)
  
  const tmpFileOut = path.join(tmpdir(), `${crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.${outputFomart}`);
  
  let command = `
      # Get video dimensions using ffprobe
      bg_dimensions=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=x ${tmpVideo})
      bg_width=$(echo $bg_dimensions | cut -d'x' -f1)
      bg_height=$(echo $bg_dimensions | cut -d'x' -f2)
      
      # Now run ffmpeg using those dimensions
      ffmpeg -i ${tmpVideo} -stream_loop -1 -i ${tmpFileIn} -filter_complex "[1:v]scale='min($bg_width-${padding*2},iw)':'min($bg_height-${padding*2},ih)'[scaled];[0:v][scaled]overlay=x=($bg_width-overlay_w)/2:y=($bg_height-overlay_h)/2:shortest=1" ${time ? '-loop 0 -t ' + time : ''} ${tmpFileOut}
  `;
  
  
  if (size) {
    width = size[0];
    height = size[-1]
    command = `
        # Get video dimensions using ffprobe
        bg_dimensions=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=x ${tmpVideo})
        bg_width=$(echo $bg_dimensions | cut -d'x' -f1)
        bg_height=$(echo $bg_dimensions | cut -d'x' -f2)
        
        # Now run ffmpeg using those dimensions
        ffmpeg -i ${tmpVideo} -stream_loop -1 -i ${tmpFileIn} -filter_complex "[1:v]scale='if(gt(iw,$bg_width-${padding*2}),$bg_width-${padding*2},iw)':'if(gt(ih,$bg_height-${padding*2}),$bg_height-${padding*2},ih)'[scaled];[0:v][scaled]overlay=x=($bg_width-overlay_w)/2:y=($bg_height-overlay_h)/2:shortest=1,scale='if(gt(a,${width}/${height}),${width},-2)':'if(gt(a,${width}/${height}),-2,${height})'" ${time ? '-loop 0 -t ' + time : ''} ${tmpFileOut}
  `;
  }
  
  try {
      await execPromise(command);
      
      switch (mode) {
          case "buff":
              const buff = fs.readFileSync(tmpFileOut);
              fs.unlinkSync(tmpFileOut);
              return buff;
          case "file":
              return tmpFileOut;
          default:
              throw new Error("Invalid mode specified");
      }
  } catch (err) {
      throw new Error(err);
  } finally {
      // Clean up the input file
      fs.unlinkSync(tmpFileIn);
  }
}

const resizeImage = async (imageBuffer, newWidth, newHeight) => {
    try {
        // Use sharp to resize the image
        const resizedImageBuffer = await sharp(imageBuffer)
            .resize(newWidth, newHeight)
            .jpeg()
            .toBuffer();

        return resizedImageBuffer;
    } catch (error) {
        throw new Error(`Error resizing image: ${error.message}`);
    }
};

module.exports = {
    getVideoDuration,
    toAudio,
    toPTT,
    toVideo,
    videoToWebp,
    addColoredBgToGif,
    addImageBgToGif,
    addVideoBgToGif,
    resizeImage
};