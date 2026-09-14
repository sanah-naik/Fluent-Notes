import os
from PIL import Image, ImageDraw

def generate_cute_icon():
    size = 256
    # Super-sampling for smooth antialiasing
    scale = 4
    canvas_size = size * scale
    
    img = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Coordinates for sticky note body
    pad = 24 * scale
    x0, y0 = pad, pad
    x1, y1 = canvas_size - pad, canvas_size - pad
    r = 32 * scale
    
    # Soft drop shadow under the sticky note
    shadow_offset = 8 * scale
    shadow_color = (0, 0, 0, 38)
    draw.rounded_rectangle(
        [x0, y0 + shadow_offset, x1, y1 + shadow_offset],
        radius=r,
        fill=shadow_color
    )
    
    # Main sticky note body - warm pastel cheerful buttercup yellow
    note_fill = (255, 224, 92, 255) # #ffe05c
    note_outline = (245, 185, 35, 255) # warm golden rim
    outline_width = 3 * scale
    
    draw.rounded_rectangle(
        [x0, y0, x1, y1],
        radius=r,
        fill=note_fill,
        outline=note_outline,
        width=outline_width
    )
    
    # Cute folded corner on top right
    fold_size = 46 * scale
    fold_x = x1 - fold_size
    fold_y = y0 + fold_size
    
    # Soft shadow under fold
    draw.polygon([
        (x1, y0 + fold_size),
        (x1 - fold_size, y0),
        (x1 - fold_size - 4 * scale, y0 + fold_size + 4 * scale)
    ], fill=(220, 160, 20, 90))
    
    # Folded flap
    draw.polygon([
        (x1 - fold_size, y0),
        (x1, y0 + fold_size),
        (x1 - fold_size, y0 + fold_size)
    ], fill=(255, 243, 150, 255))
    
    draw.line([
        (x1 - fold_size, y0),
        (x1 - fold_size, y0 + fold_size),
        (x1, y0 + fold_size)
    ], fill=note_outline, width=outline_width)
    
    # Kawaii Face:
    # 1. Big sparkling kawaii eyes
    eye_y = 118 * scale
    eye_radius_x = 12 * scale
    eye_radius_y = 16 * scale
    left_eye_x = 88 * scale
    right_eye_x = 168 * scale
    eye_color = (45, 32, 24, 255) # rich deep chocolate
    
    # Left eye
    draw.ellipse([
        left_eye_x - eye_radius_x, eye_y - eye_radius_y,
        left_eye_x + eye_radius_x, eye_y + eye_radius_y
    ], fill=eye_color)
    
    # Right eye
    draw.ellipse([
        right_eye_x - eye_radius_x, eye_y - eye_radius_y,
        right_eye_x + eye_radius_x, eye_y + eye_radius_y
    ], fill=eye_color)
    
    # Eye sparkles (big highlight + baby highlight in each eye)
    # Left eye sparkles
    draw.ellipse([
        left_eye_x - 7 * scale, eye_y - 12 * scale,
        left_eye_x + 1 * scale, eye_y - 4 * scale
    ], fill=(255, 255, 255, 255))
    draw.ellipse([
        left_eye_x + 3 * scale, eye_y + 3 * scale,
        left_eye_x + 8 * scale, eye_y + 8 * scale
    ], fill=(255, 255, 255, 230))
    
    # Right eye sparkles
    draw.ellipse([
        right_eye_x - 7 * scale, eye_y - 12 * scale,
        right_eye_x + 1 * scale, eye_y - 4 * scale
    ], fill=(255, 255, 255, 255))
    draw.ellipse([
        right_eye_x + 3 * scale, eye_y + 3 * scale,
        right_eye_x + 8 * scale, eye_y + 8 * scale
    ], fill=(255, 255, 255, 230))
    
    # 2. Rosy blush cheeks (soft sweet pink)
    blush_color = (255, 120, 150, 180)
    blush_rx = 18 * scale
    blush_ry = 10 * scale
    blush_y = 138 * scale
    
    draw.ellipse([
        left_eye_x - 12 * scale - blush_rx, blush_y - blush_ry,
        left_eye_x - 12 * scale + blush_rx, blush_y + blush_ry
    ], fill=blush_color)
    
    draw.ellipse([
        right_eye_x + 12 * scale - blush_rx, blush_y - blush_ry,
        right_eye_x + 12 * scale + blush_rx, blush_y + blush_ry
    ], fill=blush_color)
    
    # 3. Sweet open happy smiling mouth: (ᴗ)
    mouth_cx = 128 * scale
    mouth_cy = 142 * scale
    # Cute curved smile arc
    draw.arc(
        [mouth_cx - 18 * scale, mouth_cy - 12 * scale,
         mouth_cx + 18 * scale, mouth_cy + 16 * scale],
        start=20, end=160,
        fill=eye_color, width=4 * scale
    )
    # Tiny pink tongue peek inside smile
    draw.chord(
        [mouth_cx - 11 * scale, mouth_cy + 2 * scale,
         mouth_cx + 11 * scale, mouth_cy + 16 * scale],
        start=0, end=180,
        fill=(255, 105, 140, 255)
    )

    # 4. Tiny cute pastel heart badge near bottom right
    hx = 188 * scale
    hy = 185 * scale
    hr = 14 * scale
    # Draw cute heart
    draw.polygon([
        (hx, hy + hr),
        (hx - hr, hy),
        (hx - hr * 0.5, hy - hr * 0.7),
        (hx, hy - hr * 0.2),
        (hx + hr * 0.5, hy - hr * 0.7),
        (hx + hr, hy)
    ], fill=(255, 95, 135, 255))
    draw.ellipse([hx - hr, hy - hr * 0.6, hx, hy + hr * 0.2], fill=(255, 95, 135, 255))
    draw.ellipse([hx, hy - hr * 0.6, hx + hr, hy + hr * 0.2], fill=(255, 95, 135, 255))
    
    # Downscale with high quality Lanczos resampling
    final_img = img.resize((size, size), Image.Resampling.LANCZOS)
    return final_img

if __name__ == '__main__':
    work_dir = os.path.dirname(os.path.abspath(__file__))
    cute_icon = generate_cute_icon()
    
    # Save PNG
    png_path = os.path.join(work_dir, 'tray_icon.png')
    cute_icon.save(png_path, 'PNG')
    cute_png = os.path.join(work_dir, 'sticky_notes_cute.png')
    cute_icon.save(cute_png, 'PNG')
    print(f"Saved cute PNG icons: {png_path}, {cute_png}")
    
    # Save multi-resolution ICO
    sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    ico_path = os.path.join(work_dir, 'tray_icon.ico')
    cute_icon.save(ico_path, format='ICO', sizes=sizes)
    cute_ico = os.path.join(work_dir, 'sticky_notes_cute.ico')
    cute_icon.save(cute_ico, format='ICO', sizes=sizes)
    print(f"Saved cute ICO icons: {ico_path}, {cute_ico}")
