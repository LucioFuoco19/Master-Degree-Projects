# End-to-End Test Suite for the Messaging Server

This directory contains the suite of **end-to-end (E2E) tests** developed to verify the real behavior of the messaging server.  
The tests start an actual server instance, connect via TCP (with length-delimited codecs), and exchange messages using the application-defined protocol.

The goal is to control not only that individual server functions are correct, but that the entire system —network, user management, groups, messaging, and persistence — operates under realistic conditions.

The suite is composed of:

- **'e2e_functionals.rs'** — Main user flow functional tests
- **'e2e_stress_tests.rs'** — Load, concurrency, and behavior testing under stress

---

# Test objectives

The suite checks that:

- The **client-server protocol** is implemented correctly end-to-end.
- The main application operations (registration, login, groups, messages) work in real-world scenarios.
- The server maintains consistent behavior even in the presence of:
  - more active users,
  - high number of messages,
  - delays,
  - reconnections,
  - limit conditions.
- No structural errors such as deadlocks, race conditions, or execution blocks emerge.

These tests therefore allow us to evaluate **correctness, consistency and robustness** of the entire system.

---

# File contents

## 1. 'e2e_functionals.rs' — Full functional tests

These tests reproduce typical application flows and verify the logical correctness of the server.

### Tested features

- **Registration of new users**  
  Verify that the server handles account creation correctly.

- **Login and session management**  
  Controls server response and user identity recognition.

- **Private messages between two users**  
  Tests verify:
  - the sending,
  - reception,
  - the order of messages,
  - the correctness of the metadata.

- **Creating groups and adding members**  
  The server must create a new group and correctly recognize the invited members.

- **Sending and receiving messages in groups**  
  It is verified:
  - the delivery to all members of the group,
  - the absence of duplicates,
  - the coherence of the order.

- **Checking message metadata ('MessageInfo')**  
  Including:
  - author,
  - timestamp,
  - Group or recipient ID,
  - content.

- **Managing expected errors**  
  As:
  - user not logged in,
  - non-existent group,
  - messages to absent users,
  - unauthorized access attempts.

These tests demonstrate that the server logic is implemented correctly and that the protocol responds consistently and predictably.

---

## 2. 'e2e_stress_tests.rs' — Stress and Concurrency Testing

These tests evaluate the stability of the server under challenging conditions.

### Simulated situations

- **Simultaneous connections from multiple users**  
  It is used to evaluate whether the server is able to quickly accept multiple connections without degrading.

- **Concurrent sending of private and group messages**  
  Several asynchronous tasks send messages in parallel.

- **High-intensity message barurst**  
  The goal is to identify system bottlenecks or unexpected slowdowns.

- **Checked timeouts on server responses**  
  Tests fail if the server does not respond within a defined time window, checking the system's responsiveness.

- **Repeated group creation and management**  
  Check the robustness of the group management algorithm and the consistency of the internal state.

### What they highlight

- **Server Scalability**  
  The server maintains stable performance even when traffic increases.

- **Robustness of asynchronous implementation (Tokyo)**  
  If no deadlocks or abnormal delays occur, concurrency management is correct.

- **Resistance to non-ideal conditions**  
  Like many queued messages, delays, groups created and deleted quickly, etc.

---

### How to run tests

"'text
cargo test -p server --test e2e_functionals - --nocapture
"'

"'text
cargo test -p server --test e2e_stress_tests - --nocapture
"'

## 3. 'e2e_private_chat.rs' - Stress test on private chat

This module implements a **End-to-End (E2E) load test** for the chat server. Unlike unit tests, this test starts a real server instance in a separate process and simulates real TCP clients interacting with it.

### Test Objectives

1.  **Stress Test:** Check server stability under increasing load (up to 150 competing clients).
2.  **Competition:** Ensure that the server properly handles concurrent connections and message broadcasting.
3.  **Persistence and Reliability:** Measure system efficiency by comparing messages sent with those actually processed.

---

### Test Architecture

#### 1. The Simulated Client ('TestClient')
The 'TestClient' struct acts as a real user. Each instance:
* Opens a TCP connection to '127.0.0.1'.
* Use 'Framed<TcpStream>' with 'LengthDelimitedCodec' for package management.
* Automatically executes the authentication flow:
    1.  **Register:** New user registration.
    2.  **Login:** Accessing and getting the 'session_token'.
    3.  **Listen:** Subscribe to the incoming event stream.

#### 2. Server Process Management
The test is standalone and does not require an already active server:
* **Spawn:** Compiles and starts the 'server' binary as a child process ('Child').
* **Random Port:** Select a random port (9000-10000) to avoid conflicts between parallel tests.
* **Isolated DB:** Creates a temporary SQLite database for each scenario, which is deleted at the end of the test.

---

### Execution Flow ('scenario_run')

The 'run_scenario' function orchestrates a single level of testing by following these steps:

1.  **Boot:** Starts the server and waits for the TCP port to be reachable.
2.  **Population:** Creates 'N' clients and connects them to the server.
3.  **Creating Chat Ring:**
    * Each user 'i' starts a private chat with the next user '(i + 1)'.
    * This ensures that each client is both sender and recipient.
4.  **Synchronization (Barrier):**
    * A 'tokio::sync::Barrier' is used to ensure that **all** clients start sending messages in the same millisecond, maximizing peak load.
5.  **Load Loop:**
    * For a defined duration (e.g. 60s), each client sends a message and waits for the ack ('PrivateMessageSent').
6.  **Report & Cleanup:**
    * The results are calculated and written to files.
    * The server is terminated ('kill') and temporary files are removed.

---

### Test Scenarios

The test sequentially runs 5 scenarios of increasing difficulty. Each scenario lasts **60 seconds** with a rate of **1 message/second** per user.

| Scenario | Users (Thread) | Expected Total Messages (approx) | Description |
| :- | :- | :- | :- | :--- |
| **Test 1** | 10 | 600 | Basic Warm-up. |
| **Test 2** | 25 | 1,500 | Light load. |
| **Test 3** | 50 | 3,000 | Average load. |
| **Test 4** | 100 | 6,000 | High load. |
| **Test 5** | 150 | 9,000 | Maximum stress test. |

> **Note:** The test is configured with 'worker_threads = 16' to ensure that the testing framework does not become the bottleneck when simulating 150 clients.

---

### How to run the test

"'text
cargo test -p server --test e2e_private_chat
"'

### Logging Results

The results are not only displayed in the console, but are hung on the file:
'server/tests/results/e2e_private_chat_res.txt'

The log format allows you to track performance over time:

"'text
__________________________________________
TEST 5:
- Info: 150 Users, 60 sec duration, 1000 ms interval
- Date: 27/11/2023 10:00
- Result: 8950 / 9000 messages (Efficiency 99.44%)
__________________________________________
"'

## 3. 'e2e_private_chat_monitoring.rs' - Stress Test & Database Tuning Optimization

When running Stress Tests (especially the scenario with **250 concurrent users** added during monitoring), 
criticalities related to concurrency on the sqlite database and system resource management emerged. 
This section documents the problems encountered and the technical solutions implemented to achieve **100% efficiency**.

### How to run the test

"'text
cargo test -p server --test e2e_private_chat_monitoring
"'

### 1. Analysis of Problems

#### Locked & Low Efficiency Database
In **Test 6 (250 users)**, initial efficiency plummeted to **64.61%**, with high CPU usage and frequent lock errors.

"'text
TEST 6:
- Info: 250 Users, 60 sec duration
- Performance Server: Avg CPU: 84.10%
- Result: 9691 / 15000 messages (Efficiency 64.61%)

[SERVER ERROR]: db error: database is locked
[SERVER ERROR]: db error: database is locked
"'

**Cause**: SQLite is a file-based database that, by default, allows only one writer at a time. When 250 users attempt to send messages simultaneously, an unmanageable write queue is created. If a thread waits for the lock beyond the limit, SQLite times out.

#### Timestamp & Message Sorting

**Cause**: The original function used as_secs() (seconds). Under stress testing, hundreds of messages were saved with the exact same timestamp (e.g., 1700001234), making chronological sorting (ORDER BY sent_at DESC) unpredictable.

### 2. Solutions: Database Tuning ('storage.rs')

We reconfigured 'SqliteStorage::new' with three PRAGMA directives critical to high concurrency and improved timing accuracy.

#### SQLite Configuration
1. **'journal_mode = WAL' (Write-Ahead Logging)**
    * Instead of locking the entire database, writes occur to a separate file ('.wal').
    * 
    * **Result:** Readers and writers can operate simultaneously without crashing.

2. **'busy_timeout = 5000'**
    * Set a wait time of 5 seconds. If the DB is busy, the server waits instead to return an immediate error.

3. **'synchronous = FULL'**
    * Initially set to 'NORMAL' for speed, it caused login errors ("Incorrect Credentials") because the 'SELECT' occurred before the 'INSERT' of the recording was physically written to disk (Race Condition).
    * **Result:** By reverting it to 'FULL', we ensure immediate persistence of the data, eliminating login errors.

#### Timestamp Accuracy
We updated the 'now_unix' function to use milliseconds:

"'rust
fn now_unix() -> i64 {
    use std::time::{SystemTime, UNIX_EPOCH};
    // Use as_millis() instead of as_secs()
    SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis() as i64
}
"'

**Result**: Sorting conflicts are statistically eliminated.

### 3. Optimization Stress Test Code

To prevent the test itself from becoming the bottleneck (false negatives), we applied several architectural optimizations to the test client:

#### 🚦 Traffic Shaping (Ramp-up)
* **Problem:** Throwing 250 connections in the same millisecond caused a "Thundering Herd", saturating the server instantly.
* **Solution:** Inserted a micro-pause ('5ms') between connecting one client and another in the initialization loop.

#### 🔄 Smart Retry (Resilience)
* **Logic:** With SQLite in synchronous WAL mode, there is minimal physical write latency.
* **Solution:** If login fails ("Incorrect credentials" or "Database locked"), the client does not crash but waits **200ms** and tries again. Also, in case of a saturated TCP port, retry the connection for up to 10 seconds.

#### 📉 Low Frequency Monitoring
* **Problem:** The 'sysinfo' library was consuming too much CPU by updating every second, stealing resources from the server.
* **Solution:** Reduced the sampling rate to **3 seconds**.

#### 🧵 Tokyo Worker Threads
* **Configuration:** '#[tokio::test(flavor = "multi_thread", worker_threads = 32)]'
* **Advantage:** Increasing threads to 32 allows the asynchronous runtime to better handle the 250 client + server + monitoring tasks, reducing context switching.