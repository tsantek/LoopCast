//  Get scheduler for a specific player
//  Returns the schedule of videos assigned to the player identified by player_id.
//  Scheduler need to run whole day, so the response will have multiple entries with start_time and end_time
//  For each video when is uploaded it needs to create duration field in seconds
//  The time that don't have scheduled video should poplulate with default videos - e.g. ads or promotional videos

use crate::AppState;
use axum;
use axum::extract::{Json, State};
use std::sync::Arc;
use uuid::Uuid;

#[derive(serde::Serialize)]
pub struct Schedule {
    pub schedule_id: Uuid,
    pub player_id: Uuid,
    pub video_id: String,
    pub start_time: chrono::NaiveDateTime,
    pub end_time: chrono::NaiveDateTime,
    pub video_name: Option<String>,
    pub duration: Option<i64>,
    pub notes: Option<String>,
    pub media_type: Option<String>,
}

#[derive(serde::Deserialize)]
pub struct CreateSchedulePayload {
    pub player_id: Uuid,
    pub video_id: String,
    pub start_time: chrono::NaiveDateTime,
    pub notes: Option<String>,
    pub media_type: Option<String>,
}

// Handler to get player schedule demo implementation
#[axum::debug_handler]
pub async fn get_player_schedule(
    State(state): State<Arc<AppState>>,
    axum::extract::Path(player_id): axum::extract::Path<Uuid>,
) -> axum::response::Result<Json<Vec<Schedule>>> {
    println!("get_player_schedule called for player_id: {}", player_id);
    let demo_schedule = vec![
        Schedule {
            schedule_id: Uuid::new_v4(),
            player_id,
            video_id: "video_1".to_string(),
            start_time: chrono::NaiveDate::from_ymd(2024, 1, 1).and_hms(9, 0, 0),
            end_time: chrono::NaiveDate::from_ymd(2024, 1, 1).and_hms(9, 10, 0),
            video_name: Some("video_1.mp4".to_string()),
            duration: None,
            notes: Some("Morning video".to_string()),
            media_type: Some("video".to_string()),
        },
        Schedule {
            schedule_id: Uuid::new_v4(),
            player_id,
            video_id: "image_1".to_string(),
            start_time: chrono::NaiveDate::from_ymd(2024, 1, 1).and_hms(9, 10, 0),
            end_time: chrono::NaiveDate::from_ymd(2024, 1, 1).and_hms(9, 15, 0),
            video_name: Some("image_1.png".to_string()),
            duration: None,
            notes: Some("Morning image".to_string()),
            media_type: Some("image".to_string()),
        },
        Schedule {
            schedule_id: Uuid::new_v4(),
            player_id,
            video_id: "video_2".to_string(),
            start_time: chrono::NaiveDate::from_ymd(2024, 1, 1).and_hms(9, 15, 0),
            end_time: chrono::NaiveDate::from_ymd(2024, 1, 1).and_hms(9, 25, 0),
            video_name: Some("video_2.mp4".to_string()),
            duration: None,
            notes: Some("Mid-morning video".to_string()),
            media_type: Some("video".to_string()),
        },
    ];
    Ok(Json(demo_schedule))
}
