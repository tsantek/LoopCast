use crate::app_state::AppState;
use crate::handlers::ad::{delete_ad, get_all_ads, upload_ad};
use axum::{Router, routing::get, routing::post};
use std::sync::Arc;

pub fn ad_routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/test", get(|| async { "Ad routes working!" }))
        .route("/upload", post(upload_ad))
        .route("/:ad_id", axum::routing::delete(delete_ad))
        .route("/all", get(get_all_ads))
}
