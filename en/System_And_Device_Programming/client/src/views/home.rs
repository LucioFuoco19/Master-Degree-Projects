use eframe::egui::{self, Align, Color32, Layout, RichText, Rounding, Stroke, vec2, FontFamily};
use crate::app::{App, View};

pub fn show(app: &mut App, ui: &mut egui::Ui) {
    // 1. It takes up all the space and centers the content (the Card) vertically and horizontally
    ui.centered_and_justified(|ui| {

        // 2. La "Card" (il riquadro grigio scuro)
        egui::Frame::none()
            .fill(ui.style().visuals.window_fill().linear_multiply(1.3)) // Color slightly staccato from the background
            .rounding(Rounding::same(20.0)) // Arrotonded corners
            .stroke(Stroke::new(1.0, Color32::from_white_alpha(15))) // Elegant sottile bordo
            .inner_margin(40.0) // Abundant internal margin
            .show(ui, |ui| {

                // 3. Vertical Layout Centered for card content
                ui.vertical_centered(|ui| {

                    // --- LOGO / EMOJI ---
                    ui.label(
                        RichText::new("🦀")
                            .family(FontFamily::Proportional)
                            .size(80.0)
                    );

                    ui.add_space(15.0);

                    // --- TITLE ---
                    ui.heading(
                        RichText::new("Ruggine")
                            .size(42.0)
                            .strong()
                            .color(Color32::from_gray(240))
                    );

                    ui.add_space(8.0);

                    // - SUBTITLE ---
                    ui.label(
                        RichText::new("Secure, fast, and... oxidized chat.")
                            .size(15.0)
                            .color(Color32::from_gray(170))
                            .italics()
                    );

                    ui.add_space(40.0); // Space between text and buttons

                    // - BUTTONS CENTERED BELOW THE TEXT ---
                    // Button size and spacing
                    let btn_width = 130.0;
                    let btn_height = 45.0;
                    let btn_spacing = 20.0;
                    let total_width = 2.0 * btn_width + btn_spacing;

                    ui.horizontal(|ui| {
                        // Calculate padding on the left to center the button group
                        let available = ui.available_width();
                        let left_pad = ((available - total_width).max(0.0)) / 2.0;
                        ui.add_space(left_pad);

                        // LOGIN button
                        let login_btn = egui::Button::new(
                            RichText::new("🔐  Login")
                                .size(16.0)
                                .strong()
                                .color(Color32::WHITE)
                        )
                            .min_size(vec2(btn_width, btn_height))
                            .rounding(Rounding::same(12.0))
                            .fill(Color32::from_rgb(0, 110, 210)); // Bright blue

                        if ui.add(login_btn).on_hover_text("Sign in").clicked() {
                            app.nav(View::Login);
                        }

                        ui.add_space(btn_spacing);

                        // REGISTER button
                        let reg_btn = egui::Button::new(
                            RichText::new("📝  Register")
                                .size(16.0)
                                .strong()
                                .color(Color32::from_gray(220))
                        )
                            .min_size(vec2(btn_width, btn_height))
                            .rounding(Rounding::same(12.0))
                            .fill(Color32::from_rgb(50, 50, 50)) // Dark gray
                            .stroke(Stroke::new(1.0, Color32::from_gray(80)));

                        if ui.add(reg_btn).on_hover_text("Create account").clicked() {
                            app.nav(View::Register);
                        }
                    });
                });
            });
    });
}
