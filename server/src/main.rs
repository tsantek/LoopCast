use std::sync::Arc;

use axum::routing::post;
use axum::{Router, routing::get};
use tokio::net::TcpListener;

use crate::app_state::AppState;

mod app_state;
mod db;
mod routes;

use crate::routes::player::{confirm_registration, register_player};

#[tokio::main]
async fn main() {
    // Connect to PostgreSQL
    let pool = db::connect_db().await;
    let state = Arc::new(AppState { db: pool });

    // Build our application with a single route
    let app = Router::new()
        .route("/health", get(|| async { "OK" }))
        .route("/api/player/register", get(register_player))
        .route(
            "/api/player/confirm-registration/:registration_token",
            post(confirm_registration),
        )
        .with_state(state);

    // Run our app with hyper, listening globally on port 3000
    let listener = TcpListener::bind("0.0.0.0:3000").await.unwrap();
    println!("Listening on http://0.0.0.0:3000");
    axum::serve(listener, app).await.unwrap();
}
