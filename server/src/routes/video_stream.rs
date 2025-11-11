use crate::app_state::AppState;
use axum::{
    body::Body,
    extract::{Path, State},
    http::{HeaderMap, Response, StatusCode, header},
};
use std::{fs::File, io::SeekFrom, sync::Arc};
use tokio::io::{AsyncReadExt, AsyncSeekExt};
use tokio_util::io::ReaderStream;

#[axum::debug_handler]
pub async fn video_stream(
    State(_state): State<Arc<AppState>>,
    Path(video_name): Path<String>,
    headers: HeaderMap, // <-- extract request headers
) -> Response<Body> {
    println!("video_stream called: {}", video_name);

    let path = format!(
        "/Users/tomsantek/Desktop/LoopCast/server/src/ads/{}",
        video_name
    );

    let file = match File::open(&path) {
        Ok(f) => f,
        Err(_) => {
            return Response::builder()
                .status(StatusCode::NOT_FOUND)
                .body(Body::from("File not found"))
                .unwrap();
        }
    };

    let metadata = file.metadata().unwrap();
    let file_size = metadata.len();

    let mut file = tokio::fs::File::from_std(file);

    // Properly get the Range header
    if let Some(range_header) = headers.get(header::RANGE) {
        if let Ok(range_str) = range_header.to_str() {
            if let Some((start, end)) = parse_range(range_str, file_size) {
                let chunk_size = end - start + 1;
                file.seek(SeekFrom::Start(start)).await.unwrap();
                let stream = ReaderStream::new(file.take(chunk_size));
                let body = Body::from_stream(stream);

                return Response::builder()
                    .status(StatusCode::PARTIAL_CONTENT)
                    .header(header::CONTENT_TYPE, "video/mp4")
                    .header(header::ACCEPT_RANGES, "bytes")
                    .header(header::CONTENT_LENGTH, chunk_size)
                    .header(
                        header::CONTENT_RANGE,
                        format!("bytes {}-{}/{}", start, end, file_size),
                    )
                    .body(body)
                    .unwrap();
            }
        }
    }

    // No Range header → send whole file
    let stream = ReaderStream::new(file);
    Response::builder()
        .header(header::CONTENT_TYPE, "video/mp4")
        .header(header::CONTENT_LENGTH, file_size)
        .header(header::ACCEPT_RANGES, "bytes")
        .body(Body::from_stream(stream))
        .unwrap()
}

// Parses "bytes=start-end" header, returns (start, end)
fn parse_range(header: &str, file_size: u64) -> Option<(u64, u64)> {
    if !header.starts_with("bytes=") {
        return None;
    }
    let range = &header[6..];
    let parts: Vec<&str> = range.split('-').collect();
    if parts.len() != 2 {
        return None;
    }

    let start = parts[0].parse::<u64>().ok()?;
    let end = if parts[1].is_empty() {
        file_size - 1
    } else {
        parts[1].parse::<u64>().ok()?
    };

    if start > end || end >= file_size {
        None
    } else {
        Some((start, end))
    }
}
