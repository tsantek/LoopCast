//  Get scheduler for a specific player
//  Returns the schedule of videos assigned to the player identified by player_id.
//  Scheduler need to run whole day, so the response will have multiple entries with start_time and end_time
//  For each video when is uploaded it needs to create duration field in seconds
//  The time that don't have scheduled video should poplulate with default videos - e.g. ads or promotional videos

pub struct CreateSchedulePayload {
    pub player_id: Uuid,
    pub video_id: String,
    pub start_time: chrono::NaiveDateTime,
    pub notes: Option<String>,
}

#[axum::debug_handler]
pub async fn create_schedule(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateSchedulePayload>,
) -> axum::response::Result<Json<Schedule>, axum::http::StatusCode> {
    let schedule_id = Uuid::new_v4();
    let player_id = payload.player_id;
    let video_name = payload.video_name;
    let start_time = payload.start_time;
    let end_time = payload.end_time;

    sqlx::query!(
        "INSERT INTO schedules (schedule_id, player_id, video_name, start_time, end_time) VALUES ($1, $2, $3, $4, $5)",
        schedule_id,
        player_id,
        video_name,
        start_time,
        end_time
    )
    .execute(&state.db)
    .await
    .expect("Failed to create schedule");

    Ok(Json(Schedule {
        schedule_id,
        player_id,
        video_name,
        start_time,
        end_time,
    }))
}
