# DESIGNER MANUAL

## TABLE OF CONTENTS

- CLIENT
  - MODULE `lib.rs`
    - Enum `ClientMsg`

- Builds a new 'SqliteStorage' by opening a connection to 'db_path'.
- Parameters:
  - 'db_path' → path to the SQLite file.
- Returns an 'AppResult' containing 'SqliteStorage' or an error.

###### 'pub fn init(db_path: &str) -> AppResult<()>'
- Initialize the database by creating the necessary tables if they do not exist.
- Main tables: 'users', 'sessions', 'private_chats', 'groups', 'group_members', 'messages'.
- Parameters:
  - 'db_path' → path to the SQLite file.
- Returns 'AppResult<()>' indicating success or error.

---

#### User Management

###### 'pub fn insert_user(&self, username: &str, pwd_hash: &str) -> AppResult<Uuid>'
- Inserts a new user into the database.
- Parameters:
  - 'username' → username to register.
  - 'pwd_hash' → password hash.
- Returns 'Uuid' of the created user or error if the user already exists.

###### 'pub fn get_pwd_hash(&self, username: &str) -> AppResult<Option<String>>'
- Retrieves a user's password hash.
- Parameters:
  - 'username' → username.
- Returns 'Some(hash)' if the user exists, 'None' otherwise.

###### 'pub fn get_user_id(&self, username: &str) -> AppResult<Option<Uuid>>'
- Retrieve the user ID given the name.
- Parameters:
  - 'username' → username.
- Returns 'Some(Uuid)' if it exists, 'None' otherwise.

###### 'pub fn get_username(&self, user_id: &Uuid) -> AppResult<Option<String>>'
- Retrieve the username given the ID.
- Parameters:
  - 'user_id' → user identifier.
- Returns 'Some(username)' if it exists, 'None' otherwise.

###### 'pub fn search_users(&self, my_id: &Uuid, query: &str, limit: u32) -> AppResult<Vec<(Uuid, String)>>'
- Look for other users whose username **starts for** the string 'query', excluding themselves.
- Parameters:
  - 'my_id' → ID of the user performing the search.
  - 'query' → search string.
  - 'limit' → maximum number of results.
- Returns a vector of tuples '(Uuid, username)'.

---

#### Session Management

###### 'pub fn insert_session(&self, username: &str, ttl_secs: i64) -> AppResult<Uuid>'
- Create a new session for a user.
- Parameters:
  - 'username' → username.
  - 'ttl_secs' → session duration in seconds.
- Returns 'Uuid' of the session token.

###### 'pub fn validate_session(&self, token: &Uuid) -> AppResult<Option<Uuid>>'
- Check if a session is valid (not expired).
- Parameters:
  - 'token' → session token.
- Returns 'Some(user_id)' if valid, 'None' if expired or non-existent.

---

#### Private Chat Management

###### 'pub fn create_private_chat(&self, user1_id: &Uuid, user2_id: &Uuid) -> AppResult<Uuid>'
- Create a private chat between two users.
- Parameters:
  - 'user1_id', 'user2_id' → User IDs.
- Returns the ID of the created or existing chat.

###### 'pub fn get_user_private_chats(&self, user_id: &Uuid) -> AppResult<Vec<(Uuid, Uuid, String)>>'
- Retrieve all of a user's private chats.
- Parameters:
  - 'user_id' → User ID.
- Returns a vector of '(chat_id, other_user_id, other_username)'.

###### 'pub fn is_user_in_private_chat(&self, user_id: &Uuid, chat_id: &Uuid) -> AppResult<bool>'
- Check if a user is part of a private chat.
- Parameters:
  - 'user_id' → User ID.
  - 'chat_id' → Chat ID.
- Returns 'true' if member, 'false' otherwise.

###### 'pub fn get_private_chat_members(&self, chat_id: &Uuid) -> AppResult<Option<(Uuid, Uuid)>>'
- Returns the IDs of the two members of a private chat.
- Parameters:
  - 'chat_id' → Chat ID.
- Returns 'Some((user1, user2))' or 'None'.

---

#### Group Management

###### 'pub fn create_group(&self, name: &str, creator_id: &Uuid) -> AppResult<Uuid>'
- Create a new group and add the creator as a member.
- Parameters:
  - 'name' → group name.
  - 'creator_id' → ID of the creator user.
- The group ID returns.

###### 'pub fn add_group_member(&self, group_id: &Uuid, user_id: &Uuid) -> AppResult<()>'
- Adds a user to an existing group.
- Parameters:
  - 'group_id' → Group ID.
  - 'user_id' → User ID.
- Returns 'Ok(())' if this happens.

###### 'pub fn is_user_in_group(&self, user_id: &Uuid, group_id: &Uuid) -> AppResult<bool>'
- Check if a user is a member of a group.
- Parameters:
  - 'user_id' → User ID.
  - 'group_id' → Group ID.
- Returns 'true' or 'false'.

###### 'pub fn get_user_groups(&self, user_id: &Uuid) -> AppResult<Vec<(Uuid, String)>>'
- Retrieve all groups a user belongs to.
- Parameters:
  - 'user_id' → User ID.
- Returns a vector of '(group_id, group_name)'.

###### 'pub fn get_group_members(&self, group_id: &Uuid) -> AppResult<Vec<(Uuid, String)>>'
- Recover all members of a group.
- Parameters:
  - 'group_id' → Group ID.
- Returns a vector of '(user_id, username)'.

---

#### Message Management

###### 'pub fn insert_message(&self, sender_id: &Uuid, content: &str, private_chat_id: Option<&Uuid>, group_id: Option<&Uuid>) -> AppResult<Uuid>'
- Inserts a message into the database.
- Parameters:
  - 'sender_id' → ID of the sending user.
  - 'content' → message text.
  - 'private_chat_id' → Private chat ID (optional).
  - 'group_id' → Group ID (optional).
- The ID of the entered message returns.

###### 'pub fn get_private_chat_messages(&self, chat_id: &Uuid, limit: u32) -> AppResult<Vec<(Uuid, Uuid, String, String, i64)>>'
- Retrieve messages from a private chat.
- Parameters:
  - 'chat_id' → Chat ID.
  - 'limit' → maximum number of messages.
- Returns a vector of '(msg_id, sender_id, sender_username, content, sent_at)'.

###### 'pub fn get_group_messages(&self, group_id: &Uuid, limit: u32) -> AppResult<Vec<(Uuid, Uuid, String, String, i64)>>'
- Retrieve messages from a group.
- Parameters:
  - 'group_id' → Group ID.
  - 'limit' → maximum number of messages.
- Returns a vector of '(msg_id, sender_id, sender_username, content, sent_at)'.

---

#### Support functions

###### 'fn is_unique_violation(e: &rusqlite::Error) -> bool'
- Check if a SQLite error is due to a 'UNIQUE' constraint violation.

###### 'fn now_unix() -> i64'
- Returns the current timestamp in seconds from the Unix epoch.

---

### MODULE 'handlers.rs'

The 'handlers.rs' file manages **the server-side application logic** of the application.  
It processes client requests, interacts with the database via 'SqliteStorage' and sends notifications via 'PeerMap'.  

Use:

- 'SqliteStorage' → to persist and retrieve data from SQLite.
- 'auth' → for hashing and password verification.
- 'PeerMap' → shared structure with active client connections.
- 'shared' → shared types like 'UserInfo', 'PrivateChatInfo', 'GroupInfo', 'MessageInfo', 'ServerMsg'.

---

#### User Authentication and Search

##### 'pub fn handle_register(db: &SqliteStorage, username: String, password: String) -> AppResult<Uuid>'
- Register a new user.
- Parameters:
  - 'db' → reference to 'SqliteStorage'.
  - 'username' → username to register.
  - 'password' → clear password.
- Goal: Create the user with hashata password and return their 'Uuid'.
- Validations: Non-empty inputs.

##### 'pub fn handle_login(db: &SqliteStorage, username: String, password: String) -> AppResult<(Uuid, Uuid, String)>'
- Log in a user.
- Parameters:
  - 'db' → database.
  - 'username', 'password' → credentials.
- Returns a tuple '(session_token, user_id, username)'.
- Validations: hashata password verification, user existence.

##### 'pub fn handle_search_users(db: &SqliteStorage, token: Uuid, query: String) -> AppResult<Vec<UserInfo>>'
- Look for registered users who start with 'query', excluding the current user.
- Parameters:
  - 'token' → user session token.
  - 'query' → search string.
- Returns a vector of 'UserInfo'.

---

#### Private Chats

##### 'pub fn handle_start_private_chat(db: &SqliteStorage, peers: &PeerMap, token: Uuid, other_username: String) -> AppResult<Uuid>'
- Start a private chat between the current user and another user.
- Parameters:
  - 'peers' → map of clients connected for notifications.
  - 'other_username' → recipient.
- 'chat_id' returns.
- Real-time notification of the recipient via 'PeerMap'.

##### 'pub fn handle_get_private_chats(db: &SqliteStorage, token: Uuid) -> AppResult<Vec<PrivateChatInfo>>'
- Retrieve the user's private chats.
- Parameters:
  - 'token' → session token.
- Returns a vector of 'PrivateChatInfo'.

##### 'pub fn handle_get_private_chat_messages(db: &SqliteStorage, token: Uuid, chat_id: Uuid, limit: u32) -> AppResult<Vec<MessageInfo>>'
- Retrieve messages from a private chat.
- Parameters:
  - 'chat_id' → Private chat ID.
  - 'limit' → maximum number of messages.
- Validations: The user must belong to the chat.
- Returns a vector of 'MessageInfo'.

##### 'pub fn handle_send_private_message(db: &SqliteStorage, peers: &PeerMap, token: Uuid, chat_id: Uuid, content: String) -> AppResult<Uuid>'
- Send a message in a private chat.
- Parameters:
  - 'content' → message text.
- Validations: Non-empty, chat member user.
- Notify the other participant in real time via 'PeerMap'.
- Return 'message_id'.

---

#### Group Management

##### 'pub fn handle_create_group(db: &SqliteStorage, token: Uuid, name: String) -> AppResult<Uuid>'
- Create a new group.
- Parameters:
  - 'name' → group name.
- Validations: Non-empty name.
- Return 'group_id'.

##### 'pub fn handle_add_group_member(db: &SqliteStorage, peers: &PeerMap, token: Uuid, group_id: Uuid, username: String) -> AppResult<()>'
- Adds a member to an existing group.
- Parameters:
  - 'username' → user to add.
- Validations:
  - Only members can add others.
  - Not self-adding.
  - Not duplicates.
- Notify the new member in real time via 'PeerMap'.

##### 'pub fn handle_get_groups(db: &SqliteStorage, token: Uuid) -> AppResult<Vec<GroupInfo>>'
- Retrieve the groups the user belongs to.
- Returns a vector of 'GroupInfo'.

##### 'pub fn handle_get_group_members(db: &SqliteStorage, token: Uuid, group_id: Uuid) -> AppResult<Vec<UserInfo>>'
- Retrieve members of a group.
- Parameters:
  - 'group_id' → Group ID.
- Validations: User must be a member.
- Returns a vector of 'UserInfo'.

##### 'pub fn handle_get_group_messages(db: &SqliteStorage, token: Uuid, group_id: Uuid, limit: u32) -> AppResult<Vec<MessageInfo>>'
- Retrieve messages from a group.
- Parameters:
  - 'group_id' → Group ID.
  - 'limit' → maximum number of messages.
- Validations: User must be a member.
- Returns a vector of 'MessageInfo'.

##### 'pub fn handle_send_group_message(db: &SqliteStorage, peers: &PeerMap, token: Uuid, group_id: Uuid, content: String) -> AppResult<Uuid>'
- Send a message in a group.
- Parameters:
  - 'content' → message text.
- Validations: Non-empty, member user.
- Notify all connected members except the sender via 'PeerMap'.
- Return 'message_id'.

---

#### General notes

- All functions that require authentication verify the token via 'db.validate_session'.
- All functions return 'AppResult' for centralized error handling.
- 'PeerMap' allows you to send real-time notifications to connected clients via 'ServerMsg'.

---

### MODULE 'auth.rs'

The 'auth.rs' file handles **password authentication and security** server-side.  
It provides functionality to create secure hashes of passwords and verify them during login.

---

#### Libraries used

- **argon2** → password-safe hashing algorithm.
  - 'PasswordHash', 'PasswordHasher', 'PasswordVerifier', 'SaltString' → structures to generate and verify hashes.
  - 'Argon2' → concrete implementation of the Argon2 algorithm.
- **rand** → generate random jumps for the hash.
- 'AppResult' / 'AppError' → custom types for error handling.

---

#### Main functions

##### 'pub fn hash_password(password: &str) -> AppResult<String>'
- Objective: Generate a secure password hash.
- Parameters:
  - 'password' → clear password to protect.
- Operation:
  1. Generate a random **salt** using 'SaltString'.
  2. Apply **Argon2** to calculate the hash.
  3. Converts the hash to a string and returns it.
- Returns 'AppResult<String>' containing the hash or an error.

##### 'pub fn verify_password(password: &str, stored_hash: &str) -> AppResult<bool>'
- Objective: Check whether a provided password matches the stored hash.
- Parameters:
  - 'password' → clear password to verify.
  - 'stored_hash' → hash stored in the database.
- Operation:
  1. Parse the stored hash with 'PasswordHash::new'.
  2. Verify your password with 'Argon2::verify_password'.
  3. Returns 'true' if the password matches, 'false' otherwise.
- Returns 'AppResult<bool>'.

---

#### General notes

- All passwords saved in the database must be hashed using 'hash_password'.
- When logging in, 'verify_password' ensures that the provided password matches the stored hash without ever exposing the cleartext password.
- Using Argon2 with random salt ensures **resistance to dictionary and rainbow table attacks**.

---

### MODULE 'errors.rs'

The 'errors.rs' file handles **all custom errors and result types** of the server-side application.  
It provides a centralized system for representing validation, authentication, database, encryption, I/O, and serialization errors.

---

#### Libraries used

- **thiserror** → makes it easier to define enums for errors with readable messages.
- **rusqlite** → SQLite database errors.
- **argon2::password_hash** → password hash errors.
- **serde_json** → JSON serialization/deserialization errors.
- **std::io** → generic I/O errors.

---

#### Enum 'AppError'

Represents all possible application errors:

- 'Validation(String)' → invalid data or input, with descriptive message.
- 'UserExists' → attempting to register a user already present in the database.
- 'BadCredentials' → incorrect username or password when logging in.
- 'Db(#[from] rusqlite::Error)' → errors resulting from SQLite operations.
- 'Crypto(#[from] argon2::password_hash::Error)' → hashing/password verification errors.
- 'Serde(#[from] serde_json::Error)' → JSON serialization or deserialization errors.
- 'Io(#[from] std::io::Error)' → input/output errors.

> The '#[from]' attribute allows you to automatically convert errors from external libraries to 'AppError'.

---

#### Type 'AppResult<T>'

- Alias for 'Result<T, AppError>'.
- Used as the standard return type for all server-side functions.
- Ensures consistent error handling throughout your code.

---

### MODULE 'net.rs'

The 'net.rs' file handles **server-side TCP connections**, receiving messages from clients, forwarding to handlers ('handlers'), and handling push messages to connected clients.

---

#### Libraries used

- **futures_util::SinkExt, StreamExt** → utilities for working with asynchronous streams.
- **tokio::net::TcpStream** → handling asynchronous TCP connections.
- **tokio_util::codec::{Framed, LengthDelimitedCodec}** → to encapsulate TCP data as fixed-length delimited frames.
- **tokio::sync::mpsc** → asynchronous channels for push messages to clients.
- **uuid::Uuid** → unique identifiers for users, chats, and groups.
- **serde_json** → JSON serialization and deserialization of messages.
- Local modules: 'handlers', 'storage::SqliteStorage', 'errors::AppError', 'PeerMap'.

---

#### Main functions

##### 'serve_connection(sock: TcpStream, db_path: &'static str, peers: PeerMap)'

- **Description:** manages a single TCP connection with a client.
- **Parameters:**
  - 'sock' → the TCP connection to the client.
  - 'db_path' → SQLite database path.
  - 'peers' → shared map of clients connected by push send.
- **Operation:**
  1. Start a framed socket with 'LengthDelimitedCodec'.
  2. Create an instance of 'SqliteStorage'.
  3. Create an mpsc channel for push messages.
  4. Main loop:
     - Receives messages from clients ('ClientMsg') and forwards them to 'handle_client_msg'.
     - Receives push messages from the server and sends them to the client.
  5. Handles secure disconnection, removing the client from the 'peers' map only if it is not connected elsewhere.

---

##### 'handle_client_msg(msg: &ClientMsg, db: &SqliteStorage, peers: &PeerMap) -> ServerMsg'

- **Description:** maps messages received from clients to the appropriate handlers ('handlers') and returns the 'ServerMsg' response.
- **Parameters:**
  - 'msg' → message received from the client.
  - 'db' → reference to SQLite storage.
  - 'peers' → shared map of connected clients.
- **Operation:** 
  - Use a match on the 'ClientMsg' type.
  - For each message, call the corresponding 'handlers' module function.
  - Converts any errors to readable error messages via 'map_error'.

---

##### 'map_error(e: AppError) -> ServerMsg'

- **Description:** converts 'AppError' errors to client-readable messages ('ServerMsg::Error').
- **Parameters:**
  - 'e' → error to map.
- **Operation:** assigns a readable message depending on the type of error (e.g. 'UserExists' → "Username already in use").

---

##### 'send(framed: &mut Framed<TcpStream, LengthDelimitedCodec>, msg: &ServerMsg) -> Result<(), std::io::Error>'

- **Description:** sends a JSON-serialized 'ServerMsg' message over the TCP connection.
- **Parameters:**
  - 'framed' → reference to the TCP framed socket.
  - 'msg' → message to send.
- **Operation:** Serializes 'msg' to JSON and sends it as a delimited frame.

---

#### Notes on how it works

- **Asynchronous Connections:** All TCP read/write operations are asynchronous using Tokyo.
- **Message push:** via unicast mpsc channels to clients registered in the 'peers' map.
- **Session Security:** Each client must register to push ('ClientMsg::Listen') with a valid token.
- **Multi-connection management:** If a user reconnects, the old session is not removed if different from the current connection.

---

#### Supported messages

The module handles all messages defined in 'ClientMsg':

- Registration/login ('Register', 'Login')
- User Search ('SearchUsers')
- Private Chats ('StartPrivateChat', 'GetPrivateChats', 'GetPrivateChatMessages', 'SendPrivateMessage')
- Groups ('CreateGroup', 'AddGroupMember', 'GetGroups', 'GetGroupMembers', 'GetGroupMessages', 'SendGroupMessage')
- Unhandled messages are returned as a generic error.

---

### MODULE 'main.rs'

This file represents the server entry point written in Rust.  
His task is:

- initialize the database,
- start a thread dedicated to monitoring,
- open a TCP port,
- accept incoming connections,
- pass each connection to an asynchronous handler,
- maintain a shared map of connected users to manage push messages.

---

#### 1. Imported internal modules

Local modules containing:
- **errors**: Custom server error handling.
- **storage**: SQLite database management.
- **auth**: authentication functions.
- **handlers**: Managers of the various operations required by clients.
- **net**: Network functions, including 'serve_connection'.
- **monitoring**: module dedicated to server monitoring.

---

#### 2. Main constants and types

- 'DB_PATH': SQLite database path.
- 'PeerMap': A shared, thread-safe map that maps each 'Uuid' (user) to an 'mpsc::UnboundedSender' channel.  
  It is used to send real-time push messages to connected clients.

The combined use of 'Arc' (thread-safe reference counting) and 'Mutex' (mutual exclusion) allows multiple Tokio tasks to share and edit this map.

---

#### 3. Asynchronous main function

The 'main' function uses the '#[tokio::main]' attribute, so everything runs on an asynchronous Tokio runtime.

##### 3.1 Starting monitoring
A separate thread is launched via 'spawn_blocking' to monitor the server.  
This prevents monitoring from blocking Tokyo's asynchronous runtime.

---

##### 3.2 Database Initialization
'SqliteStorage::init(DB_PATH)' creates the necessary tables (if they don't exist).  
This stage acts as a “bootstrap” of the database.

---

##### 3.3 Creating the TCP listener
The server listens on port '7878' on all interfaces ('0.0.0.0').  
The listener is asynchronous thanks to 'tokio::net::TcpListener'.

---

##### 3.4 Creating the shared PeerMap
'peers' is an 'Arc<Mutex<HashMap<...>>>', so it can be cloned and shared across all connections.  
Each connected client can be registered in this map, allowing messages to be sent to specific clients.

---

##### 3.5 Main connection loop
The server enters an infinite loop that:

1. waits for a new connection ('listener.accept().await'),
2. clone the shared map,
3. Start a dedicated Tokio task to manage the single connection:  
   'tokio::spawn(serve_connection(socket, DB_PATH, peers))'.

Each connection is handled in parallel and independently of the others.

'serve_connection' takes care of:
- handshake,
- authentication,
- reading/writing messages,
- possible registration in the PeerMap.

---

#### Summary

In short, the 'main':

- Start a thread for monitoring,
- Initialize the SQLite DB,
- Listen for new TCP connections,
- Manages each client in a dedicated Tokyo task,
- Maintains a global, thread-safe map for sending messages to clients.

---

#### Generic communication flow between client and server

1. **Connection**  
   - The client connects to the TCP server ('TcpStream::connect') and establishes a framed channel ('Framed::new') to send/receive messages.
   - On the server ('main.rs'), 'TcpListener::bind' accepts new connections and for each starts 'serve_connection' in a separate task ('tokio::spawn').

2. **Listening and sending messages**  
   - The server uses a 'loop' loop with 'tokio::select!' to listen for both messages from the client ('framed.next()') and any push messages intended for the client ('rx_push.recv()').
   - The 'PeerMap' map ('Arc<Mutex<HashMap<Uuid, mpsc::UnboundedSender<ServerMsg>>>>') maintains an 'mpsc' channel for each online user to send push notifications (new messages, group updates, etc.).
   - The client, after login, starts a background listener ('listen_background') that listens on 'ServerMsg' push and sends the received events to the interface via 'mpsc::Sender<AppResult>'.

3. **Message Management**  
   - Messages received from the client are deserialized into 'ClientMsg'.
   - 'net.rs' calls 'handle_client_msg', which in turn invokes 'handlers.rs' functions for authentication, chat and group management, etc.
   - Responses are sent to the client as 'ServerMsg', and for online users, some actions trigger **push** via 'PeerMap' (e.g. new private chats or messages).

---

#### Specific flows

##### Registration

1. The client sends 'ClientMsg::Register { username, password }' via 'net.rs::register()'.
2. The server receives the message in 'serve_connection'.
3. 'handle_client_msg' calls 'handlers::handle_register':
   - Check for empty inputs
   - Hash the password ('auth::hash_password')
   - Inserts the user into the database ('SqliteStorage::insert_user')
4. The server responds with 'ServerMsg::Registered' or 'ServerMsg::Error'.
5. The client updates the status ('AppResult::RegisterSuccess'), displays the message, and redirects to the login view.

---

##### Login

1. The client sends 'ClientMsg::Login { username, password }' via 'net.rs::login()'.
2. The server handles the message in 'handle_client_msg' → 'handlers::handle_login':
   - Retrieve password hash from DB
   - Check with 'auth::verify_password'
   - Create session with token ('insert_session') and get 'user_id'
3. Response 'ServerMsg::LoginOk' is sent to the client.
4. The client stores 'session_token' and starts the listener in the background ('listen_background') to receive pushes.
5. The connection is added to 'PeerMap' when the client sends 'ClientMsg::Listen { token }'. This allows the server to send push messages to the online client.

---

##### Logout

1. The client clears local session ('session_token', 'user_id', 'username') and cleans local data ('private_chats', 'groups', 'current_messages').
2. The server, when the TCP connection closes, removes the user from the 'PeerMap' ONLY if the channel matches the outgoing connection. This avoids deleting active sessions if the user is connected elsewhere.

---

##### User Search

1. The client sends 'ClientMsg::SearchUsers { token, query }'.
2. The server validates the session ('db.validate_session') and calls 'handlers::handle_search_users'.
3. The DB returns the users that match the query (excluding the current user).
4. The 'ServerMsg::UsersFound' response is sent to the client, which updates 'search_results' and the GUI.

---

##### Creating and sending messages in private chat

1. The client sends 'ClientMsg::StartPrivateChat { token, other_username}' to create the chat, and then 'ClientMsg::SendPrivateMessage { token, chat_id, content}'.
2. The server:
   - Verify session and chat members ('validate_session', 'is_user_in_private_chat')
   - Inserts the message into the DB ('insert_message')
   - Retrieve the other user's ID
   - If the other user is online, push to 'PeerMap' with 'ServerMsg::PushNewMessage'.
3. The client receives the push via 'listen_background' and updates the chat in real time.

---

##### Creating and sending messages in group chat

1. The client sends 'ClientMsg::CreateGroup { token, name }' or 'ClientMsg::SendGroupMessage { token, group_id, content }'.
2. The server:
   - Verify session and group members ('validate_session', 'is_user_in_group')
   - Inserts the message into the DB ('insert_message')
   - Recover group members
   - For each online member (tracked in 'PeerMap'), push 'ServerMsg::PushNewMessage' with 'group_id'.
3. The client receives the pushes, and if the group chat is open, it updates 'current_messages'.

---

##### Note on using the 'PeerMap'

- The 'PeerMap' serves as an **log of online users** with their push communication channel.
- Whenever a user logs in or listens ('ClientMsg::Listen'), the server adds an entry 'user_id -> tx_push'.
- When a private or group message is created, the server checks whether recipients are online in 'PeerMap' and sends pushes in real time.
- This mechanism allows for immediate notifications without the client having to continuously query the server.

---

In summary, the Client ↔ Server flow works like this:

1. TCP connection → framed codec → JSON serialization  
2. Session validation and request management using 'handlers.rs'  
3. Instant Responses ('ServerMsg') + Push Notifications for Online Users ('PeerMap')  
4. Client GUI updates local states and displays messages, chats, and groups in real time.

