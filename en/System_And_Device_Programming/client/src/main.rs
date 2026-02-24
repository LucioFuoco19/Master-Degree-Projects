mod app;
mod net;
mod views;

use eframe::egui::{self, FontData, FontDefinitions, FontFamily};
use std::sync::Arc; // Importante per FontData

/// Helper function to configure the theme at startup
fn setup_custom_theme(ctx: &egui::Context) {
    // - 1. LOADING EMOJI FONT ---
    let mut fonts = FontDefinitions::default();


    if let Ok(font_data) = std::fs::read("./client/src/emoji.ttf") {
        println!("Emoji.ttf loading successful.");

        // Register the font in the egui system
        fonts.font_data.insert(
            "emoji_font".to_owned(),
            FontData::from_owned(font_data).tweak(
                // Optional Tweak: Scale emojis slightly if they appear small
                egui::FontTweak {
                    scale: 1.0,
                    ..Default::default()
                }
            ),
        );

        // Add the emoji font to the QUEUE of the font families.
        // Egui will use the first font for plain text, and search in "emoji_font"
        // only if it doesn't find the character in the first one (e.g. for the 🦀).

        // For proportional text (buttons, standard label)
        fonts.families
            .entry(FontFamily::Proportional)
            .or_default()
            .push("emoji_font".to_owned());

        // For monospaced text (code, log)
        fonts.families
            .entry(FontFamily::Monospace)
            .or_default()
            .push("emoji_font".to_owned());

    } else {
        println!("⚠️ 'emoji.ttf' not found! Emojis might not appear.");
    }

    // Apply the font
    ctx.set_fonts(fonts);

    // - 2. STYLE AND COLOR SETTING (Unchanged) ---
    let mut style = (*ctx.style()).clone();
    let visuals = &mut style.visuals;

    visuals.dark_mode = true;
    visuals.override_text_color = Some(egui::Color32::from_gray(240));
    visuals.window_fill = egui::Color32::from_rgb(27, 27, 27);
    visuals.panel_fill = egui::Color32::from_rgb(27, 27, 27);
    visuals.extreme_bg_color = egui::Color32::from_rgb(18, 18, 18);

    visuals.widgets.noninteractive.bg_fill = egui::Color32::from_rgb(27, 27, 27);
    visuals.widgets.noninteractive.fg_stroke.color = egui::Color32::from_gray(240);
    visuals.widgets.noninteractive.rounding = egui::Rounding::same(8.0);

    visuals.widgets.inactive.bg_fill = egui::Color32::from_rgb(42, 42, 42);
    visuals.widgets.inactive.rounding = egui::Rounding::same(8.0);

    visuals.widgets.hovered.bg_fill = egui::Color32::from_rgb(60, 60, 60);
    visuals.widgets.hovered.rounding = egui::Rounding::same(8.0);

    visuals.widgets.active.bg_fill = egui::Color32::from_rgb(80, 80, 80);
    visuals.widgets.active.rounding = egui::Rounding::same(8.0);

    visuals.selection.bg_fill = egui::Color32::from_rgb(0, 120, 215);
    visuals.selection.stroke.color = egui::Color32::WHITE;

    visuals.window_rounding = egui::Rounding::same(8.0);

    visuals.window_shadow = egui::epaint::Shadow {
        offset: egui::vec2(2.0, 2.0),
        blur: 5.0,
        spread: 1.0,
        color: egui::Color32::from_black_alpha(60),
    };

    style.spacing.item_spacing = egui::vec2(10.0, 10.0);
    style.spacing.window_margin = egui::Margin::same(12.0);

    ctx.set_style(style);
}

fn main() -> eframe::Result<()> {
    let options = eframe::NativeOptions {
        viewport: egui::ViewportBuilder::default()
            .with_inner_size([800.0, 600.0])
            .with_title("Ruggine"),
        ..Default::default()
    };

    eframe::run_native(
        "Ruggine",
        options,
        Box::new(|cc| {
            setup_custom_theme(&cc.egui_ctx);
            Box::<app::App>::default()
        }),
    )
}