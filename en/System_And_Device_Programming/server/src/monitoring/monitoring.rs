// === FIX: Clean imports for sysinfo 0.30 (No more *Ext) ===
use sysinfo::{System, RefreshKind, ProcessRefreshKind, Pid}; 
// =============================================================
use std::time::Duration;
use std::fs::OpenOptions;
use std::io::Write;
use chrono::Local;
use std::process;

const LOG_FILE_NAME: &str = "server_cpu_log.txt";
const LOG_INTERVAL_SECS: u64 = 120; // 2 minutes

/// Utility function to write a message to the log file with timestamp.
fn write_log(message: &str) -> std::io::Result<()> {
    // Open the file in append mode and create it if it doesn't exist
    let mut file = OpenOptions::new()
        .append(true)
        .create(true)
        .open(LOG_FILE_NAME)?;

    // Get the current time and format
    let timestamp = Local::now().format("%Y-%m-%d %H:%M:%S").to_string();

    writeln!(file, "[{}] {}", timestamp, message)?;

    Ok(())
}

/// Start the server's CPU monitoring loop.
pub fn start_monitoring() {
    // In sysinfo 0.30, from_u32 is a direct method of Pid, no PidExt needed
    let pid = Pid::from_u32(process::id());

    // Refresh Configuration: We ask everything about processes to make sure we have the CPU
    let refresh_config = RefreshKind::new().with_processes(ProcessRefreshKind::everything());
    
    // Initialize the System
    let mut sys = System::new_with_specifics(refresh_config);

    println!("[MONITORING] Starting CPU monitoring for PID: {}", pid);

    // Wait a moment to allow the system to collect the first sample (necessary for CPU calculation)
    std::thread::sleep(Duration::from_millis(500));
    sys.refresh_processes();

    loop {
        // Update process data from the operating system
        // refresh_processes is now a direct method of System, no SystemExt needed
        sys.refresh_processes();

        if let Some(process) = sys.process(pid) {
            // cpu_usage is now a direct Process method, no ProcessExt needed
            let cpu_usage = process.cpu_usage();

            let log_message = format!("CPU Usage: {:.2}%", cpu_usage);

            match write_log(&log_message) {
                Ok(_) => {
                    println!("[MONITORING] Write Log: {}", log_message);
                },
                Err(e) => eprintln!("[MONITORING] Error writing log: {}", e),
            }
        } else {
            eprintln!("[MONITORING] Server process not found. Stopping monitoring.");
            break;
        }

        // Wait 2 minutes (120 seconds)
        std::thread::sleep(Duration::from_secs(LOG_INTERVAL_SECS));
    }
}