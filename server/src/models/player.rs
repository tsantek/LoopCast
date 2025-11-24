use serde::Deserialize;
use serde::Serialize;
use uuid::Uuid;

#[derive(Serialize)]
pub struct RegisterPlayerResponse {
    pub id: Uuid,
    pub registration_token: String,
    pub status: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct RegistrationPayload {
    pub name: String,
    pub address: String,
    pub zip_code: String,
    pub city: String,
    pub country: Option<String>,
    pub state: String,
}

#[derive(Serialize)]
pub struct Player {
    pub id: Uuid,
    pub registration_token: Option<String>,
    pub name: Option<String>,
    pub status: Option<String>,
    pub notes: Option<String>,
    pub address: Option<String>,
    pub city: Option<String>,
    pub zip_code: Option<String>,
    pub country: Option<String>,
    pub state: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct LoginPayload {
    pub name: String,
    pub registration_token: String,
}
