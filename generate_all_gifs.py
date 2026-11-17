import math
import os
from PIL import Image, ImageDraw, ImageFont

os.makedirs("web/public/gifs", exist_ok=True)

# Try to find a standard font, or default to bitmap
try:
    font_sm = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 10)
    font_md = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 12)
    font_bold = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 14)
    font_lg = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 18)
    font_mono = ImageFont.truetype("/System/Library/Fonts/Monaco.dfont", 11)
except Exception:
    font_sm = ImageFont.load_default()
    font_md = ImageFont.load_default()
    font_bold = ImageFont.load_default()
    font_lg = ImageFont.load_default()
    font_mono = ImageFont.load_default()


# ==============================================================================
# 1. USSD DIALING & MENU ANIMATION (ussd-dial.gif)
# ==============================================================================
def create_ussd_dial_gif():
    frames = []
    width, height = 360, 200
    num_frames = 36

    for f in range(num_frames):
        img = Image.new("RGBA", (width, height), (15, 23, 42, 255)) # Dark slate
        draw = ImageDraw.Draw(img)

        # Phone LCD Frame (Retro green backlight)
        lcd_rect = [20, 16, width - 20, height - 16]
        draw.rounded_rectangle(lcd_rect, radius=12, fill=(16, 36, 28, 255), outline=(52, 211, 153, 180), width=2)

        # LCD Status bar
        draw.text((32, 24), "📶 Orange SL 2G", fill=(52, 211, 153, 220), font=font_sm)
        draw.text((width - 80, 24), "100% 🔋", fill=(52, 211, 153, 220), font=font_sm)
        draw.line([(32, 40), (width - 32, 40)], fill=(52, 211, 153, 80), width=1)

        # Sequence of screens:
        # Frames 0-9: Dialing *714#
        # Frames 10-22: Menu Tree
        # Frames 23-35: Success & Balance
        if f < 10:
            cursor = "_" if (f % 4 < 2) else " "
            draw.text((50, 75), f"Dialing *714#{cursor}", fill=(255, 255, 255, 255), font=font_lg)
            draw.text((50, 110), "Connecting to Fambul Fund...", fill=(52, 211, 153, 200), font=font_md)
            draw.text((50, 140), "No internet required (GSM USSD)", fill=(148, 163, 184, 255), font=font_sm)
        elif f < 24:
            draw.text((32, 46), "FAMBUL FUND (*714#)", fill=(245, 158, 11, 255), font=font_bold)
            draw.text((32, 70), "1. My Wallet & Envelopes", fill=(255, 255, 255, 255), font=font_mono)
            draw.text((32, 90), "2. My Osusu (Turn: 24 Nov)", fill=(255, 255, 255, 255), font=font_mono)
            draw.text((32, 110), "3. Pot Advance & Loans", fill=(255, 255, 255, 255), font=font_mono)
            draw.text((32, 130), "4. Record Sale / Harvest", fill=(255, 255, 255, 255), font=font_mono)
            draw.text((32, 150), "5. Farmgate Prices  00. Home", fill=(52, 211, 153, 200), font=font_mono)
        else:
            # Result screen
            draw.text((32, 46), "TRANSACTION CONFIRMED", fill=(52, 211, 153, 255), font=font_bold)
            draw.text((32, 74), "Kushe Aminata!", fill=(255, 255, 255, 255), font=font_md)
            draw.text((32, 96), "Wallet: SLE 3,450.00", fill=(245, 158, 11, 255), font=font_bold)
            draw.text((32, 120), "Osusu Score: 88.8 (Tier A)", fill=(52, 211, 153, 255), font=font_mono)
            draw.text((32, 145), "SMS sent to +232 76 123456", fill=(148, 163, 184, 255), font=font_sm)

        frames.append(img.convert("P", palette=Image.ADAPTIVE))

    frames[0].save(
        "web/public/gifs/ussd-dial.gif",
        save_all=True,
        append_images=frames[1:],
        duration=90,
        loop=0
    )
    print("Created web/public/gifs/ussd-dial.gif")


# ==============================================================================
# 2. CREDIT SCORE GAUGE & PILLARS (credit-score-gauge.gif)
# ==============================================================================
def create_credit_score_gif():
    frames = []
    width, height = 340, 200
    num_frames = 30
    cx, cy = 100, 105
    radius = 65

    for f in range(num_frames):
        img = Image.new("RGBA", (width, height), (11, 19, 43, 255)) # Dark obsidian navy #0B132B
        draw = ImageDraw.Draw(img)

        # Title
        draw.text((20, 12), "TRANSPARENT CREDIT SCORING (v0)", fill=(148, 163, 184, 255), font=font_sm)

        # Progress animation from 50 to 88.8
        pct = min(1.0, (f / (num_frames - 6)))
        current_score = 50.0 + (38.8 * pct)

        # Outer background arc
        draw.arc([cx - radius, cy - radius, cx + radius, cy + radius], start=135, end=405, fill=(30, 41, 59, 255), width=8)

        # Active glowing arc
        end_angle = 135 + int(270 * (current_score / 100.0))
        draw.arc([cx - radius, cy - radius, cx + radius, cy + radius], start=135, end=end_angle, fill=(1, 128, 255, 255), width=8)

        # Score text in center
        draw.text((cx - 28, cy - 18), f"{current_score:.1f}", fill=(255, 255, 255, 255), font=font_lg)
        draw.text((cx - 24, cy + 8), "TIER A 🌟", fill=(16, 185, 129, 255), font=font_sm)

        # 5 Pillars Breakdown on right
        pillars = [
            ("Consistency (35%)", 94, (1, 128, 255)),
            ("Repayment (25%)", 90, (16, 185, 129)),
            ("Buyer Sales (20%)", 85, (245, 158, 11)),
            ("Tenure & Size (10%)", 80, (139, 92, 246)),
            ("Ledger Logs (10%)", 88, (14, 165, 233)),
        ]

        rx = 185
        ry = 36
        for name, score_val, col in pillars:
            draw.text((rx, ry), name, fill=(203, 213, 225, 255), font=font_sm)
            # Bar track
            draw.rounded_rectangle([rx, ry + 14, rx + 130, ry + 18], radius=2, fill=(30, 41, 59, 255))
            # Filled bar
            fill_w = int(130 * (score_val / 100.0) * pct)
            draw.rounded_rectangle([rx, ry + 14, rx + fill_w, ry + 18], radius=2, fill=col)
            ry += 28

        frames.append(img.convert("P", palette=Image.ADAPTIVE))

    frames[0].save(
        "web/public/gifs/credit-score-gauge.gif",
        save_all=True,
        append_images=frames[1:],
        duration=70,
        loop=0
    )
    print("Created web/public/gifs/credit-score-gauge.gif")


# ==============================================================================
# 3. OSUSU ROTATING POT & CO-GUARANTEE (osusu-circle.gif)
# ==============================================================================
def create_osusu_circle_gif():
    frames = []
    width, height = 340, 220
    num_frames = 32
    cx, cy = 170, 115
    orbit_r = 75

    member_count = 8
    names = ["Aminata", "Sahr", "Fatmata", "Mohamed", "Mariama", "Kallon", "Finda", "Ibrahim"]

    for f in range(num_frames):
        img = Image.new("RGBA", (width, height), (11, 19, 43, 255))
        draw = ImageDraw.Draw(img)

        # Header
        draw.text((20, 12), "GBO-KAKUA OSUSU · 12 FARMERS", fill=(245, 158, 11, 255), font=font_bold)
        draw.text((20, 28), "Rotating Pot: SLE 14,400 · 100% On-Time", fill=(148, 163, 184, 255), font=font_sm)

        # Orbit track
        draw.ellipse([cx - orbit_r, cy - orbit_r, cx + orbit_r, cy + orbit_r], outline=(30, 41, 59, 255), width=2)

        # Center Pot
        pot_pulse = int(2 * math.sin((f / num_frames) * 2 * math.pi))
        draw.ellipse([cx - 30 - pot_pulse, cy - 30 - pot_pulse, cx + 30 + pot_pulse, cy + 30 + pot_pulse],
                     fill=(245, 158, 11, 255), outline=(254, 243, 199, 255), width=2)
        draw.text((cx - 16, cy - 12), "POT", fill=(11, 19, 43, 255), font=font_bold)
        draw.text((cx - 24, cy + 4), "14.4k", fill=(11, 19, 43, 255), font=font_sm)

        # Rotating members
        rotation = (f / num_frames) * 2 * math.pi
        for i in range(member_count):
            angle = rotation + (i * 2 * math.pi / member_count)
            mx = cx + int(orbit_r * math.cos(angle))
            my = cy + int(orbit_r * math.sin(angle))

            # Is Aminata (member 0)? Highlight!
            is_aminata = (i == 0)
            col = (1, 128, 255) if is_aminata else (148, 163, 184)
            size = 9 if is_aminata else 6
            draw.ellipse([mx - size, my - size, mx + size, my + size], fill=col)

            # Animated coin flowing to center pot
            coin_t = ((f + i * 4) % num_frames) / num_frames
            cpx = mx + int((cx - mx) * coin_t)
            cpy = my + int((cy - my) * coin_t)
            draw.ellipse([cpx - 2, cpy - 2, cpx + 2, cpy + 2], fill=(245, 158, 11, 255))

        # Turn indicator box at bottom
        draw.rectangle([20, height - 26, width - 20, height - 8], fill=(15, 23, 42, 255), outline=(1, 128, 255, 180))
        draw.text((30, height - 23), "👉 Next Turn: Aminata Kamara (24 Nov) · SLE 1,200", fill=(52, 211, 153, 255), font=font_sm)

        frames.append(img.convert("P", palette=Image.ADAPTIVE))

    frames[0].save(
        "web/public/gifs/osusu-circle.gif",
        save_all=True,
        append_images=frames[1:],
        duration=65,
        loop=0
    )
    print("Created web/public/gifs/osusu-circle.gif")


# ==============================================================================
# 4. RAIN-CHECK PARAMETRIC DROUGHT PAYOUT (rain-check.gif)
# ==============================================================================
def create_rain_check_gif():
    frames = []
    width, height = 340, 200
    num_frames = 32

    for f in range(num_frames):
        img = Image.new("RGBA", (width, height), (15, 23, 42, 255))
        draw = ImageDraw.Draw(img)

        # Header
        draw.text((20, 14), "RAIN-CHECK WEATHER TRIGGER", fill=(56, 189, 248, 255), font=font_bold)
        draw.text((20, 30), "Copernicus Satellite Rainfall Telemetry · Bo District", fill=(148, 163, 184, 255), font=font_sm)

        # Cloud and rainfall
        cloud_x, cloud_y = 70, 70
        draw.ellipse([cloud_x, cloud_y, cloud_x + 50, cloud_y + 30], fill=(71, 85, 105, 255))
        draw.ellipse([cloud_x + 20, cloud_y - 12, cloud_x + 70, cloud_y + 25], fill=(71, 85, 105, 255))
        draw.ellipse([cloud_x + 45, cloud_y, cloud_x + 95, cloud_y + 30], fill=(71, 85, 105, 255))

        # Rain drops falling
        if f < 18:
            for d in range(6):
                drop_y = cloud_y + 35 + ((f * 5 + d * 14) % 45)
                drop_x = cloud_x + 15 + d * 12
                draw.line([(drop_x, drop_y), (drop_x - 2, drop_y + 6)], fill=(56, 189, 248, 200), width=2)
            draw.text((180, 65), "Rainfall: 18mm / 30d", fill=(245, 158, 11, 255), font=font_bold)
            draw.text((180, 85), "Threshold: <30mm (DROUGHT)", fill=(239, 68, 68, 255), font=font_sm)
            draw.text((180, 105), "Status: ⚠️ Trigger Armed", fill=(203, 213, 225, 255), font=font_sm)
        else:
            # Trigger payout
            pulse = int(3 * math.sin(f))
            draw.rounded_rectangle([170 - pulse, 60 - pulse, width - 20 + pulse, 120 + pulse], radius=8, fill=(16, 185, 129, 255))
            draw.text((180, 68), "⚡ TRIGGER FIRED!", fill=(255, 255, 255, 255), font=font_bold)
            draw.text((180, 88), "+400 SLE Relief Credited", fill=(255, 255, 255, 255), font=font_bold)
            draw.text((180, 104), "12 Wallets Funded via OM", fill=(240, 253, 244, 255), font=font_sm)

        # Footer ticker
        draw.rounded_rectangle([20, 145, width - 20, 185], radius=6, fill=(30, 41, 59, 255))
        draw.text((28, 152), "Automatic Zero-Claim Payout Rail", fill=(52, 211, 153, 255), font=font_sm)
        draw.text((28, 168), "No paper forms · Immediate Mobile Money Liquidity", fill=(148, 163, 184, 255), font=font_sm)

        frames.append(img.convert("P", palette=Image.ADAPTIVE))

    frames[0].save(
        "web/public/gifs/rain-check.gif",
        save_all=True,
        append_images=frames[1:],
        duration=80,
        loop=0
    )
    print("Created web/public/gifs/rain-check.gif")


# ==============================================================================
# 5. VIRTUAL ENVELOPE BUDGETING (envelope-save.gif)
# ==============================================================================
def create_envelope_save_gif():
    frames = []
    width, height = 360, 200
    num_frames = 30

    envelopes = [
        ("🌱 Seed & Fertilizer", "35%", (16, 185, 129), 1086),
        ("🎒 School Fees", "25%", (1, 128, 255), 776),
        ("🛡️ Emergency Fund", "20%", (245, 158, 11), 621),
        ("🤝 Osusu Savings", "20%", (139, 92, 246), 621),
    ]

    for f in range(num_frames):
        img = Image.new("RGBA", (width, height), (11, 19, 43, 255))
        draw = ImageDraw.Draw(img)

        # Header
        draw.text((20, 12), "G5 VIRTUAL ENVELOPE AUTO-ALLOCATION", fill=(255, 255, 255, 255), font=font_bold)
        draw.text((20, 28), "Incoming Harvest Payout: SLE 3,105.00", fill=(52, 211, 153, 255), font=font_sm)

        pct = min(1.0, f / (num_frames - 5))

        # Envelopes grid (2x2)
        coords = [
            (20, 52), (185, 52),
            (20, 122), (185, 122)
        ]

        for idx, ((title, split_pct, col, target_amt), (ex, ey)) in enumerate(zip(envelopes, coords)):
            cur_amt = int(target_amt * pct)
            draw.rounded_rectangle([ex, ey, ex + 155, ey + 60], radius=8, fill=(15, 23, 42, 255), outline=col, width=1)
            draw.text((ex + 8, ey + 6), title, fill=(255, 255, 255, 255), font=font_sm)
            draw.text((ex + 8, ey + 24), f"SLE {cur_amt:,}", fill=col, font=font_bold)
            draw.text((ex + 115, ey + 24), split_pct, fill=(148, 163, 184, 255), font=font_sm)

            # Mini progress line
            draw.rounded_rectangle([ex + 8, ey + 46, ex + 147, ey + 50], radius=2, fill=(30, 41, 59, 255))
            draw.rounded_rectangle([ex + 8, ey + 46, ex + 8 + int(139 * pct), ey + 50], radius=2, fill=col)

        frames.append(img.convert("P", palette=Image.ADAPTIVE))

    frames[0].save(
        "web/public/gifs/envelope-save.gif",
        save_all=True,
        append_images=frames[1:],
        duration=70,
        loop=0
    )
    print("Created web/public/gifs/envelope-save.gif")


# ==============================================================================
# 6. DIGITAL HARVEST RECEIPT & CRYPTO QR (digital-receipt-qr.gif)
# ==============================================================================
def create_digital_receipt_gif():
    frames = []
    width, height = 340, 200
    num_frames = 28

    for f in range(num_frames):
        img = Image.new("RGBA", (width, height), (15, 23, 42, 255))
        draw = ImageDraw.Draw(img)

        # Receipt card
        draw.rounded_rectangle([18, 12, width - 18, height - 12], radius=10, fill=(255, 255, 255, 255))

        # Receipt top header (Monime Blue)
        draw.rounded_rectangle([18, 12, width - 18, 50], radius=10, fill=(1, 128, 255, 255))
        draw.text((30, 18), "CERTIFIED HARVEST RECEIPT", fill=(255, 255, 255, 255), font=font_bold)
        draw.text((30, 34), "Bank of SL FinTech Sandbox · Ref: ROK-8842", fill=(224, 242, 254, 255), font=font_sm)

        # Details on left
        draw.text((30, 60), "Farmer:", fill=(100, 116, 139, 255), font=font_sm)
        draw.text((85, 60), "Aminata Kamara (Bo)", fill=(15, 23, 42, 255), font=font_bold)

        draw.text((30, 78), "Buyer:", fill=(100, 116, 139, 255), font=font_sm)
        draw.text((85, 78), "Rokel Grain Aggregators", fill=(15, 23, 42, 255), font=font_sm)

        draw.text((30, 96), "Volume:", fill=(100, 116, 139, 255), font=font_sm)
        draw.text((85, 96), "150 kg Grade-A Cocoa", fill=(15, 23, 42, 255), font=font_sm)

        draw.text((30, 114), "Net Payout:", fill=(100, 116, 139, 255), font=font_sm)
        draw.text((105, 114), "SLE 3,105.00", fill=(16, 185, 129, 255), font=font_bold)

        # Simulated QR code pattern on right
        qrx, qry = width - 100, 62
        draw.rectangle([qrx - 2, qry - 2, qrx + 72, qry + 72], fill=(241, 245, 249, 255), outline=(203, 213, 225, 255))

        # QR squares
        grid_step = 7
        for gx in range(0, 70, grid_step):
            for gy in range(0, 70, grid_step):
                # Pattern
                val = (gx * 3 + gy * 7 + f) % 5
                if val < 3 or (gx in [0, 63] and gy in [0, 63]):
                    draw.rectangle([qrx + gx, qry + gy, qrx + gx + 5, qry + gy + 5], fill=(15, 23, 42, 255))

        # Verified Stamp animation in later frames
        if f > 8:
            stamp_w = min(1.0, (f - 8) / 8.0)
            draw.rectangle([30, 142, width - 30, 174], fill=(236, 253, 245, 255), outline=(16, 185, 129, 255))
            draw.text((45, 150), "✓ HASH VERIFIED & TAMPER-PROOF", fill=(5, 150, 105, 255), font=font_bold)

        frames.append(img.convert("P", palette=Image.ADAPTIVE))

    frames[0].save(
        "web/public/gifs/digital-receipt-qr.gif",
        save_all=True,
        append_images=frames[1:],
        duration=75,
        loop=0
    )
    print("Created web/public/gifs/digital-receipt-qr.gif")


# Run all generators
create_ussd_dial_gif()
create_credit_score_gif()
create_osusu_circle_gif()
create_rain_check_gif()
create_envelope_save_gif()
create_digital_receipt_gif()
print("All animated GIFs generated successfully!")
