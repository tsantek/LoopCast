#[derive(serde::Serialize)]
pub struct Ad {
    pub id: uuid::Uuid,
    pub name: String,
    pub file_name: String,
    pub duration: Option<i32>,
    pub ad_type: String,
}
