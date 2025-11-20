use crate::app_state::AppState;
use crate::handlers::video_stream::video_stream;
use axum::{Router, routing::get};
use std::sync::Arc;

pub fn video_stream_routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/test", get(|| async { " video stream routes working!" }))
        .route("/:video_name", get(video_stream))
}
