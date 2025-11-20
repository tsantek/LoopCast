use crate::app_state::AppState;

use crate::handlers::schedule::{create_schedule, get_player_schedule, update_schedule};
use axum::{Router, routing::get, routing::post};
use std::sync::Arc;

pub fn schedule_routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/test", get(|| async { "Player routes working!" }))
        .route("/create", post(create_schedule))
        .route("/update/:schedule_id", axum::routing::put(update_schedule))
        .route("/:player_id", get(get_player_schedule))
}
