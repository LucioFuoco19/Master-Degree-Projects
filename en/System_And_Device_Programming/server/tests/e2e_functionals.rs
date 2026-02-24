use anyhow::{anyhow, Result};
use futures_util::{SinkExt, StreamExt};
use shared::{ClientMsg, ServerMsg, MessageInfo};
use std::process::{Command, Stdio};
use std::time::Duration;
use tokio::net::TcpStream;
use tokio::time::{sleep, timeout, Instant};
use tokio_util::codec::{Framed, LengthDelimitedCodec};
use tokio_util::bytes::Bytes;
use uuid::Uuid;
use rand::Rng;


struct TestClient {
    pub username: String,
    pub token: Uuid,
    pub stream: Framed<TcpStream, LengthDelimitedCodec>,
}

impl TestClient {
    /// Connect, Record (optional), Log in and listen (Listen)
    /// If 'register' is false, just try logging in.
    pub async fn new(port: u16, username: String, password: &str, do_register: bool) -> Result<Self> {
        let addr = format!("127.0.0.1:{}", port);
        let stream = TcpStream::connect(&addr).await?;
        let mut framed = Framed::new(stream, LengthDelimitedCodec::new());

        // 1. Register (if required)
        if do_register {
            let reg_msg = ClientMsg::Register { username: username.clone(), password: password.to_string() };
            Self::send_msg(&mut framed, &reg_msg).await?;

            // Wait for registration confirmation
            match Self::recv_msg(&mut framed).await? {
                ServerMsg::Registered { .. } => {},
                ServerMsg::Error { message } => return Err(anyhow!("Register failed for {}: {}", username, message)),
                _ => return Err(anyhow!("Unexpected response to registration")),
            }
        }

        // 2. Login
        let login_msg = ClientMsg::Login { username: username.clone(), password: password.to_string() };
        Self::send_msg(&mut framed, &login_msg).await?;

        // 3. Login Response Manager
        let token = match Self::recv_msg(&mut framed).await? {
            ServerMsg::LoginOk { session_token, .. } => session_token,
            ServerMsg::Error { message } => return Err(anyhow!("Login failed: {}", message)), // Utile per i test negativi
            _ => return Err(anyhow!("Unexpected response to login")),
        };

        // 4. Listen (Required to receive Push)
        let listen_msg = ClientMsg::Listen { token };
        Self::send_msg(&mut framed, &listen_msg).await?;

        Ok(Self { username, token, stream: framed })
    }

    /// "Raw" connection without automatic login (to test failed logins)
    pub async fn connect_raw(port: u16) -> Result<Framed<TcpStream, LengthDelimitedCodec>> {
        let addr = format!("127.0.0.1:{}", port);
        let stream = TcpStream::connect(&addr).await?;
        Ok(Framed::new(stream, LengthDelimitedCodec::new()))
    }

    async fn send_msg(framed: &mut Framed<TcpStream, LengthDelimitedCodec>, msg: &ClientMsg) -> Result<()> {
        let bytes = serde_json::to_vec(msg)?;
        framed.send(Bytes::from(bytes)).await?;
        Ok(())
    }

    async fn recv_msg(framed: &mut Framed<TcpStream, LengthDelimitedCodec>) -> Result<ServerMsg> {
        let packet = timeout(Duration::from_secs(5), framed.next()).await
            .map_err(|_| anyhow!("Timeout waiting for response"))?
            .ok_or(anyhow!("Stream closed"))??;
        Ok(serde_json::from_slice(&packet)?)
    }

    pub async fn send(&mut self, msg: ClientMsg) -> Result<()> {
        Self::send_msg(&mut self.stream, &msg).await
    }

    /// Wait for a message that satisfies the predicate
    pub async fn recv_until<T>(
        &mut self,
        step_name: &str,
        dur: Duration,
        mut pred: impl FnMut(&ServerMsg) -> Option<T>,
    ) -> Result<T> {
        let deadline = Instant::now() + dur;
        loop {
            let remain = deadline.saturating_duration_since(Instant::now());
            if remain.is_zero() { return Err(anyhow!("[TIMEOUT @ {}]", step_name)); }

            let packet_opt = timeout(remain, self.stream.next()).await;
            match packet_opt {
                Ok(Some(Ok(bytes))) => {
                    if let Ok(msg) = serde_json::from_slice::<ServerMsg>(&bytes) {
                        if let Some(res) = pred(&msg) { return Ok(res); }
                        // Ignora altri messaggi o logga errori
                        if let ServerMsg::Error { message } = &msg {
                            eprintln!("[{}] Received error from server: {}", self.username, message);
                        }
                    }
                }
                Ok(None) => return Err(anyhow!("[{}] Connection closed", step_name)),
                _ => return Err(anyhow!("[{}] Stream error or timeout", step_name)),
            }
        }
    }

    /// Verify that NO messages that satisfy the predicate arrive
    pub async fn expect_no_match(
        &mut self,
        step_name: &str,
        dur: Duration,
        mut pred: impl FnMut(&ServerMsg) -> bool,
    ) -> Result<()> {
        let deadline = Instant::now() + dur;
        loop {
            let remain = deadline.saturating_duration_since(Instant::now());
            if remain.is_zero() { return Ok(()); } // Success: Timeout expired without a match

            if let Ok(Some(Ok(bytes))) = timeout(remain, self.stream.next()).await {
                if let Ok(msg) = serde_json::from_slice::<ServerMsg>(&bytes) {
                    if pred(&msg) {
                        return Err(anyhow!("[UNEXPECTED @ {}] Received forbidden message: {:?}", step_name, msg));
                    }
                }
            } else {
                return Ok(()); // Stream closed or timeout
            }
        }
    }
}

// Starting server with temporary DB and random port
async fn start_server() -> Result<(std::process::Child, u16, String)> {
    let _ = std::fs::create_dir_all("data");
    let mut rng = rand::thread_rng();
    let port: u16 = rng.r#gen::<u16>() % 1000 + 18000; // Port between 18000 and 19000
    let db_path = format!("data/func_test_{}.sqlite", rng.r#gen::<u32>());

    let server_exe = env!("CARGO_BIN_EXE_server");
    let mut cmd = Command::new(server_exe);
    cmd.env("PORT", port.to_string())
        .env("CHAT_DB_PATH", &db_path)
        .stdout(Stdio::null())
        .stderr(Stdio::null());

    let child = cmd.spawn().expect("Impossible to start server");

    // Attesa
    let addr = format!("127.0.0.1:{}", port);
    for _ in 0..50 {
        if TcpStream::connect(&addr).await.is_ok() { return Ok((child, port, db_path)); }
        sleep(Duration::from_millis(100)).await;
    }
    Err(anyhow!("Server not started on port {}", port))
}


// =======================================================================================
// FUNZIONAL E2E TEST
// =======================================================================================

#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
async fn e2e_all_requests_g65() -> Result<()> {
    let (mut child, port, db_path) = start_server().await?;

    // Ensures cleanup at the end even in case of panic (via manual drop or catch unwind,
    // here we do explicit cleanup at the end for simplicity)

    // ----------------------------------------------------------------------
    // 1. LOGIN of UNregistered user must FAIL
    // ----------------------------------------------------------------------
    {
        let mut framed = TestClient::connect_raw(port).await?;
        let msg = ClientMsg::Login { username: "ghost".into(), password: "pw".into() };
        TestClient::send_msg(&mut framed, &msg).await?;

        let resp = TestClient::recv_msg(&mut framed).await?;
        match resp {
            ServerMsg::Error { .. } => {}, // OK
            _ => return Err(anyhow!("Login of a non-existent user did not give an error")),
        }
    }

    // ----------------------------------------------------------------------
    // 2. REGISTRATION Users (Alice, Bob, Charlie)
    // ----------------------------------------------------------------------
    let mut alice = TestClient::new(port, "alice".into(), "pw", true).await?;
    let mut bob   = TestClient::new(port, "bob".into(),   "pw", true).await?;
    let mut charlie = TestClient::new(port, "charlie".into(), "pw", true).await?;

    // ----------------------------------------------------------------------
    // 3. DUPLICATE REGISTRATION MUST FAIL
    // ----------------------------------------------------------------------
    let dup_res = TestClient::new(port, "alice".into(), "pw", true).await;
    assert!(dup_res.is_err(), "The second Alice registration must fail");

    // ----------------------------------------------------------------------
    // 4. GROUP CREATION
    // ----------------------------------------------------------------------
    alice.send(ClientMsg::CreateGroup { token: alice.token, name: "G65Group".into() }).await?;

    let gid = alice.recv_until("Wait GroupCreated", Duration::from_secs(5), |m| {
        if let ServerMsg::GroupCreated { group_id } = m { Some(*group_id) } else { None }
    }).await?;

    // ----------------------------------------------------------------------
    // 5. GROUP INVITATION (AddGroupMember)
    // ----------------------------------------------------------------------
    // Alice adds Bob
    alice.send(ClientMsg::AddGroupMember { token: alice.token, group_id: gid, username: "bob".into() }).await?;
    alice.recv_until("Wait GroupMemberAdded Ack", Duration::from_secs(5), |m| match m {
        ServerMsg::GroupMemberAdded => Some(()),
        _ => None
    }).await?;

    // Bob should receive a notification (optional based on the server, but let's check if PushGroupUpdated is present)
    // If the server does not send PushGroupUpdated to the added member, we skip this check.
    // Your server code appears to have 'PushGroupUpdated'.
    let _ = bob.recv_until("Wait PushGroupUpdated", Duration::from_millis(500), |m| match m {
        ServerMsg::PushGroupUpdated => Some(()),
        _ => None
    }).await; // Ignore result (timeout ok if not implemented)

    // - Negative: Add non-existent user ---
    alice.send(ClientMsg::AddGroupMember { token: alice.token, group_id: gid, username: "nobody".into() }).await?;
    alice.recv_until("Wait Error adding nobody", Duration::from_secs(5), |m| match m {
        ServerMsg::Error { .. } => Some(()),
        _ => None
    }).await?;

    // ----------------------------------------------------------------------
    // 6. MESSAGES IN THE GROUP
    // ----------------------------------------------------------------------
    alice.send(ClientMsg::SendGroupMessage { token: alice.token, group_id: gid, content: "Hola Bob".into() }).await?;

    // Alice riceives Ack
    alice.recv_until("Wait Ack Sent", Duration::from_secs(2), |m| match m {
        ServerMsg::GroupMessageSent { .. } => Some(()),
        _ => None
    }).await?;

    // Bob riceives Push
    bob.recv_until("Bob receives group msg", Duration::from_secs(5), |m| {
        if let ServerMsg::PushNewMessage { message, group_id, .. } = m {
            if *group_id == Some(gid) && message.content == "Hola Bob" { return Some(()); }
        }
        None
    }).await?;

    // Charlie (non-member) must NOT receive anything
    charlie.expect_no_match("Charlie spying", Duration::from_millis(500), |m| {
        matches!(m, ServerMsg::PushNewMessage { .. })
    }).await?;

    // ----------------------------------------------------------------------
    // 7. PARTICIPANT LIST (GetGroupMembers)
    // ----------------------------------------------------------------------
    alice.send(ClientMsg::GetGroupMembers { token: alice.token, group_id: gid }).await?;
    let members = alice.recv_until("Get Members", Duration::from_secs(5), |m| {
        if let ServerMsg::GroupMembers { members } = m { Some(members.clone()) } else { None }
    }).await?;

    // Check that Alice and Bob are there
    let names: Vec<String> = members.iter().map(|u| u.username.clone()).collect();
    assert!(names.contains(&"alice".to_string()));
    assert!(names.contains(&"bob".to_string()));
    assert!(!names.contains(&"charlie".to_string()));

    // ----------------------------------------------------------------------
    // 8. PRIVATE CHAT
    // ----------------------------------------------------------------------
    alice.send(ClientMsg::StartPrivateChat { token: alice.token, other_username: "charlie".into() }).await?;
    let chat_id = alice.recv_until("PrivChat Started", Duration::from_secs(5), |m| {
        if let ServerMsg::PrivateChatStarted { chat_id } = m { Some(*chat_id) } else { None }
    }).await?;

    // Alice scrive un Charlie
    alice.send(ClientMsg::SendPrivateMessage { token: alice.token, chat_id, content: "Psst Charlie".into() }).await?;

    // Charlie Riceve
    charlie.recv_until("Charlie receives priv msg", Duration::from_secs(5), |m| {
        if let ServerMsg::PushNewMessage { message, chat_id: cid, .. } = m {
            if *cid == Some(chat_id) && message.content == "Psst Charlie" { return Some(()); }
        }
        None
    }).await?;

    // Bob doesn't have to see anything
    bob.expect_no_match("Bob spying private", Duration::from_millis(500), |m| {
        matches!(m, ServerMsg::PushNewMessage { .. })
    }).await?;

    // ----------------------------------------------------------------------
    // CLEANUP
    // ----------------------------------------------------------------------
    let _ = child.kill();
    let _ = std::fs::remove_file(&db_path);

    Ok(())
}

#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
async fn e2e_offline_messaging_and_history() -> Result<()> {
    let (mut child, port, db_path) = start_server().await?;

    // 1. Recording Alice and Bob
    let mut alice = TestClient::new(port, "alice_h".into(), "pw", true).await?;
    let bob_init = TestClient::new(port, "bob_h".into(), "pw", true).await?;

    // Save the bob token if we want to reuse it, but simulate a full re-login
    drop(bob_init); // BOB LOGS OUT

    // 2. Alice starts private chat with Bob (who is offline)
    alice.send(ClientMsg::StartPrivateChat { token: alice.token, other_username: "bob_h".into() }).await?;
    let chat_id = alice.recv_until("PrivChat Started", Duration::from_secs(2), |m| {
        if let ServerMsg::PrivateChatStarted { chat_id } = m { Some(*chat_id) } else { None }
    }).await?;

    // Alice sends message to Bob offline
    alice.send(ClientMsg::SendPrivateMessage { token: alice.token, chat_id, content: "Are you offline?".into() }).await?;
    alice.recv_until("Msg Sent Ack", Duration::from_secs(2), |m| match m {
        ServerMsg::PrivateMessageSent { .. } => Some(()),
        _ => None
    }).await?;

    // 3. Alice creates group, adds Bob (offline) and writes
    alice.send(ClientMsg::CreateGroup { token: alice.token, name: "OfflineGroup".into() }).await?;
    let gid = alice.recv_until("Group Created", Duration::from_secs(2), |m| {
        if let ServerMsg::GroupCreated { group_id } = m { Some(*group_id) } else { None }
    }).await?;

    alice.send(ClientMsg::AddGroupMember { token: alice.token, group_id: gid, username: "bob_h".into() }).await?;
    alice.recv_until("Member Added", Duration::from_secs(2), |m| match m {
        ServerMsg::GroupMemberAdded => Some(()),
        _ => None
    }).await?;

    alice.send(ClientMsg::SendGroupMessage { token: alice.token, group_id: gid, content: "Offline group message".into() }).await?;
    alice.recv_until("Group Msg Ack", Duration::from_secs(2), |m| match m {
        ServerMsg::GroupMessageSent { .. } => Some(()),
        _ => None
    }).await?;

    // 4. BOB BACK ONLINE (Login)
    // Note: We use false for 'do_register' because it is already registered
    let mut bob = TestClient::new(port, "bob_h".into(), "pw", false).await?;

    // 5. Bob recovers PRIVATE history
    // It needs to discover chats first (optional in the real client, but here we test the direct API)
    // If Bob doesn't have the chat ID, he can retrieve it with GetPrivateChats or we assume it is known in the test.
    // We use GetPrivateChats for completeness.
    bob.send(ClientMsg::GetPrivateChats { token: bob.token }).await?;
    let chats = bob.recv_until("Get Chats", Duration::from_secs(2), |m| {
        if let ServerMsg::PrivateChats { chats } = m { Some(chats.clone()) } else { None }
    }).await?;
    assert!(!chats.is_empty(), "Bob should have at least one private chat");
    let fetched_chat_id = chats[0].chat_id;
    assert_eq!(fetched_chat_id, chat_id);

    // Now ask for messages
    bob.send(ClientMsg::GetPrivateChatMessages { token: bob.token, chat_id: fetched_chat_id, limit: 10 }).await?;
    let msgs = bob.recv_until("Get Priv Msgs", Duration::from_secs(2), |m| {
        if let ServerMsg::PrivateChatMessages { messages } = m { Some(messages.clone()) } else { None }
    }).await?;

    // Content verification
    assert!(msgs.iter().any(|m| m.content == "Are you offline?"), "Bob did not find the offline private message");

    // 6. Bob recovers historical GROUP
    bob.send(ClientMsg::GetGroups { token: bob.token }).await?;
    let groups = bob.recv_until("Get Groups", Duration::from_secs(2), |m| {
        if let ServerMsg::Groups { groups } = m { Some(groups.clone()) } else { None }
    }).await?;
    assert!(!groups.is_empty());
    let fetched_gid = groups[0].group_id;
    assert_eq!(fetched_gid, gid);

    bob.send(ClientMsg::GetGroupMessages { token: bob.token, group_id: fetched_gid, limit: 10 }).await?;
    let g_msgs = bob.recv_until("Get Group Msgs", Duration::from_secs(2), |m| {
        if let ServerMsg::GroupMessages { messages } = m { Some(messages.clone()) } else { None }
    }).await?;

    assert!(g_msgs.iter().any(|m| m.content == "Offline group message"), "Bob did not find the offline group message");

    // Cleanup
    let _ = child.kill();
    let _ = std::fs::remove_file(&db_path);
    Ok(())
}

#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
async fn e2e_search_and_lists() -> Result<()> {
    let (mut child, port, db_path) = start_server().await?;

    let mut alice = TestClient::new(port, "alice_s".into(), "pw", true).await?;
    let _bob = TestClient::new(port, "bob_s".into(), "pw", true).await?;
    let _charlie = TestClient::new(port, "charlie_s".into(), "pw", true).await?;

    // 1. USER SEARCH
    alice.send(ClientMsg::SearchUsers { token: alice.token, query: "bob".into() }).await?;
    let results = alice.recv_until("Search 'bob'", Duration::from_secs(2), |m| {
        if let ServerMsg::UsersFound { users } = m { Some(users.clone()) } else { None }
    }).await?;

    assert!(results.iter().any(|u| u.username == "bob_s"));
    assert!(!results.iter().any(|u| u.username == "charlie_s"));

    // Partial search
    alice.send(ClientMsg::SearchUsers { token: alice.token, query: "char".into() }).await?;
    let results2 = alice.recv_until("Search 'char'", Duration::from_secs(2), |m| {
        if let ServerMsg::UsersFound { users } = m { Some(users.clone()) } else { None }
    }).await?;
    assert!(results2.iter().any(|u| u.username == "charlie_s"));

    // Empty or matchless search
    alice.send(ClientMsg::SearchUsers { token: alice.token, query: "not_exist".into() }).await?;
    let results3 = alice.recv_until("Search empty", Duration::from_secs(2), |m| {
        if let ServerMsg::UsersFound { users } = m { Some(users.clone()) } else { None }
    }).await?;
    assert!(results3.is_empty());

    // 2. CHAT LISTS AND GROUPS (Check consistency)
    // Empty at first
    alice.send(ClientMsg::GetPrivateChats { token: alice.token }).await?;
    let chats_empty = alice.recv_until("Empty Chats", Duration::from_secs(2), |m| {
        if let ServerMsg::PrivateChats { chats } = m { Some(chats.clone()) } else { None }
    }).await?;
    assert!(chats_empty.is_empty());

    // Create a chat and verify
    alice.send(ClientMsg::StartPrivateChat { token: alice.token, other_username: "bob_s".into() }).await?;
    alice.recv_until("Chat Started", Duration::from_secs(2), |m| match m {
        ServerMsg::PrivateChatStarted { .. } => Some(()),
        _ => None
    }).await?;

    alice.send(ClientMsg::GetPrivateChats { token: alice.token }).await?;
    let chats_filled = alice.recv_until("1 Chat", Duration::from_secs(2), |m| {
        if let ServerMsg::PrivateChats { chats } = m { Some(chats.clone()) } else { None }
    }).await?;
    assert_eq!(chats_filled.len(), 1);
    assert_eq!(chats_filled[0].other_username, "bob_s");

    // Cleanup
    let _ = child.kill();
    let _ = std::fs::remove_file(&db_path);
    Ok(())
}