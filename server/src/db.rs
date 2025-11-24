use dotenvy::dotenv;
use sqlx::PgPool;
use std::env;

/// Connect to PostgreSQL and return a connection pool
pub async fn connect_db() -> PgPool {
    // Load .env variables
    dotenv().ok();

    // Get database URL
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set in .env");

    // Create connection pool
    let pool = PgPool::connect(&database_url)
        .await
        .expect("Failed to connect to PostgreSQL");

    println!("Connected to PostgreSQL!");

    pool
}
