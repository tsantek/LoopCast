use std::sync::Arc;

use axum::http;
use axum::routing::post;
use axum::{Router, routing::get};
use tokio::net::TcpListener;

use crate::app_state::AppState;

mod app_state;
mod db;
mod routes;

use crate::routes::player::{
    confirm_registration, get_player, get_players, login_player, register_player,
};
use crate::routes::video_stream::video_stream;
use http::Method;
use tower_http::cors::{Any, CorsLayer};

#[tokio::main]
async fn main() {
    let cors = CorsLayer::new()
        .allow_origin(Any) // Allow any origin (for dev only)
        .allow_methods(vec![Method::GET, Method::POST, Method::OPTIONS])
        .allow_headers(Any);

    // Connect to PostgreSQL
    let pool = db::connect_db().await;
    let state = Arc::new(AppState { db: pool });

    // Build our application with a single route
    let app = Router::new()
        .route("/health", get(|| async { "OK" }))
        .route(
            "/api/player/register/:registration_token",
            post(register_player),
        )
        .route(
            "/api/player/confirm-registration/:registration_token",
            post(confirm_registration),
        )
        .route("/api/player/login", post(login_player))
        .route("/api/player/list", get(get_players))
        .route("/api/player/info/:device_id", get(get_player))
        .route("/api/video_stream/:video_name", get(video_stream))
        .with_state(state)
        .layer(cors);

    // Run our app with hyper, listening globally on port 3001
    let listener = TcpListener::bind("0.0.0.0:3001").await.unwrap();
    println!("Listening on http://0.0.0.0:3001");
    axum::serve(listener, app).await.unwrap();
}
