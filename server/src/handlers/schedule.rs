use crate::AppState;
use crate::models::schedule::Schedule;
use axum::{
    extract::{Json, Path, State},
    response::IntoResponse,
};
use chrono::{Duration, NaiveTime};
use std::sync::Arc;
use uuid::Uuid;

#[axum::debug_handler]
pub async fn get_player_schedule(
    State(state): State<Arc<AppState>>,
    Path(player_id): Path<Uuid>,
) -> impl IntoResponse {
    let schedules = sqlx::query_as!(
        Schedule,
        r#"
        SELECT
            s.id          AS "schedule_id!",
            s.player_id   AS "player_id!",
            s.ad_id       AS "ad_id!",

            a.name        AS "name!",
            a.file_name   AS "file_name!",
            a.duration    AS "duration!",
            a.ad_type     AS "media_type!",

            s.start_time::text AS "start_time?",
            s.end_time::text   AS "end_time?",
            s.is_filler   AS "is_filler!",
            s.ad_order    AS "ad_order!",
            s.status::text AS "status!",
            s.repeat_interval::text AS "repeat_interval?"
        FROM ad_schedules s
        JOIN ads a ON s.ad_id = a.id
        WHERE s.player_id = $1
        ORDER BY s.start_time, s.ad_order
        "#,
        player_id
    )
    .fetch_all(&state.db)
    .await;

    match schedules {
        Ok(rows) => Json(rows).into_response(),
        Err(e) => (
            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            format!("Database error: {}", e),
        )
            .into_response(),
    }
}

#[derive(serde::Deserialize, Debug)]
pub struct CreateSchedulePayload {
    pub ad_id: Uuid,
    pub player_id: Uuid,
    pub start_time: String,
    pub is_filler: Option<bool>,
    pub ad_order: Option<i32>,
    pub ad_duration: Option<i32>,
    pub repeat_interval: Option<String>,
}

#[axum::debug_handler]
pub async fn create_schedule(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateSchedulePayload>,
) -> impl IntoResponse {
    println!("Received create_schedule payload: {:?}", payload);
    // Parse start_time - 2025-11-11T07:40
    let start_time: NaiveTime =
        match NaiveTime::parse_from_str(&payload.start_time, "%Y-%m-%dT%H:%M") {
            Ok(t) => t,
            Err(_) => {
                return (
                    axum::http::StatusCode::BAD_REQUEST,
                    "Invalid start_time format",
                )
                    .into_response();
            }
        };

    // Calculate end_time based on duration
    let duration_secs = payload.ad_duration.unwrap_or(30); // default 30s if missing
    let end_time = start_time + Duration::seconds(duration_secs.into());

    let schedule_id = Uuid::new_v4();
    let is_filler = payload.is_filler.unwrap_or(false);
    let ad_order = payload.ad_order.unwrap_or(0);

    // set interval
    let repeat_interval_str = match payload.repeat_interval.as_deref() {
        Some("15min") => "15 minutes",
        Some("30min") => "30 minutes",
        Some("1hr") => "1 hour",
        Some("6hr") => "6 hours",
        Some("12hr") => "12 hours",
        Some("daily") => "1 day",
        Some("weekly") => "7 days",
        Some("monthly") => "1 month",
        _ => "0 seconds",
    };

    let result = sqlx::query!(
        r#"
        INSERT INTO ad_schedules (id, ad_id, player_id, start_time, end_time, is_filler, ad_order, repeat_interval)
        VALUES ($1, $2, $3, $4::text::time, $5::text::time, $6, $7, $8::text::interval)
        "#,
        schedule_id,
        payload.ad_id,
        payload.player_id,
        start_time.to_string(),
        end_time.to_string(),
        is_filler,
        ad_order,
        Some(repeat_interval_str.to_string())
    )
    .execute(&state.db)
    .await;

    println!("Create schedule result: {:?}", result);

    match result {
        Ok(_) => (
            axum::http::StatusCode::CREATED,
            format!("Schedule created with id: {}", schedule_id),
        )
            .into_response(),
        Err(e) => (
            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            format!("Failed to create schedule: {}", e),
        )
            .into_response(),
    }
}

// Edit schedule
#[axum::debug_handler]
pub async fn update_schedule(
    State(state): State<Arc<AppState>>,
    Path(schedule_id): Path<Uuid>,
    Json(payload): Json<CreateSchedulePayload>,
) -> impl IntoResponse {
    println!("Received update_schedule payload: {:?}", payload);
    // Parse start_time - 2025-11-11T07:40
    let start_time: NaiveTime =
        match NaiveTime::parse_from_str(&payload.start_time, "%Y-%m-%dT%H:%M") {
            Ok(t) => t,
            Err(_) => {
                return (
                    axum::http::StatusCode::BAD_REQUEST,
                    "Invalid start_time format",
                )
                    .into_response();
            }
        };

    // Calculate end_time based on duration
    let duration_secs = payload.ad_duration.unwrap_or(30); // default 30s if missing
    let end_time = start_time + Duration::seconds(duration_secs.into());

    let is_filler = payload.is_filler.unwrap_or(false);
    let ad_order = payload.ad_order.unwrap_or(0);

    // set interval
    let repeat_interval_str = match payload.repeat_interval.as_deref() {
        Some("15min") => "15 minutes",
        Some("30min") => "30 minutes",
        Some("1hr") => "1 hour",
        Some("6hr") => "6 hours",
        Some("12hr") => "12 hours",
        Some("daily") => "1 day",
        Some("weekly") => "7 days",
        Some("monthly") => "1 month",
        _ => "0 seconds",
    };

    let result = sqlx::query!(
        r#"
        UPDATE ad_schedules
        SET ad_id = $1,
            player_id = $2,
            start_time = $3::text::time,
            end_time = $4::text::time,
            is_filler = $5,
            ad_order = $6,
            repeat_interval = $7::text::interval
        WHERE id = $8
        "#,
        payload.ad_id,
        payload.player_id,
        start_time.to_string(),
        end_time.to_string(),
        is_filler,
        ad_order,
        Some(repeat_interval_str.to_string()),
        schedule_id
    )
    .execute(&state.db)
    .await;

    println!("Update schedule result: {:?}", result);

    match result {
        Ok(_) => (
            axum::http::StatusCode::OK,
            format!("Schedule updated with id: {}", schedule_id),
        )
            .into_response(),
        Err(e) => (
            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            format!("Failed to update schedule: {}", e),
        )
            .into_response(),
    }
}
