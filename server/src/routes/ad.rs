use axum::{
    extract::{Multipart, State},
    http::StatusCode,
    response::IntoResponse,
};
use std::{
    fs::{self, File, OpenOptions},
    io::Write,
    path::Path,
    process::Command,
    sync::Arc,
};

use crate::app_state::AppState;

pub async fn upload_ad(
    State(state): State<Arc<AppState>>,
    mut multipart: Multipart,
) -> impl IntoResponse {
    println!("Received upload request");

    let mut file_name = String::new();
    let mut ad_name = String::new();
    let mut chunk_number = 0;
    let mut total_chunks = 0;

    // Temp storage folder for chunks
    let mut temp_dir: Option<String> = None;

    // Read all multipart fields
    while let Ok(Some(mut field)) = multipart.next_field().await {
        let name = field.name().unwrap_or("").to_string();

        match name.as_str() {
            "ad_name" => {
                ad_name = field.text().await.unwrap_or_default();
                println!("Ad name: {}", ad_name);
            }
            "file_name" => {
                file_name = sanitize_filename(&field.text().await.unwrap_or_default());
                println!("File name: {}", file_name);
            }
            "chunk_number" => {
                let text = field.text().await.unwrap_or_default();
                chunk_number = text.parse::<usize>().unwrap_or(0);
                println!("Chunk number: {}", chunk_number);
            }
            "total_chunks" => {
                let text = field.text().await.unwrap_or_default();
                total_chunks = text.parse::<usize>().unwrap_or(0);
                println!("Total chunks: {}", total_chunks);
            }
            "chunk_data" => {
                println!("Processing chunk_data field");

                // Use temp folder for multi-chunk uploads
                if total_chunks > 1 {
                    let dir = format!("./uploads/temp/{}", file_name);
                    fs::create_dir_all(&dir).ok();
                    temp_dir = Some(dir.clone());

                    let chunk_path = format!("{}/chunk_{}", dir, chunk_number);
                    let mut file = match File::create(&chunk_path) {
                        Ok(f) => f,
                        Err(err) => {
                            eprintln!("Failed to create chunk file: {:?}", err);
                            return Err(StatusCode::INTERNAL_SERVER_ERROR);
                        }
                    };

                    // Stream the chunk data
                    while let Ok(Some(bytes)) = field.chunk().await {
                        if let Err(err) = file.write_all(&bytes) {
                            eprintln!("Failed to write chunk data: {:?}", err);
                            return Err(StatusCode::INTERNAL_SERVER_ERROR);
                        }
                        println!("Wrote {} bytes", bytes.len());
                    }

                    println!("Finished writing chunk {}", chunk_number);
                } else {
                    // Single full-file upload
                    let output_path = format!("./uploads/{}", file_name);
                    if let Some(parent) = Path::new(&output_path).parent() {
                        fs::create_dir_all(parent).ok();
                    }

                    let mut file = match File::create(&output_path) {
                        Ok(f) => {
                            // File created successfully send info to DB
                            let file_info = file_info(&output_path);
                            println!("File info: {:?}", file_info);
                            let ad_id = uuid::Uuid::new_v4();
                            let ad_name = ad_name.clone();
                            if let Err(err) = sqlx::query!(
                                "INSERT INTO ads (id, name, file_name, duration, ad_type) VALUES ($1, $2, $3, $4, $5)",
                                ad_id,
                                ad_name,
                                file_name,
                                file_info.duration,
                                file_info.mime
                            )
                            .execute(&state.db)
                            .await
                            {
                                eprintln!("Failed to insert ad into database: {:?}", err);
                                return Err(StatusCode::INTERNAL_SERVER_ERROR);
                            }
                            f
                        }
                        Err(err) => {
                            eprintln!("Failed to create file: {:?}", err);
                            return Err(StatusCode::INTERNAL_SERVER_ERROR);
                        }
                    };

                    while let Ok(Some(bytes)) = field.chunk().await {
                        if let Err(err) = file.write_all(&bytes) {
                            eprintln!("Failed to write file: {:?}", err);
                            return Err(StatusCode::INTERNAL_SERVER_ERROR);
                        }
                        println!("Wrote {} bytes", bytes.len());
                    }

                    println!("Saved full file: {}", output_path);
                }
            }
            _ => {
                println!("Ignoring unknown field: {}", name);
            }
        }
    }

    // Assemble multi-chunk upload
    if total_chunks > 1 {
        if let Some(dir) = temp_dir {
            if is_upload_complete(&dir, total_chunks) {
                if let Err(err) = assemble_file(&dir, &file_name, total_chunks) {
                    eprintln!("Failed to assemble file: {:?}", err);
                    return Err(StatusCode::INTERNAL_SERVER_ERROR);
                }
                println!("Successfully assembled file: {}", file_name);

                // Get file info before send to DB
                let final_path = format!("./uploads/{}", file_name);
                let file_info = file_info(&final_path);
                println!("File info: {:?}", file_info);

                let ad_id = uuid::Uuid::new_v4();
                let ad_name = ad_name.clone();

                // Send file info to DB
                if let Err(err) = sqlx::query!(
                    "INSERT INTO ads (id, name, file_name, duration, ad_type) VALUES ($1, $2, $3, $4, $5)",
                    ad_id,
                    ad_name,
                    file_name,
                    file_info.duration,
                    file_info.mime
                )
                .execute(&state.db)
                .await
                {
                    eprintln!("Failed to insert ad into database: {:?}", err);
                    return Err(StatusCode::INTERNAL_SERVER_ERROR);
                }
            }
        } else {
            println!("Waiting for all chunks...");
        }
    }
    Ok(StatusCode::OK)
}

fn is_upload_complete(temp_dir: &str, total_chunks: usize) -> bool {
    match fs::read_dir(temp_dir) {
        Ok(entries) => entries.count() == total_chunks,
        Err(_) => false,
    }
}

fn assemble_file(temp_dir: &str, file_name: &str, total_chunks: usize) -> std::io::Result<()> {
    let output_path = format!("./uploads/{}", file_name);
    if let Some(parent) = Path::new(&output_path).parent() {
        fs::create_dir_all(parent)?;
    }

    let mut output_file = OpenOptions::new()
        .create(true)
        .write(true)
        .open(&output_path)?;

    for chunk_number in 0..total_chunks {
        let chunk_path = format!("{}/chunk_{}", temp_dir, chunk_number);
        let chunk_data = fs::read(&chunk_path)?;
        output_file.write_all(&chunk_data)?;
    }

    fs::remove_dir_all(temp_dir)?;
    Ok(())
}

fn sanitize_filename(filename: &str) -> String {
    filename.replace(&['/', '\\'][..], "").replace("..", "")
}

#[derive(Debug)]
struct FileInfo {
    mime: String,
    duration: Option<i32>,
}

fn file_info(path: &str) -> FileInfo {
    let mut file_info = FileInfo {
        mime: String::new(),
        duration: None,
    };

    if let Some(mime) = get_file_type(path) {
        file_info.mime = mime.clone();
        if mime.starts_with("video") {
            if let Some(duration) = get_video_duration(path) {
                file_info.duration = Some(duration);
            } else {
                println!("Could not read video duration");
            }
        } else if mime.starts_with("image") {
            // set duration for image 10 seconds
            file_info.duration = Some(10);
        } else {
            println!("Unsupported file type");
        }
    }

    file_info
}

fn get_file_type(path: &str) -> Option<String> {
    let extension = Path::new(path).extension()?.to_str()?;
    match extension.to_lowercase().as_str() {
        "mp4" | "avi" | "mov" | "mkv" | "webm" => Some("video".to_string()),
        "jpg" | "jpeg" | "png" | "gif" | "webp" => Some("image".to_string()),
        _ => None,
    }
}

fn get_video_duration(path: &str) -> Option<i32> {
    let output = Command::new("ffprobe")
        .args(&[
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            path,
        ])
        .output()
        .ok()?;

    let duration_str = String::from_utf8_lossy(&output.stdout).trim().to_string();
    duration_str.parse::<f32>().ok().map(|d| d.ceil() as i32)
}
