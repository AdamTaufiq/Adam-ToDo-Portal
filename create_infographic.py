from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

OUT = Path(r"C:\Users\ASUS TUF GAMING\Documents\adamTodoPortal\adam_todo_portal_architecture_infographic.png")
W, H = 1600, 1000
img = Image.new("RGB", (W, H), "#F5F8FC")
d = ImageDraw.Draw(img)
font_dir = Path(r"C:\Windows\Fonts")

def font(name, size):
    path = font_dir / name
    return ImageFont.truetype(str(path), size) if path.exists() else ImageFont.load_default()

F_TITLE = font("segoeuib.ttf", 48)
F_SUB = font("segoeui.ttf", 24)
F_HEAD = font("segoeuib.ttf", 27)
F_BODY = font("segoeui.ttf", 19)
F_SMALL = font("segoeui.ttf", 17)
F_SMALL_B = font("segoeuib.ttf", 17)
F_CODE = font("consola.ttf", 17)

# Header
d.rounded_rectangle((40, 32, W-40, 145), radius=24, fill="#12233F")
d.text((78, 55), "ADAM TODO PORTAL", font=F_TITLE, fill="#FFFFFF")
d.text((80, 113), "VueJS + Vercel REST API + Supabase", font=F_SUB, fill="#B9D5FF")
d.text((1190, 66), "AUTHENTICATION", font=F_SMALL_B, fill="#6EE7B7")
d.text((1190, 94), "AUTHORIZATION", font=F_SMALL_B, fill="#93C5FD")
d.text((1190, 122), "RLS SECURITY", font=F_SMALL_B, fill="#FDE68A")

# helpers
def box(x, y, w, h, title, lines, fill, accent):
    d.rounded_rectangle((x, y, x+w, y+h), radius=20, fill=fill, outline=accent, width=3)
    d.rounded_rectangle((x, y, x+w, y+56), radius=20, fill=accent)
    d.rectangle((x, y+36, x+w, y+56), fill=accent)
    d.text((x+22, y+14), title, font=F_HEAD, fill="#FFFFFF")
    yy = y+78
    for line in lines:
        d.text((x+24, yy), line, font=F_BODY, fill="#172B4D")
        yy += 37

def arrow(x1, y1, x2, y2, color="#466A98"):
    d.line((x1, y1, x2, y2), fill=color, width=7)
    # arrow head
    if x2 >= x1:
        d.polygon([(x2, y2), (x2-18, y2-12), (x2-18, y2+12)], fill=color)
    else:
        d.polygon([(x2, y2), (x2+18, y2-12), (x2+18, y2+12)], fill=color)

# Main flow
box(70, 215, 330, 260, "1  FRONTEND", ["VueJS + Vite", "Login / Register UI", "Todo list interface", "Calls /api endpoints"], "#E8F1FF", "#2563EB")
box(635, 215, 330, 260, "2  REST API", ["Vercel Serverless", "POST /api/auth/register", "POST /api/auth/login", "GET /api/auth/me", "CRUD /api/todos"], "#EAFBF4", "#059669")
box(1200, 215, 330, 260, "3  SUPABASE", ["Supabase Auth", "PostgreSQL", "public.users", "public.todos", "RLS policies"], "#FFF4E5", "#EA8A00")
arrow(400, 345, 625, 345)
arrow(965, 345, 1190, 345)
d.text((445, 310), "HTTPS + JSON", font=F_SMALL_B, fill="#466A98")
d.text((1005, 310), "Bearer token", font=F_SMALL_B, fill="#466A98")

# Auth flow
box(170, 555, 360, 235, "LOGIN FLOW", ["1. User submits email/password", "2. API calls Supabase Auth", "3. Supabase returns access token", "4. Browser sends Bearer token"], "#F0FDF4", "#16A34A")
box(620, 555, 360, 235, "SECURITY CHECK", ["Authorization header", "Token validation", "User identity from auth.uid()", "No service-role key in browser"], "#EFF6FF", "#2563EB")
box(1070, 555, 360, 235, "DATA ACCESS", ["RLS limits rows per user", "Profile trigger creates users row", "Todos linked to user_id", "Private user workspace"], "#FFFBEB", "#D97706")
arrow(530, 657, 610, 657)
arrow(980, 657, 1060, 657)

# API test strip
d.rounded_rectangle((70, 835, 1530, 960), radius=20, fill="#172B4D")
d.text((100, 855), "TEST WITH POSTMAN / BROWSER", font=F_HEAD, fill="#FFFFFF")
d.text((100, 903), "GET  /api/health     →  service status", font=F_CODE, fill="#A7F3D0")
d.text((575, 903), "POST /api/auth/register → create account", font=F_CODE, fill="#BFDBFE")
d.text((1080, 903), "POST /api/auth/login → access token", font=F_CODE, fill="#FDE68A")
d.text((100, 935), "Protected requests require:  Authorization: Bearer <access_token>", font=F_SMALL, fill="#D7E4F6")

# footer
d.text((70, 970), "Public frontend key only • Supabase service-role key stays server-side", font=F_SMALL, fill="#526887")
img.save(OUT, "PNG", optimize=True)
print(f"created={OUT}")
print(f"size={img.size}")
