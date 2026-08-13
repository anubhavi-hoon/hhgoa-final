from PIL import Image

img = Image.open('public/templates/classic/template_v3.jpg')
w, h = img.size
print(f"Template size: {w}x{h}")
sx, sy = 1080/w, 1620/h
print(f"Scale factors: sx={sx:.4f}, sy={sy:.4f}")

pixels = img.load()

def is_checkerboard_pixel(r, g, b):
    if r > 190 and g > 190 and b > 190 and abs(r-g) < 15 and abs(g-b) < 15:
        return True
    return False

# Find horizontal bounds at y=500 (middle of card area)
for y_scan in [450, 500, 550]:
    left_x, right_x = None, None
    for x in range(100, 600):
        r, g, b = pixels[x, y_scan][:3]
        if is_checkerboard_pixel(r, g, b) and left_x is None:
            left_x = x
        if is_checkerboard_pixel(r, g, b):
            right_x = x
    print(f"\nHorizontal bounds at y={y_scan}: left={left_x}, right={right_x}")
    if left_x and right_x:
        print(f"  Scaled: left={left_x*sx:.0f}, right={right_x*sx:.0f}, width={(right_x-left_x)*sx:.0f}")

# Find vertical bounds at x=340 (center of card)
x_scan = 340
top_y, bottom_y = None, None
for y in range(200, 800):
    r, g, b = pixels[x_scan, y][:3]
    if is_checkerboard_pixel(r, g, b) and top_y is None:
        top_y = y
    if is_checkerboard_pixel(r, g, b):
        bottom_y = y

print(f"\nVertical bounds at x={x_scan}: top={top_y}, bottom={bottom_y}")
if top_y and bottom_y:
    print(f"  Scaled: top={top_y*sy:.0f}, bottom={bottom_y*sy:.0f}, height={(bottom_y-top_y)*sy:.0f}")

# Find dark blue bar below card
print(f"\n--- Scanning for dark blue bar below checkerboard ---")
if bottom_y:
    for y in range(bottom_y, min(bottom_y + 200, h)):
        r, g, b = pixels[x_scan, y][:3]
        if r < 80 and g < 80 and b < 100 and r+g+b < 200:
            print(f"  DARK BAR starts at y={y} ({y*sy:.0f} scaled): rgb({r},{g},{b})")
            for y2 in range(y, min(y+80, h)):
                r2, g2, b2 = pixels[x_scan, y2][:3]
                if r2 > 100 or (r2+g2+b2) > 250:
                    print(f"  DARK BAR ends at y={y2} ({y2*sy:.0f} scaled): rgb({r2},{g2},{b2})")
                    break
            break

# Sample the name area
print(f"\n--- Name area samples (between checkerboard bottom and dark bar) ---")
if bottom_y:
    for y in range(bottom_y-2, min(bottom_y + 100, h)):
        r, g, b = pixels[x_scan, y][:3]
        if y % 5 == 0 or y == bottom_y:
            print(f"  y={y} ({y*sy:.0f}): rgb({r},{g},{b})")
