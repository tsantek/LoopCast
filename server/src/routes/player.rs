use axum::{Json, extract::Path, extract::State};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use uuid::Uuid;

use crate::app_state::AppState;

#[derive(Serialize)]
pub struct RegisterPlayerResponse {
    pub id: Uuid,
    pub registration_token: String,
    pub qr_code_base64: String,
}

// Add debug_handler attribute
#[axum::debug_handler]
pub async fn register_player(
    State(state): State<Arc<AppState>>,
) -> axum::response::Result<Json<RegisterPlayerResponse>> {
    let player_id = Uuid::new_v4();
    // Generate a registration token that will be 6 characters long
    let registration_token = Uuid::new_v4()
        .to_string()
        .chars()
        .take(6)
        .collect::<String>();

    sqlx::query!(
        "INSERT INTO players (device_id, registration_token) VALUES ($1, $2)",
        player_id,
        registration_token,
    )
    .execute(&state.db)
    .await
    .expect("Failed to insert player");

    // Generate QR code data
    // TODO: - Change this url to use proper domain
    let qr_code_data = format!(
        "http://localhost:3000/player/register/{}",
        registration_token
    );
    let qr_code_base64 = base64::encode(qr_code_data);
    Ok(Json(RegisterPlayerResponse {
        id: player_id,
        registration_token,
        qr_code_base64,
    }))
}

#[derive(Deserialize)]
pub struct RegistrationPayload {
    name: String,
    address: String,
    zip_code: String,
    city: String,
    country: Option<String>,
    state: String,
}

#[derive(Debug, Clone, sqlx::Type)]
#[sqlx(type_name = "text")]
#[sqlx(rename_all = "lowercase")]
enum StatusType {
    Active,
    Inactive,
    Pending,
}

#[axum::debug_handler]
pub async fn confirm_registration(
    State(state): State<Arc<AppState>>,
    Path(registration_token): Path<String>,
    Json(payload): Json<RegistrationPayload>,
    // check if the registration token exists
) -> axum::response::Result<Json<&'static str>> {
    let player = sqlx::query!(
        "SELECT device_id, status::text AS status FROM players WHERE registration_token = $1",
        registration_token
    )
    .fetch_optional(&state.db)
    .await
    .expect("Failed to fetch player");

    match player {
        // if record exists, check if status is pending
        Some(p) => {
            if p.status.as_deref() == Some("pending") {
                p
            } else {
                return Ok(Json("Registration already confirmed"));
            }
        }
        None => {
            return Ok(Json("Invalid registration token"));
        }
    };

    // Update player info in the database
    sqlx::query!(
        "UPDATE players SET name = $1, address = $2, zip_code = $3, city = $4, country = $5, state = $6, status = 'active' WHERE registration_token = $7",
        payload.name,
        payload.address,
        payload.zip_code,
        payload.city,
        payload.country.clone().unwrap_or_else(|| "USA".into()),
        payload.state,
        registration_token,
    )
    .execute(&state.db)
    .await
    .expect("Failed to update player");

    Ok(Json("Registration confirmed".into()))
}
