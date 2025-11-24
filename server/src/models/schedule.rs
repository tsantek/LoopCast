use serde::Serialize;
use uuid::Uuid;

#[derive(Serialize)]
pub struct Schedule {
    pub schedule_id: Uuid,
    pub player_id: Uuid,
    pub ad_id: Uuid,

    // from ads table
    pub name: String,
    pub file_name: String,
    pub duration: i32,
    pub media_type: String,

    // scheduling
    pub start_time: Option<String>,
    pub end_time: Option<String>,
    pub is_filler: bool,
    pub ad_order: i32,
    pub status: String,
    pub repeat_interval: Option<String>,
}
