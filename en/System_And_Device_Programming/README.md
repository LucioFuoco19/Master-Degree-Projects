# 🦀 Rust – Client/Server Text Chat in Rust

Ruggine is a **client/server** application built in **Rust** to manage multi–user text chats.  
The project implements an architecture with **TCP** communication and **JSON** payload, leveraging **Tokio** for concurrency and **egui/eframe** for client-side GUI.

---

## ⚙️ General architecture

- **Protocol**: TCP with length codec ('tokio_util::codec::LengthDelimitedCodec').
- **Messages**: Swapping 'ClientMsg' ↔ 'ServerMsg' serialized to JSON.
- **Authentication**: Passwords encrypted with **Argon2 + salt**.
- **Database**: Local SQLite ('rusqlite').
- **Platforms tested**: Windows and Linux.

---
After the gitclone, make cargo run from terminal to build the project
- To run:
 - From the first cargo terminal run -p client
 - From the second cargo terminal run -p server
