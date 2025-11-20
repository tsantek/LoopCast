use crate::app_state::AppState;
use crate::handlers::player::{
    confirm_registration, get_player, get_players, login_player, register_player,
};
use axum::{Router, routing::get, routing::post};
use std::sync::Arc;

pub fn player_routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/test", get(|| async { "Player routes working!" }))
        .route("/register/:registration_token", post(register_player))
        .route(
            "/confirm-registration/:registration_token",
            post(confirm_registration),
        )
        .route("/login", post(login_player))
        .route("/list", get(get_players))
        .route("/:device_id", get(get_player))
}
