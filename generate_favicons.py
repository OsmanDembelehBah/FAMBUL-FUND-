import os
import math
from PIL import Image, ImageDraw

def render_fambul_logo(size=512):
    # Render at 4x for high-quality antialiasing
    scale = 4
    canvas_size = size * scale
    img = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Base coordinates in 44x44 grid
    # scale factor from 44 to canvas_size
    s = canvas_size / 44.0

    # Draw rounded rectangle background #0180FF
    radius = int(12.0 * s)
    draw.rounded_rectangle([0, 0, canvas_size, canvas_size], radius=radius, fill=(1, 128, 255, 255))

    # Stroke width 3.2
    stroke_w = int(3.2 * s)

    # 1. White Loop (Upper/Right Osusu Arc)
    # Approximate bezier path: (13, 23) -> arc through top (24, 12) -> (32, 20) -> bottom right (24, 28) -> (16.5, 24)
    # Using smooth polyline interpolation
    white_pts = []
    # From angle 180 to 0 (top half, center at (22.5, 18), rx=9.5, ry=6)
    for deg in range(180, -30, -5):
        rad = math.radians(deg)
        x = (22.5 + 9.5 * math.cos(rad)) * s
        y = (19.0 - 7.0 * math.sin(rad)) * s
        white_pts.append((x, y))
    
    # Return loop back to (16.5, 24)
    for deg in range(-30, -160, -5):
        rad = math.radians(deg)
        x = (24.0 + 7.5 * math.cos(rad)) * s
        y = (24.0 - 4.0 * math.sin(rad)) * s
        white_pts.append((x, y))

    draw.line(white_pts, fill=(255, 255, 255, 255), width=stroke_w, joint="curve")

    # 2. Emerald Green Loop #10B981 (Lower/Left Harvest Arc)
    green_pts = []
    for deg in range(0, 210, 5):
        rad = math.radians(deg)
        x = (21.5 - 9.5 * math.cos(rad)) * s
        y = (25.0 + 7.0 * math.sin(rad)) * s
        green_pts.append((x, y))

    for deg in range(-30, -160, -5):
        rad = math.radians(deg)
        x = (20.0 - 7.5 * math.cos(rad)) * s
        y = (20.0 + 4.0 * math.sin(rad)) * s
        green_pts.append((x, y))

    draw.line(green_pts, fill=(16, 185, 129, 255), width=stroke_w, joint="curve")

    # 3. Center Dot (white circle, radius 3.2 at (22, 22))
    cx, cy = 22.0 * s, 22.0 * s
    cr = 3.2 * s
    draw.ellipse([cx - cr, cy - cr, cx + cr, cy + cr], fill=(255, 255, 255, 255))

    # Downsample with Lanczos filter for crisp rendering
    resampled = img.resize((size, size), Image.Resampling.LANCZOS)
    return resampled

if __name__ == "__main__":
    img_512 = render_fambul_logo(512)
    img_192 = render_fambul_logo(192)
    img_180 = render_fambul_logo(180)
    img_48 = render_fambul_logo(48)
    img_32 = render_fambul_logo(32)
    img_16 = render_fambul_logo(16)

    # 1. Save PNG icons
    img_512.save("web/app/icon.png")
    img_192.save("web/public/icon-192.png")
    img_512.save("web/public/icon-512.png")
    img_180.save("web/app/apple-icon.png")
    img_180.save("web/public/apple-touch-icon.png")

    # 2. Save multi-resolution .ico (16, 32, 48)
    img_48.save(
        "web/app/favicon.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
        append_images=[img_32, img_16]
    )
    img_48.save(
        "web/public/favicon.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
        append_images=[img_32, img_16]
    )

    print("Successfully generated all Fambul Fund favicon and app icon assets!")
