import numpy as np
from PIL import Image, ImageFilter
from collections import deque
import os

src_path = r'C:/Users/adars/.gemini/antigravity/brain/6ea23c3d-85d5-44f7-a2a2-0d998ea9b8ab/.user_uploaded/media_1793557972208_0e1dff8a.webp'
out_png = r'frontend/public/assets/hero/adarsh-avatar.png'
out_webp = r'frontend/public/assets/hero/adarsh-avatar.webp'

print("Loading original photo...")
orig_img = Image.open(src_path).convert('RGB')
arr = np.array(orig_img, dtype=np.float32)
H, W, _ = arr.shape

# 1. Connected flood-fill for background removal
is_white = (arr[:, :, 0] > 238) & (arr[:, :, 1] > 238) & (arr[:, :, 2] > 238)
visited = np.zeros((H, W), dtype=bool)
q = deque()

for x in range(W):
    if is_white[0, x]:
        q.append((0, x))
        visited[0, x] = True
for y in range(H):
    if is_white[y, 0] and not visited[y, 0]:
        q.append((y, 0))
        visited[y, 0] = True
    if is_white[y, W-1] and not visited[y, W-1]:
        q.append((y, W-1))
        visited[y, W-1] = True

while q:
    y, x = q.popleft()
    for dy, dx in [(-1,0), (1,0), (0,-1), (0,1)]:
        ny, nx = y + dy, x + dx
        if 0 <= ny < H and 0 <= nx < W and not visited[ny, nx]:
            if is_white[ny, nx]:
                visited[ny, nx] = True
                q.append((ny, nx))

fg_mask_raw = (~visited).astype(np.uint8) * 255

# 2. Smooth mask with Pillow to eliminate pixel jaggedness
mask_img = Image.fromarray(fg_mask_raw, mode='L')
# Slight blur to soften edges
mask_blurred = mask_img.filter(ImageFilter.GaussianBlur(radius=1.8))
alpha = np.array(mask_blurred, dtype=np.float32) / 255.0

# 3. Defringe white edges:
# Where alpha is between 0.05 and 0.95 and original pixel was very light, darken slightly to kill white halo
halo_weight = (1.0 - alpha) * (alpha > 0.01)
for c in range(3):
    arr[:, :, c] = np.where(halo_weight > 0, arr[:, :, c] * (1.0 - 0.5 * halo_weight), arr[:, :, c])

# 4. Cinematic Dark-Studio Grading:
# Contrast curve: deeper obsidian shadows, moody midtones, warm highlights
norm = arr / 255.0
# S-curve for high contrast
graded = np.power(norm, 1.25)
# Push deep shadows towards #08080a
graded = np.clip(graded * 1.05 - 0.02, 0.0, 1.0) * 255.0

# 5. Dramatic Vermilion Rim Light (#ff3b1d = [255, 59, 29])
# Rim light should be on the outer boundary of the silhouette
mask_dilated = mask_img.filter(ImageFilter.MaxFilter(size=13))
mask_eroded = mask_img.filter(ImageFilter.MinFilter(size=11))

arr_dilated = np.array(mask_dilated, dtype=np.float32) / 255.0
arr_eroded = np.array(mask_eroded, dtype=np.float32) / 255.0

# Outer contour band
rim_band = np.clip(arr_dilated - arr_eroded, 0.0, 1.0)
# Blur the rim band for realistic light wrap
rim_band_img = Image.fromarray((rim_band * 255).astype(np.uint8), mode='L')
rim_soft = np.array(rim_band_img.filter(ImageFilter.GaussianBlur(radius=4.0)), dtype=np.float32) / 255.0

# Apply rim light primarily to upper half, sides, and shoulders
y_coords = np.linspace(0, 1, H)[:, None]
rim_vertical_factor = np.clip(1.2 - 0.5 * y_coords, 0.2, 1.0)

rim_strength = rim_soft * rim_vertical_factor * (alpha > 0.15)
rim_color = np.array([255.0, 59.0, 29.0]) # #ff3b1d

for c in range(3):
    # Additive rim lighting with gentle glow
    graded[:, :, c] = np.clip(graded[:, :, c] + rim_color[c] * rim_strength * 0.85, 0.0, 255.0)

# 6. Soft bottom gradient fade so avatar bleeds seamlessly into #08080a
# From y = 80% to 100%, fade alpha to 0
fade_start = int(H * 0.78)
fade_ramp = np.ones((H, W), dtype=np.float32)
for y in range(fade_start, H):
    progress = (y - fade_start) / (H - fade_start)
    # Cosine smoothstep fade
    smooth_fade = 0.5 * (1.0 + np.cos(progress * np.pi))
    fade_ramp[y, :] = smooth_fade

final_alpha = np.clip(alpha * fade_ramp * 255.0, 0.0, 255.0).astype(np.uint8)

# Combine into RGBA
result_arr = np.zeros((H, W, 4), dtype=np.uint8)
result_arr[:, :, :3] = np.clip(graded, 0, 255).astype(np.uint8)
result_arr[:, :, 3] = final_alpha

out_img = Image.fromarray(result_arr, mode='RGBA')

os.makedirs(os.path.dirname(out_png), exist_ok=True)
print(f"Saving to {out_png}...")
out_img.save(out_png, format='PNG')

print(f"Saving to {out_webp}...")
out_img.save(out_webp, format='WEBP', quality=95)

print("Avatar successfully generated with transparent background and #ff3b1d rim light!")
