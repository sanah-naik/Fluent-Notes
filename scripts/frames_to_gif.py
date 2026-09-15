import os
import sys
from PIL import Image

def create_gif(frames_dir, output_gif, target_width=820, fps=12, loop=0):
    files = sorted([f for f in os.listdir(frames_dir) if f.endswith('.png')])
    if not files:
        print(f"No frames found in {frames_dir}")
        return

    print(f"Processing {len(files)} frames from {frames_dir} -> {output_gif}...")
    images = []
    
    for i, file in enumerate(files):
        img_path = os.path.join(frames_dir, file)
        img = Image.open(img_path).convert('RGB')
        
        # Calculate aspect-ratio height
        w, h = img.size
        target_height = int(h * (target_width / w))
        img_resized = img.resize((target_width, target_height), Image.Resampling.LANCZOS)
        
        # Quantize to 128 colors with palette for crispness and smaller size
        quantized = img_resized.quantize(colors=128, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG)
        images.append(quantized)

    duration = int(1000 / fps)
    
    # Ensure parent dir exists
    os.makedirs(os.path.dirname(os.path.abspath(output_gif)), exist_ok=True)
    
    images[0].save(
        output_gif,
        save_all=True,
        append_images=images[1:],
        duration=duration,
        loop=loop,
        optimize=True
    )
    
    size_mb = os.path.getsize(output_gif) / (1024 * 1024)
    print(f"Saved {output_gif} ({size_mb:.2f} MB)")

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python frames_to_gif.py <frames_dir> <output_gif> [target_width] [fps]")
        sys.exit(1)
    
    frames_dir = sys.argv[1]
    output_gif = sys.argv[2]
    width = int(sys.argv[3]) if len(sys.argv) > 3 else 820
    fps = int(sys.argv[4]) if len(sys.argv) > 4 else 12
    create_gif(frames_dir, output_gif, width, fps)
