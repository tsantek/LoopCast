use std::{fs::File, sync::Arc};

use axum::{
    body::Body,
    extract::{Path, State},
    http::{Response, StatusCode, header},
};
use tokio_util::io::ReaderStream;

use crate::app_state::AppState;

#[axum::debug_handler]
pub async fn video_stream(
    State(state): State<Arc<AppState>>,
    Path(video_name): Path<String>,
) -> Response<Body> {
    println!("video_stream called");
    println!("Video video_name: {}", video_name);

    let path = format!(
        "/Users/tomsantek/Desktop/LoopCast/server/src/ads/{}",
        video_name
    );

    println!("Video path: {}", path);

    let file = match File::open(&path) {
        Ok(f) => {
            println!("Serving file: {}", path);
            f
        }
        Err(_) => {
            return Response::builder()
                .status(StatusCode::NOT_FOUND)
                .body(Body::from("File not found"))
                .unwrap();
        }
    };

    let metadata = file.metadata().unwrap();
    let file_size = metadata.len();

    // Convert std::fs::File to tokio::fs::File
    let file = tokio::fs::File::from_std(file);

    // Optional: Handle range requests for streaming/seeking
    // For simplicity, just stream whole file
    let stream = ReaderStream::new(file);
    let body = Body::from_stream(stream);

    Response::builder()
        .header(header::CONTENT_TYPE, "video/mp4")
        .header(header::CONTENT_LENGTH, file_size)
        .body(body)
        .unwrap()
}
