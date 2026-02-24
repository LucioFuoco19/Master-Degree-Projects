mod errors;
mod storage;
mod auth;
mod handlers;
mod net;

use anyhow::Result;
use tokio::net::TcpListener;
use net::serve_connection;
use storage::SqliteStorage;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tokio::sync::mpsc;
use uuid::Uuid;
use shared::ServerMsg;

#[path = "monitoring/monitoring.rs"]
mod monitoring; // This line has been moved slightly but is functionally the same

static DB_PATH: &str = "ruggine.db";

// Map: UserID -> Channel to send push messages to that client
pub type PeerMap = Arc<Mutex<HashMap<Uuid, mpsc::UnboundedSender<ServerMsg>>>>;

#[tokio::main]
async fn main() -> Result<()> {

    tokio::task::spawn_blocking(move || {
        monitoring::start_monitoring();
    });

    // bootstrap DB
    SqliteStorage::init(DB_PATH)?;

    // EDIT: Read the port from the environment, default 7878
    let port = std::env::var("PORT").unwrap_or_else(|_| "7878".to_string());
    let addr = format!("0.0.0.0:{}", port);

    let listener = TcpListener::bind(&addr).await?;
    println!("Server rust listening on {}", port);

    let peers: PeerMap = Arc::new(Mutex::new(HashMap::new()));

    loop {
        let (socket, _addr) = listener.accept().await?;
        let peers = peers.clone(); // Clona il riferimento (Arc)
        tokio::spawn(serve_connection(socket, DB_PATH, peers));
    }
}