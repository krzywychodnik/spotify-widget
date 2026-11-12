// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::io::{Read, Write};
use std::net::TcpListener;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::thread;
use tauri::{Emitter, Manager, Size, LogicalSize, Position, PhysicalPosition};

#[derive(Clone, serde::Serialize)]
struct OAuthCallbackPayload {
    code: String,
    state: Option<String>,
}

#[tauri::command]
fn resize_widget(
    window: tauri::Window,
    width: f64,
    height: f64,
    anchor_top_right: Option<bool>,
) -> Result<(), String> {
    if anchor_top_right.unwrap_or(false) {
        let scale = window.scale_factor().unwrap_or(1.0);
        let cur_pos = window.outer_position().map_err(|e| e.to_string())?;
        let cur_size = window.outer_size().map_err(|e| e.to_string())?;

        let cur_w_logical = cur_size.width as f64 / scale;
        let delta_x_logical = cur_w_logical - width;
        let delta_x_physical = (delta_x_logical * scale).round() as i32;

        let new_pos = PhysicalPosition {
            x: cur_pos.x + delta_x_physical,
            y: cur_pos.y,
        };

        let _ = window.set_position(Position::Physical(new_pos));
        let _ = window.set_size(Size::Logical(LogicalSize { width, height }));
    } else {
        let _ = window.set_size(Size::Logical(LogicalSize { width, height }));
    }
    Ok(())
}

#[tauri::command]
fn set_always_on_top(window: tauri::Window, always_on_top: bool) -> Result<(), String> {
    window
        .set_always_on_top(always_on_top)
        .map_err(|e| e.to_string())
}

fn start_local_oauth_listener(app_handle: tauri::AppHandle) {
    let running = Arc::new(AtomicBool::new(true));

    thread::spawn(move || {
        let listener = match TcpListener::bind("127.0.0.1:8888") {
            Ok(l) => l,
            Err(e) => {
                eprintln!("[Spotify Widget] Could not bind to 127.0.0.1:8888: {e}");
                return;
            }
        };

        println!("[Spotify Widget] Local OAuth callback listener running on http://127.0.0.1:8888");

        while running.load(Ordering::Relaxed) {
            if let Ok((mut stream, _)) = listener.accept() {
                let mut buffer = [0; 2048];
                if let Ok(bytes_read) = stream.read(&mut buffer) {
                    let request = String::from_utf8_lossy(&buffer[..bytes_read]);

                    // Example: GET /callback?code=NApCCg...&state=xyz HTTP/1.1
                    if let Some(first_line) = request.lines().next() {
                        if first_line.starts_with("GET /callback") {
                            let mut code = String::new();
                            let mut state = None;

                            if let Some(query_start) = first_line.find('?') {
                                if let Some(query_end) = first_line.find(" HTTP/") {
                                    let query = &first_line[query_start + 1..query_end];
                                    for part in query.split('&') {
                                        if let Some((k, v)) = part.split_once('=') {
                                            if k == "code" {
                                                code = v.to_string();
                                            } else if k == "state" {
                                                state = Some(v.to_string());
                                            }
                                        }
                                    }
                                }
                            }

                            if !code.is_empty() {
                                // Emit to frontend
                                let _ = app_handle.emit(
                                    "spotify-oauth-callback",
                                    OAuthCallbackPayload {
                                        code: code.clone(),
                                        state,
                                    },
                                );

                                let html_response = r#"<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="utf-8">
  <title>Spotify Widget - Sukces</title>
  <style>
    body {
      background: #121212;
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
    }
    .card {
      background: #181818;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      padding: 40px;
      text-align: center;
      max-width: 400px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.6);
    }
    h1 { color: #1DB954; font-size: 24px; margin-bottom: 12px; }
    p { color: #b3b3b3; font-size: 14px; line-height: 1.6; }
    .badge {
      display: inline-block;
      margin-top: 20px;
      background: rgba(29,185,84,0.15);
      color: #1DB954;
      padding: 6px 14px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>Autoryzacja udana!</h1>
    <p>Połączono widget ze Spotify. Możesz teraz zamknąć tę kartę i wrócić do aplikacji.</p>
    <div class="badge">Spotify Mini-Player Active</div>
  </div>
</body>
</html>"#;

                                let response = format!(
                                    "HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{}",
                                    html_response.len(),
                                    html_response
                                );
                                let _ = stream.write_all(response.as_bytes());
                                let _ = stream.flush();
                                continue;
                            }
                        }
                    }

                    // Fallback 404
                    let not_found = "HTTP/1.1 404 NOT FOUND\r\nContent-Length: 0\r\nConnection: close\r\n\r\n";
                    let _ = stream.write_all(not_found.as_bytes());
                }
            }
        }
    });
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![resize_widget, set_always_on_top])
        .setup(|app| {
            let app_handle = app.handle().clone();

            // Start local OAuth server
            start_local_oauth_listener(app_handle);

            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_always_on_top(true);
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
