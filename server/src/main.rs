mod app_state;
mod db;
mod handlers;
mod models;
mod routes;

use crate::app_state::AppState;
use axum::http;
use axum::{Router, routing::get};
use http::Method;
use std::sync::Arc;
use tokio::net::TcpListener;
use tower_http::cors::{Any, CorsLayer};
use tower_http::limit::RequestBodyLimitLayer;

#[tokio::main]
async fn main() {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(vec![
            Method::GET,
            Method::POST,
            Method::OPTIONS,
            Method::DELETE,
            Method::PUT,
        ])
        .allow_headers(Any);

    // Connect to PostgreSQL
    let pool = db::connect_db().await;
    let state = Arc::new(AppState { db: pool });

    // Build our application with a single route
    let app = Router::new()
        .route("/health", get(|| async { "OK" }))
        .nest(
            "/api/video_stream",
            routes::video_stream::video_stream_routes(),
        )
        .nest("/api/player", routes::player::player_routes())
        .nest("/api/ad", routes::ad::ad_routes())
        .nest("/api/schedule", routes::schedule::schedule_routes())
        .layer(RequestBodyLimitLayer::new(25 * 1024 * 1024)) // 25 MB
        .with_state(state)
        .layer(cors);

    // Run our app with hyper, listening globally on port 3001
    let listener = TcpListener::bind("0.0.0.0:3001").await.unwrap();
    println!("Listening on http://0.0.0.0:3001");
    axum::serve(listener, app).await.unwrap();
}
