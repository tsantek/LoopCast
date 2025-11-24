use crate::{
    app_state::AppState,
    models::player::{LoginPayload, Player, RegisterPlayerResponse, RegistrationPayload},
};
use axum::{Json, extract::Path, extract::State};
use std::sync::Arc;
use uuid::Uuid;

// Add debug_handler attribute
#[axum::debug_handler]
pub async fn register_player(
    State(state): State<Arc<AppState>>,
    Path(registration_token): Path<String>,
) -> axum::response::Result<Json<RegisterPlayerResponse>> {
    println!("register_player called");
    let player_id = Uuid::new_v4();
    let mut registration_token = registration_token;

    // chec if registration_token is passed
    if registration_token.is_empty() {
        println!("No registration token provided");

        registration_token = Uuid::new_v4()
            .to_string()
            .chars()
            .take(6)
            .collect::<String>();
    }

    // Generate a registration token that will be 6 characters long

    sqlx::query!(
        "INSERT INTO players (id, registration_token) VALUES ($1, $2)",
        player_id,
        registration_token,
    )
    .execute(&state.db)
    .await
    .expect("Failed to insert player");

    Ok(Json(RegisterPlayerResponse {
        id: player_id,
        registration_token,
        status: Some("pending".to_string()),
    }))
}

#[axum::debug_handler]
pub async fn confirm_registration(
    State(state): State<Arc<AppState>>,
    Path(registration_token): Path<String>,
    Json(payload): Json<RegistrationPayload>,
    // check if the registration token exists
) -> axum::response::Result<Json<Player>, axum::http::StatusCode> {
    println!("Payload received: {:?}", payload);

    println!("confirm_registration called");
    let player = sqlx::query!(
        "SELECT id, status::text AS status FROM players WHERE registration_token = $1",
        registration_token
    )
    .fetch_optional(&state.db)
    .await
    .expect("Failed to fetch player");

    let player_record = match player {
        // if record exists, check if status is pending
        Some(p) => {
            if p.status.as_deref() == Some("pending") {
                p
            } else {
                // Return 409 Conflict if already confirmed with registered token
                return Err(axum::http::StatusCode::CONFLICT.into());
            }
        }
        None => {
            // Return 400 Bad Request if token is invalid
            return Err(axum::http::StatusCode::BAD_REQUEST.into());
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

    Ok(Json(Player {
        id: player_record.id,
        registration_token: Some(registration_token),
        name: Some(payload.name),
        status: Some("active".to_string()),
        notes: None,
        address: None,
        city: None,
        zip_code: None,
        country: None,
        state: None,
    }))
}

#[axum::debug_handler]
pub async fn login_player(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<LoginPayload>,
) -> axum::response::Result<Json<Player>, axum::http::StatusCode> {
    let name = payload.name;
    let registration_token = payload.registration_token;

    let player = sqlx::query!(
        "SELECT id, status::text AS status FROM players WHERE registration_token = $1 AND name = $2",
        registration_token,
        name
    )
    .fetch_optional(&state.db)
    .await
    .expect("Failed to fetch player");

    let player_record = match player {
        Some(p) => p,
        None => {
            // Return 400 Bad Request if token or name is invalid
            return Err(axum::http::StatusCode::BAD_REQUEST.into());
        }
    };

    Ok(Json(Player {
        id: player_record.id,
        registration_token: Some(registration_token),
        name: Some(name),
        status: Some(player_record.status.unwrap_or_default()),
        notes: None,
        address: None,
        city: None,
        zip_code: None,
        country: None,
        state: None,
    }))
}

#[axum::debug_handler]
pub async fn get_player(
    State(state): State<Arc<AppState>>,
    Path(player_id): Path<Uuid>,
) -> axum::response::Result<Json<Player>, axum::http::StatusCode> {
    let player = sqlx::query!(
        "SELECT id, name, notes, address, city, zip_code, country, state, status::text AS status FROM players WHERE id = $1",
        player_id
    )
    .fetch_optional(&state.db)
    .await
    .expect("Failed to fetch player");

    match player {
        Some(p) => Ok(Json(Player {
            id: p.id,
            registration_token: None,
            name: p.name,
            status: p.status,
            notes: p.notes,
            address: p.address,
            city: p.city,
            zip_code: p.zip_code,
            country: p.country,
            state: p.state,
        })),
        None => Err(axum::http::StatusCode::NOT_FOUND.into()),
    }
}

// Get List of all players
#[axum::debug_handler]
pub async fn get_players(
    State(state): State<Arc<AppState>>,
) -> axum::response::Result<Json<Vec<Player>>, axum::http::StatusCode> {
    let players = sqlx::query!(
        "SELECT id, registration_token, name, notes, address, status::text AS status FROM players"
    )
    .fetch_all(&state.db)
    .await
    .expect("Failed to fetch players");

    Ok(Json(
        players
            .into_iter()
            .map(|p| Player {
                id: p.id,
                registration_token: Some(p.registration_token),
                name: p.name,
                status: p.status,
                notes: None,
                address: None,
                city: None,
                zip_code: None,
                country: None,
                state: None,
            })
            .collect(),
    ))
}
