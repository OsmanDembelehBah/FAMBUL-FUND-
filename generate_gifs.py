import math
import os
from PIL import Image, ImageDraw, ImageFont

os.makedirs("web/public/gifs", exist_ok=True)

# 1. GENERATE voice-wave.gif (Dynamic Speech Equalizer Waveform in Monime Electric Blue)
def create_voice_wave_gif():
    frames = []
    width, height = 360, 140
    num_bars = 28
    num_frames = 24

    for f in range(num_frames):
        img = Image.new("RGBA", (width, height), (11, 19, 43, 255)) # Dark navy #0B132B
        draw = ImageDraw.Draw(img)
        
        # Subtle horizontal grid lines
        for y in range(20, height, 25):
            draw.line([(0, y), (width, y)], fill=(255, 255, 255, 15), width=1)
            
        bar_w = 6
        spacing = (width - 40) / num_bars
        center_y = height // 2

        for i in range(num_bars):
            phase = (f / num_frames) * 2 * math.pi + (i * 0.35)
            # Bell curve envelope
            envelope = math.sin((i / num_bars) * math.pi)
            h_var = int(envelope * (18 + 32 * math.sin(phase) ** 2))
            
            x = 20 + int(i * spacing)
            y1 = center_y - h_var
            y2 = center_y + h_var
            
            # Gradient color from Monime blue #0180FF to Cyan #00D2FF
            color = (1, int(128 + 90 * math.sin(phase)), 255, 255)
            draw.rounded_rectangle([x, y1, x + bar_w, y2], radius=3, fill=color)

        frames.append(img.convert("P", palette=Image.ADAPTIVE))

    frames[0].save(
        "web/public/gifs/voice-wave.gif",
        save_all=True,
        append_images=frames[1:],
        duration=65,
        loop=0
    )
    print("Created web/public/gifs/voice-wave.gif")

# 2. GENERATE payment-flow.gif (Automated Repayment Split Flow Animation)
def create_payment_flow_gif():
    frames = []
    width, height = 400, 160
    num_frames = 30

    for f in range(num_frames):
        img = Image.new("RGBA", (width, height), (255, 255, 255, 255))
        draw = ImageDraw.Draw(img)
        
        # Draw 3 circular stages: [Gross Harvest] -> [Auto-Split] -> [Farmer Wallet]
        cx1, cy1 = 60, 80
        cx2, cy2 = 200, 80
        cx3, cy3 = 340, 80
        
        # Connectors
        draw.line([(cx1 + 25, cy1), (cx2 - 25, cy2)], fill=(226, 232, 240, 255), width=3)
        draw.line([(cx2 + 25, cy2), (cx3 - 25, cy3)], fill=(226, 232, 240, 255), width=3)
        
        # Animated particle moving between circles
        t1 = (f / num_frames) * 2
        if t1 <= 1.0:
            px = cx1 + 25 + int(t1 * (cx2 - cx1 - 50))
            draw.ellipse([px - 5, cy1 - 5, px + 5, cy1 + 5], fill=(1, 128, 255, 255))
        else:
            t2 = t1 - 1.0
            px = cx2 + 25 + int(t2 * (cx3 - cx2 - 50))
            draw.ellipse([px - 5, cy2 - 5, px + 5, cy2 + 5], fill=(16, 185, 129, 255))

        # Node 1: Gross Payout
        draw.ellipse([cx1 - 25, cy1 - 25, cx1 + 25, cy1 + 25], fill=(239, 246, 255, 255), outline=(1, 128, 255, 255), width=2)
        draw.text((cx1 - 12, cy1 - 8), "Gross", fill=(1, 128, 255, 255))

        # Node 2: 4-Way Split
        pulse = int(3 * math.sin((f / num_frames) * 2 * math.pi))
        draw.ellipse([cx2 - 25 - pulse, cy2 - 25 - pulse, cx2 + 25 + pulse, cy2 + 25 + pulse], fill=(254, 243, 199, 255), outline=(245, 158, 11, 255), width=2)
        draw.text((cx2 - 10, cy2 - 8), "Split", fill=(217, 119, 6, 255))

        # Node 3: Net Wallet
        draw.ellipse([cx3 - 25, cy3 - 25, cx3 + 25, cy3 + 25], fill=(236, 253, 245, 255), outline=(16, 185, 129, 255), width=2)
        draw.text((cx3 - 10, cy3 - 8), "Wallet", fill=(16, 185, 129, 255))
        
        # Subtitle
        draw.text((90, 135), "Automated 4-Way Repayment-at-Source", fill=(100, 116, 139, 255))

        frames.append(img.convert("P", palette=Image.ADAPTIVE))

    frames[0].save(
        "web/public/gifs/payment-flow.gif",
        save_all=True,
        append_images=frames[1:],
        duration=60,
        loop=0
    )
    print("Created web/public/gifs/payment-flow.gif")

# 3. GENERATE radar-scan.gif (Liquidity Radar Sweep & Agent Float Detection)
def create_radar_scan_gif():
    frames = []
    size = 240
    center = size // 2
    num_frames = 32

    agents = [
        (center + 45, center - 35, "Bo"),
        (center - 55, center + 40, "Kenema"),
        (center + 60, center + 50, "Kailahun"),
    ]

    for f in range(num_frames):
        img = Image.new("RGBA", (size, size), (11, 19, 43, 255))
        draw = ImageDraw.Draw(img)
        
        # Concentric radar rings
        for r in [30, 60, 90]:
            draw.ellipse([center - r, center - r, center + r, center + r], outline=(1, 128, 255, 60), width=1)
        
        draw.line([(center, 15), (center, size - 15)], fill=(1, 128, 255, 40), width=1)
        draw.line([(15, center), (size - 15, center)], fill=(1, 128, 255, 40), width=1)

        # Rotating beam
        angle = (f / num_frames) * 2 * math.pi
        bx = center + int(95 * math.cos(angle))
        by = center + int(95 * math.sin(angle))
        draw.line([(center, center), (bx, by)], fill=(1, 128, 255, 230), width=2)
        
        # Pinging agent dots
        for ax, ay, name in agents:
            dist = math.hypot(ax - center, ay - center)
            dot_angle = math.atan2(ay - center, ax - center)
            if dot_angle < 0: dot_angle += 2 * math.pi
            
            diff = abs(angle - dot_angle)
            if diff < 0.35 or diff > (2 * math.pi - 0.35):
                # Light up when swept
                draw.ellipse([ax - 6, ay - 6, ax + 6, ay + 6], fill=(16, 185, 129, 255))
                draw.ellipse([ax - 10, ay - 10, ax + 10, ay + 10], outline=(16, 185, 129, 120), width=1)
            else:
                draw.ellipse([ax - 3, ay - 3, ax + 3, ay + 3], fill=(245, 158, 11, 200))

        frames.append(img.convert("P", palette=Image.ADAPTIVE))

    frames[0].save(
        "web/public/gifs/radar-scan.gif",
        save_all=True,
        append_images=frames[1:],
        duration=65,
        loop=0
    )
    print("Created web/public/gifs/radar-scan.gif")

create_voice_wave_gif()
create_payment_flow_gif()
create_radar_scan_gif()
