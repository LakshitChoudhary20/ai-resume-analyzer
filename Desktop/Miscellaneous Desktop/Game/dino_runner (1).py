"""
DINO RUNNER — Four Seasons
──────────────────────────
SPACE / UP  →  Jump
ESC         →  Quit
ENTER       →  Restart after game over
"""

import pygame, random, sys, math

pygame.init()

# ── DISPLAY ──────────────────────────────────────────────────────────────────
info   = pygame.display.Info()
W, H   = info.current_w, info.current_h
screen = pygame.display.set_mode((W, H), pygame.FULLSCREEN | pygame.HWSURFACE | pygame.DOUBLEBUF)
pygame.display.set_caption("Dino Runner")
clock  = pygame.time.Clock()

SC = min(W / 1280, H / 720)          # universal scale factor

# ── LAYOUT (all in scaled pixels) ────────────────────────────────────────────
GY   = H - int(70 * SC)              # ground Y (top of ground strip)
DH   = int(72 * SC)                  # dino draw height
DW   = int(52 * SC)                  # dino draw width
DREST = GY - DH                      # dino resting Y position

# ── FONTS ────────────────────────────────────────────────────────────────────
def mfont(sz, bold=False):
    for name in ("Segoe UI", "Arial Rounded MT Bold", "Verdana", None):
        try: return pygame.font.SysFont(name, int(sz * SC), bold=bold)
        except: pass

F_BIG = mfont(42, bold=True)
F_MED = mfont(28)
F_SM  = mfont(20)

# ── SEASONS ──────────────────────────────────────────────────────────────────
# Each season has: morning/day/evening/night sky variants, weather flags,
# ground colors, background palette.  Cycle order controlled by score.
SEASONS = [
    {
        "name": "Spring", "icon": "🌸",
        "variants": {
            "dawn":    {"sky": [(255,210,160),(255,170,100)], "light": 0.85},
            "day":     {"sky": [(135,206,250),(200,235,255)], "light": 1.0},
            "dusk":    {"sky": [(60,40,90),(230,110,60)],     "light": 0.7},
            "night":   {"sky": [(8,10,40),(18,22,70)],        "light": 0.3},
        },
        "ground":      (85, 155, 65),
        "ground_dark": (55, 110, 40),
        "tree_color":  (50, 130, 50),
        "flower":      True,
        "rain":        False,
        "snow":        False,
        "milestone":   0,
    },
    {
        "name": "Summer", "icon": "☀️",
        "variants": {
            "dawn":    {"sky": [(255,200,120),(255,230,160)], "light": 0.9},
            "day":     {"sky": [(80,170,255),(170,225,255)],  "light": 1.0},
            "dusk":    {"sky": [(50,25,75),(240,115,50)],     "light": 0.65},
            "night":   {"sky": [(5,8,35),(15,18,60)],         "light": 0.25},
        },
        "ground":      (100, 170, 60),
        "ground_dark": (65, 120, 35),
        "tree_color":  (30, 120, 40),
        "flower":      False,
        "rain":        True,           # summer storms at night
        "snow":        False,
        "milestone":   500,
    },
    {
        "name": "Autumn", "icon": "🍂",
        "variants": {
            "dawn":    {"sky": [(220,160,80),(255,200,120)],  "light": 0.8},
            "day":     {"sky": [(160,195,220),(210,230,240)], "light": 1.0},
            "dusk":    {"sky": [(60,30,70),(200,90,40)],      "light": 0.6},
            "night":   {"sky": [(10,8,30),(25,18,55)],        "light": 0.25},
        },
        "ground":      (110, 85, 45),
        "ground_dark": (75, 55, 25),
        "tree_color":  (180, 90, 30),
        "flower":      False,
        "rain":        True,
        "snow":        False,
        "milestone":   1200,
    },
    {
        "name": "Winter", "icon": "❄️",
        "variants": {
            "dawn":    {"sky": [(200,215,240),(230,240,255)], "light": 0.75},
            "day":     {"sky": [(160,195,230),(210,230,250)], "light": 0.9},
            "dusk":    {"sky": [(50,35,80),(150,100,130)],    "light": 0.55},
            "night":   {"sky": [(5,5,25),(12,15,50)],         "light": 0.2},
        },
        "ground":      (220, 230, 245),
        "ground_dark": (180, 195, 215),
        "tree_color":  (100, 115, 135),
        "flower":      False,
        "rain":        False,
        "snow":        True,
        "milestone":   2200,
    },
]

# Variant cycle per 200 score within a season
VARIANT_ORDER = ["dawn", "day", "dusk", "night"]

def get_season_variant(score):
    season = SEASONS[0]
    for s in SEASONS:
        if score >= s["milestone"]: season = s
    # cycle through variants every 200 score within the season
    cycle_score = score - season["milestone"]
    vi = int(cycle_score / 200) % 4
    variant_name = VARIANT_ORDER[vi]
    variant = season["variants"][variant_name]
    # enable weather only at night/dusk in rain/snow seasons
    do_rain = season["rain"] and variant_name in ("night", "dusk")
    do_snow = season["snow"]
    return season, variant_name, variant, do_rain, do_snow

# ── SKY CACHE ─────────────────────────────────────────────────────────────────
_sky_cache = {}
def sky_surf(key, c1, c2):
    if key not in _sky_cache:
        s = pygame.Surface((W, H))
        for y in range(H):
            t = y / H
            pygame.draw.line(s,
                (int(c1[0]+(c2[0]-c1[0])*t),
                 int(c1[1]+(c2[1]-c1[1])*t),
                 int(c1[2]+(c2[2]-c1[2])*t)), (0,y),(W,y))
        _sky_cache[key] = s
    return _sky_cache[key]

# ── CELESTIAL BODY ────────────────────────────────────────────────────────────
_star_data = [(random.randint(0,W), random.randint(0, int(GY*0.85)),
               random.random()*math.pi*2) for _ in range(140)]

def draw_stars(tick, alpha_mult=1.0):
    for sx,sy,ph in _star_data:
        b = max(0, min(255, int((140 + 115*math.sin(tick*0.035+ph)) * alpha_mult)))
        if b > 20:
            pygame.draw.circle(screen,(b,b,b),(sx,sy),1)

def draw_celestial(variant_name, season, tick):
    r = int(34*SC)
    # Sun or Moon depending on variant
    if variant_name == "night":
        # Moon
        mx = int(W*0.78 + math.sin(tick*0.0015)*50*SC)
        my = int(65*SC)
        pygame.draw.circle(screen,(230,230,200),(mx,my),r)
        # moon shadow crescent
        pygame.draw.circle(screen,(20,22,65),(mx+int(r*0.38),my),int(r*0.85))
        # glow
        g = pygame.Surface((r*5,r*5),pygame.SRCALPHA)
        pygame.draw.circle(g,(200,200,180,18),(r*5//2,r*5//2),r*5//2)
        screen.blit(g,(mx-r*5//2,my-r*5//2))
    elif variant_name == "dusk":
        sx = int(W*0.82 + math.sin(tick*0.002)*30*SC)
        sy = int(GY*0.55)
        c = (255,110,30)
        pygame.draw.circle(screen,c,(sx,sy),r)
        g = pygame.Surface((r*5,r*5),pygame.SRCALPHA)
        pygame.draw.circle(g,(*c,28),(r*5//2,r*5//2),r*5//2)
        screen.blit(g,(sx-r*5//2,sy-r*5//2))
    else:
        sx = int(W*0.8 + math.sin(tick*0.002)*35*SC)
        sy = int(60*SC)
        lgt = 1.0 if variant_name=="day" else 0.88
        c = tuple(int(v*lgt) for v in (255,245,120)) if variant_name=="day" else (255,220,120)
        pygame.draw.circle(screen,c,(sx,sy),r)
        g = pygame.Surface((r*5,r*5),pygame.SRCALPHA)
        pygame.draw.circle(g,(*c,22),(r*5//2,r*5//2),r*5//2)
        screen.blit(g,(sx-r*5//2,sy-r*5//2))

# ── PARTICLES ─────────────────────────────────────────────────────────────────
class Particle:
    __slots__ = ["kind","x","y","vx","vy","alpha","size","wobble"]
    def __init__(self, kind):
        self.kind = kind
        self.alpha = 255
        self.size  = 2
        self.wobble = 0.0
        self.reset_pos()

    def reset_pos(self):
        if self.kind == "rain":
            self.x  = random.uniform(0, W)
            self.y  = random.uniform(-H, 0)
            self.vx = random.uniform(-2, -0.8) * SC
            self.vy = random.uniform(16, 24) * SC
        elif self.kind == "snow":
            self.x  = random.uniform(0, W)
            self.y  = random.uniform(-H, 0)
            self.vx = random.uniform(-0.6, 0.6) * SC
            self.vy = random.uniform(1.2, 3.5) * SC
            self.size = random.randint(2, max(2, int(4*SC)))
            self.wobble = random.uniform(0, math.pi*2)
        elif self.kind == "dust":
            self.x  = int(160*SC) + random.randint(-5,5)
            self.y  = GY - random.randint(0, int(20*SC))
            self.vx = random.uniform(-4, -1)*SC
            self.vy = random.uniform(-1.5, -0.2)*SC
            self.size = random.randint(max(1,int(2*SC)), max(3,int(5*SC)))
            self.alpha = 230

    def update(self):
        if self.kind == "rain":
            self.x += self.vx; self.y += self.vy
            if self.y > GY: self.reset_pos()
        elif self.kind == "snow":
            self.wobble += 0.03
            self.x += self.vx + math.sin(self.wobble)*0.5*SC
            self.y += self.vy
            if self.y > GY: self.reset_pos()
        elif self.kind == "dust":
            self.x += self.vx; self.y += self.vy
            self.alpha -= 7
            if self.alpha <= 0 or self.x < 0: self.reset_pos(); self.alpha = 0

    def draw(self):
        if self.kind == "rain":
            pygame.draw.line(screen,(170,205,235),
                (int(self.x),int(self.y)),
                (int(self.x+self.vx),int(self.y+self.vy*0.28)),1)
        elif self.kind == "snow":
            pygame.draw.circle(screen,(235,243,255),(int(self.x),int(self.y)),max(1,self.size))
        elif self.kind == "dust" and self.alpha > 0:
            tmp = pygame.Surface((self.size*2+2,self.size*2+2),pygame.SRCALPHA)
            pygame.draw.circle(tmp,(215,195,155,max(0,int(self.alpha))),
                               (self.size+1,self.size+1),self.size)
            screen.blit(tmp,(int(self.x)-self.size,int(self.y)-self.size))

# ── CLOUD ─────────────────────────────────────────────────────────────────────
class Cloud:
    def __init__(self, spawn_offscreen=False):
        self.reset(spawn_offscreen)

    def reset(self, offscreen=True):
        self.x = float(W + random.randint(50,250) if offscreen else random.randint(0,W))
        self.y = random.randint(int(25*SC), int(120*SC))
        self.spd = random.uniform(0.7, 2.0)*SC
        self.w   = random.randint(int(70*SC), int(140*SC))
        self.h   = random.randint(int(28*SC), int(52*SC))
        self.alpha = random.randint(180, 240)

    def update(self):
        self.x -= self.spd
        if self.x < -200: self.reset()

    def draw(self, col):
        a = self.alpha
        c = tuple(min(255,v) for v in col)
        tmp = pygame.Surface((self.w+2, self.h+2), pygame.SRCALPHA)
        pygame.draw.ellipse(tmp, (*c,a), (0, self.h//3, self.w, int(self.h*0.7)))
        pygame.draw.ellipse(tmp, (*c,a), (self.w//5, 0, int(self.w*0.5), self.h))
        pygame.draw.ellipse(tmp, (*c,a), (int(self.w*0.45), self.h//5, int(self.w*0.45), int(self.h*0.85)))
        screen.blit(tmp,(int(self.x),int(self.y)))

# ── BACKGROUND TREES/HILLS ─────────────────────────────────────────────────────
class BGTree:
    def __init__(self, offscreen=True):
        self.reset(offscreen)

    def reset(self, offscreen=True):
        self.x    = float(W + random.randint(0,400) if offscreen else random.randint(-100,W))
        self.h    = random.randint(int(60*SC), int(150*SC))
        self.spd  = random.uniform(0.6,1.5)*SC
        self.kind = random.choice(["pine","round","dead"])

    def update(self, gspd):
        self.x -= self.spd*(gspd/8)
        if self.x < -180: self.reset()

    def draw(self, tree_col, light):
        x, h = int(self.x), self.h
        y = GY
        dim = tuple(int(v*light*0.6) for v in tree_col)
        trunk_w = max(4, int(8*SC))
        trunk_h = int(h*0.35)
        trunk_c = (int(90*light), int(60*light), int(30*light))
        # trunk
        pygame.draw.rect(screen, trunk_c,
            (x - trunk_w//2, y - trunk_h, trunk_w, trunk_h))
        if self.kind == "pine":
            for i in range(3):
                tier_h = int(h*(0.45 - i*0.08))
                tier_w = int((h*0.55)*(1 - i*0.22))
                pts = [(x, y-trunk_h - int(h*0.1) - i*int(h*0.22) - tier_h),
                       (x - tier_w//2, y - trunk_h - i*int(h*0.22)),
                       (x + tier_w//2, y - trunk_h - i*int(h*0.22))]
                pygame.draw.polygon(screen, dim, pts)
        elif self.kind == "round":
            r = int(h*0.42)
            pygame.draw.circle(screen, dim, (x, y-trunk_h-r+int(r*0.3)), r)
        else:  # dead / bare
            for bx,by,bw,bh2 in [(-int(20*SC),-int(h*0.6),int(6*SC),int(h*0.35)),
                                   (int(14*SC),-int(h*0.5),int(5*SC),int(h*0.28))]:
                pygame.draw.rect(screen, trunk_c,
                    (x+bx, y+by, bw, bh2))

class Hill:
    def __init__(self, offscreen=True):
        self.reset(offscreen)

    def reset(self, offscreen=True):
        self.x   = float(W+random.randint(0,600) if offscreen else random.randint(-200,W))
        self.r   = random.randint(int(120*SC), int(260*SC))
        self.spd = random.uniform(0.3, 0.8)*SC

    def update(self, gspd):
        self.x -= self.spd*(gspd/8)
        if self.x < -self.r*2: self.reset()

    def draw(self, season, light):
        c = tuple(int(v*light*0.55) for v in season["ground"])
        pygame.draw.circle(screen, c, (int(self.x), GY+int(self.r*0.25)), self.r)

# ── GROUND DETAILS ────────────────────────────────────────────────────────────
class GroundDetail:
    def __init__(self):
        self.x   = float(random.randint(0,W))
        self.kind= random.choice(["pebble","dash","grass"])
        self.spd = random.uniform(3, 7)*SC
        self.sz  = random.randint(max(2,int(2*SC)), max(4,int(5*SC)))

    def update(self, gspd):
        self.x -= self.spd*(gspd/8)
        if self.x < -20:
            self.x = float(W + random.randint(10,150))

    def draw(self, gc, gd):
        x = int(self.x)
        if self.kind=="pebble":
            pygame.draw.circle(screen, gd, (x, GY+int(12*SC)), self.sz)
        elif self.kind=="dash":
            pygame.draw.line(screen, gd, (x,GY+int(8*SC)),(x+int(12*SC),GY+int(8*SC)),
                             max(1,int(2*SC)))
        else:
            # little grass blade
            pygame.draw.line(screen, gd, (x,GY),(x-int(3*SC),GY-int(8*SC)),max(1,int(2*SC)))
            pygame.draw.line(screen, gd, (x,GY),(x+int(3*SC),GY-int(6*SC)),max(1,int(2*SC)))

# ── BEAUTIFUL DINO ────────────────────────────────────────────────────────────
class Dino:
    """
    Smooth, rounded, pleasant dino drawn entirely with pygame primitives.
    No squish. Stable animation. Correct jump physics.
    """
    GRAV    = 1.3 * SC        # pixels/frame²  (feels natural)
    JVEL    = -22.0 * SC      # initial jump velocity (enough to clear tallest spike)
    ANIM_T  = max(4, int(7/max(SC,0.5)))   # frames per animation step

    def __init__(self):
        self.x  = int(160*SC)
        self.y  = float(DREST)
        self.vy = 0.0
        self.on_ground = True
        self.dead = False
        self.frame = 0
        self.ft    = 0      # frame timer
        self.dust  = []
        # Pre-build all surfaces once
        self._run  = [self._make_run(i) for i in range(4)]
        self._jump = self._make_jump()
        self._dead = self._make_dead()
        self._cur  = self._run[0]

    # ── surface builders ────────────────────────────────────────────────────
    def _canvas(self):
        return pygame.Surface((DW, DH), pygame.SRCALPHA)

    def _draw_body(self, s):
        # All coordinates are in dino-local space, scaled
        sc = SC
        # colour palette — warm green, pleasant
        BODY  = (80,  195,  90)
        MID   = (60,  165,  68)
        DARK  = (38,  115,  45)
        BELLY = (185, 230, 175)
        EYE_W = (255, 255, 248)
        EYE_P = (25,   30,  25)
        EYE_H = (255, 255, 255)   # highlight
        CLAW  = (200, 185, 140)
        TOOTH = (240, 232, 205)
        # ── torso (rounded rect approximated with rects+circles)
        tx, ty = int(8*sc), int(26*sc)
        tw, th = int(32*sc), int(36*sc)
        pygame.draw.rect(s, BODY,  (tx, ty, tw, th))
        pygame.draw.circle(s,BODY, (tx,       ty+th//2), th//2)
        pygame.draw.circle(s,BODY, (tx+tw,    ty+th//2), th//2)
        # ── belly highlight
        pygame.draw.ellipse(s, BELLY, (tx+int(4*sc), ty+int(6*sc), int(20*sc), int(22*sc)))
        # ── neck
        pygame.draw.rect(s, BODY, (int(20*sc), int(12*sc), int(20*sc), int(18*sc)))
        # ── head (rounded)
        hx,hy,hw,hh = int(18*sc), int(4*sc), int(30*sc), int(22*sc)
        pygame.draw.rect(s, BODY, (hx, hy, hw, hh))
        pygame.draw.circle(s,BODY,(hx,     hy+hh//2), hh//2)
        pygame.draw.circle(s,BODY,(hx+hw,  hy+hh//2), hh//2)
        # ── snout protrusion
        pygame.draw.rect(s, BODY,  (int(42*sc), int(10*sc), int(10*sc), int(14*sc)))
        pygame.draw.circle(s,BODY, (int(52*sc), int(17*sc)), int(4*sc))
        # ── nostril
        pygame.draw.circle(s, DARK, (int(50*sc), int(11*sc)), max(1,int(2*sc)))
        # ── jaw / mouth line
        pygame.draw.arc(s, DARK,
            pygame.Rect(int(38*sc),int(18*sc),int(16*sc),int(8*sc)),
            math.pi, 2*math.pi, max(1,int(2*sc)))
        # ── teeth
        pygame.draw.polygon(s, TOOTH, [
            (int(42*sc),int(22*sc)),(int(46*sc),int(22*sc)),(int(44*sc),int(27*sc))])
        # ── eye white
        pygame.draw.circle(s, EYE_W, (int(38*sc),int(10*sc)), int(6*sc))
        # ── pupil (circular, friendly)
        pygame.draw.circle(s, EYE_P, (int(39*sc),int(11*sc)), int(3*sc))
        # ── eye highlight
        pygame.draw.circle(s, EYE_H, (int(41*sc),int(8*sc)),  max(1,int(2*sc)))
        # ── dorsal ridge bumps
        for i,bx in enumerate([22,27,32,37]):
            r2 = max(2, int((4-i*0.4)*sc))
            pygame.draw.circle(s, MID, (int(bx*sc), int(6*sc)), r2)
        # ── tail
        pts = [(int(8*sc),int(44*sc)),(int(2*sc),int(34*sc)),(0,int(50*sc)),
               (int(-8*sc),int(40*sc)),(int(-4*sc),int(58*sc)),(int(8*sc),int(54*sc))]
        pygame.draw.polygon(s, DARK, pts)
        pygame.draw.polygon(s, MID,  pts, max(1,int(2*sc)))
        # ── arm (small, cute)
        pygame.draw.rect(s, MID,  (int(26*sc),int(46*sc),int(12*sc),int(7*sc)))
        for ci in range(2):
            pygame.draw.line(s, CLAW,
                (int((28+ci*5)*sc),int(52*sc)),
                (int((27+ci*5)*sc),int(57*sc)), max(1,int(2*sc)))
        # ── scale pattern
        for sx2,sy2 in [(12,32),(20,36),(12,44),(20,48)]:
            pygame.draw.ellipse(s, MID,
                (int(sx2*sc),int(sy2*sc),int(8*sc),int(5*sc)))
        return s

    def _make_run(self, phase):
        s = self._draw_body(self._canvas())
        sc = SC
        lc = (50, 145, 60)
        fc = (38, 110, 46)
        # 4 frames: alternate leg stride
        strides = [(int(14*sc),int(8*sc)), (int(8*sc),int(14*sc)),
                   (int(12*sc),int(9*sc)), (int(7*sc),int(15*sc))]
        lh, rh = strides[phase]
        fw = int(11*sc)
        # left leg
        pygame.draw.rect(s, lc, (int(14*sc), int(60*sc), fw, lh))
        pygame.draw.rect(s, fc, (int(12*sc), int(60*sc)+lh, fw+int(3*sc), int(4*sc)))
        # right leg
        pygame.draw.rect(s, lc, (int(27*sc), int(60*sc), fw, rh))
        pygame.draw.rect(s, fc, (int(25*sc), int(60*sc)+rh, fw+int(3*sc), int(4*sc)))
        return s

    def _make_jump(self):
        s = self._draw_body(self._canvas())
        sc = SC
        lc = (50, 145, 60)
        # legs tucked together
        pygame.draw.rect(s, lc, (int(14*sc),int(60*sc),int(11*sc),int(7*sc)))
        pygame.draw.rect(s, lc, (int(27*sc),int(62*sc),int(11*sc),int(5*sc)))
        return s

    def _make_dead(self):
        s = self._draw_body(self._canvas())
        sc = SC
        # X eyes
        ex,ey = int(38*sc),int(10*sc)
        r = int(6*sc)
        pygame.draw.line(s,(220,40,40),(ex-r,ey-r),(ex+r,ey+r),max(2,int(2*sc)))
        pygame.draw.line(s,(220,40,40),(ex+r,ey-r),(ex-r,ey+r),max(2,int(2*sc)))
        return s

    # ── physics / animation ─────────────────────────────────────────────────
    def jump(self):
        if self.on_ground and not self.dead:
            self.vy = self.JVEL
            self.on_ground = False
            for _ in range(10):
                self.dust.append(Particle("dust"))

    def update(self):
        if not self.dead:
            self.vy += self.GRAV
            self.y  += self.vy
            if self.y >= DREST:
                self.y  = float(DREST)
                self.vy = 0.0
                self.on_ground = True
            # frame advance
            if self.on_ground:
                self.ft += 1
                if self.ft >= self.ANIM_T:
                    self.ft = 0
                    self.frame = (self.frame+1) % 4
            # update surface pointer
            if self.dead:          self._cur = self._dead
            elif not self.on_ground: self._cur = self._jump
            else:                  self._cur = self._run[self.frame]
        for p in self.dust: p.update()
        self.dust = [p for p in self.dust if p.alpha > 0]

    def draw(self):
        for p in self.dust: p.draw()
        screen.blit(self._cur, (self.x, int(self.y)))

    def get_rect(self):
        sc = SC
        # tight hitbox
        return pygame.Rect(int(self.x+int(10*sc)), int(self.y+int(6*sc)),
                           DW-int(20*sc), DH-int(12*sc))

# ── SPIKE OBSTACLES ──────────────────────────────────────────────────────────
# Spikes come in sets of 1–4, with varied heights.
# Max spike height is calibrated so the dino can always clear it.

MAX_SPIKE_H = int(55 * SC)   # single spike max height — dino clears this easily

class SpikeSet:
    """
    A group of 1-4 spikes. Each spike is a sharp triangle.
    Decorated with glow/shadow for a modern look.
    """
    COLORS = {
        "Spring": ((60,170,80),   (40,130,55),  (180,230,160)),  # body, dark, glow
        "Summer": ((220,180,50),  (170,130,30), (255,230,120)),
        "Autumn": ((190,100,40),  (140,65,20),  (240,170,100)),
        "Winter": ((170,195,225), (120,145,175),(230,245,255)),
    }

    def __init__(self, season_name, speed):
        sc = SC
        self.speed = speed
        self.count = random.choice([1, 1, 2, 2, 3, 4])
        self._counted = False
        # individual heights — each spike independently sized
        unit = int(28*sc)
        gap  = int(4*sc)
        self.heights  = [random.randint(int(22*sc), MAX_SPIKE_H) for _ in range(self.count)]
        self.widths   = [int(random.uniform(0.8,1.2)*unit) for _ in range(self.count)]
        self.total_w  = sum(self.widths) + gap*(self.count-1)
        self.x        = float(W + random.randint(0, int(150*sc)))
        self.season   = season_name
        self._surf    = self._build(season_name)

    def _build(self, sname):
        sc = SC
        key = sname if sname in self.COLORS else "Spring"
        body_c, dark_c, glow_c = self.COLORS[key]
        gap = int(4*sc)
        surf_h = MAX_SPIKE_H + int(12*sc)
        surf = pygame.Surface((self.total_w + int(8*sc), surf_h), pygame.SRCALPHA)
        cx = int(4*sc)
        for i in range(self.count):
            w  = self.widths[i]
            h  = self.heights[i]
            bx = cx
            by = surf_h - h
            # shadow (slightly wider, offset down)
            shd = (0,0,0,50)
            pts_shd = [(bx+int(2*sc),surf_h+int(3*sc)),
                       (bx+w+int(2*sc),surf_h+int(3*sc)),
                       (bx+w//2+int(2*sc),by+int(3*sc))]
            pygame.draw.polygon(surf,shd,pts_shd)
            # main spike body — gradient feel using two polygons
            pts = [(bx, surf_h), (bx+w, surf_h), (bx+w//2, by)]
            pygame.draw.polygon(surf, body_c, pts)
            # highlight on left face
            pts_hi = [(bx+w//2,by),(bx,surf_h),(bx+w//4,surf_h)]
            pygame.draw.polygon(surf, glow_c, pts_hi)
            # dark right face
            pts_dk = [(bx+w//2,by),(bx+w,surf_h),(bx+3*w//4,surf_h)]
            pygame.draw.polygon(surf, dark_c, pts_dk)
            # thin bright edge
            pygame.draw.line(surf,(255,255,255,80),
                (bx+w//2,by),(bx+w//2+int(1*sc),by+int(4*sc)),1)
            # base glow
            glow_surf = pygame.Surface((w+int(6*sc),int(10*sc)),pygame.SRCALPHA)
            pygame.draw.ellipse(glow_surf,(*glow_c,55),(0,0,w+int(6*sc),int(10*sc)))
            surf.blit(glow_surf,(bx-int(3*sc),surf_h-int(5*sc)))
            cx += w + gap
        return surf

    def update(self): self.x -= self.speed

    def draw(self):
        screen.blit(self._surf, (int(self.x), GY - self._surf.get_height() + int(8*SC)))

    def get_rect(self):
        sc = SC
        # collective bounding box (slightly inset for fairness)
        return pygame.Rect(int(self.x+int(6*sc)),
                           GY - MAX_SPIKE_H - int(4*sc),
                           self.total_w - int(8*sc),
                           MAX_SPIKE_H)

    def off_screen(self): return self.x < -self.total_w - 60

# ── HUD ───────────────────────────────────────────────────────────────────────
def draw_hud(score, season, variant_name, speed, combo, best, light):
    sc = SC
    # dim text on bright days
    text_c = (255,255,255) if light < 0.85 else (20,20,20)
    shadow_c = (0,0,0,120)

    def shadow_text(surf, x, y):
        tmp = pygame.Surface((surf.get_width()+2,surf.get_height()+2),pygame.SRCALPHA)
        tmp.fill((0,0,0,0))
        # draw shadow
        s2 = pygame.Surface(surf.get_size(), pygame.SRCALPHA)
        s2.blit(surf,(0,0))
        s2.fill((0,0,0,90), special_flags=pygame.BLEND_RGBA_MULT)
        screen.blit(s2,(x+2,y+2))
        screen.blit(surf,(x,y))

    # Score
    sc_s = F_MED.render(f"SCORE  {int(score):06d}", True, text_c)
    bs_s = F_SM.render(f"BEST  {int(best):06d}",    True, text_c)
    shadow_text(sc_s, W-sc_s.get_width()-int(18*sc), int(12*sc))
    shadow_text(bs_s, W-bs_s.get_width()-int(18*sc), int(42*sc))

    # Season + variant top-left
    lbl = F_SM.render(f"{season['icon']} {season['name']}  ·  {variant_name.capitalize()}",
                      True, text_c)
    shadow_text(lbl, int(14*sc), int(12*sc))

    # Speed bar
    spd_lbl = F_SM.render(f"SPD  {speed:.1f}", True, text_c)
    shadow_text(spd_lbl, int(14*sc), int(38*sc))
    bw_max = int(120*sc)
    bh2    = int(7*sc)
    bfill  = max(0, min(bw_max, int((speed-7.5)/7.5*bw_max)))
    bar_bg = pygame.Surface((bw_max, bh2), pygame.SRCALPHA)
    bar_bg.fill((0,0,0,80))
    screen.blit(bar_bg,(int(14*sc),int(58*sc)))
    pygame.draw.rect(screen,(80,220,120),(int(14*sc),int(58*sc),bfill,bh2))

    # Combo
    if combo > 2:
        ct = F_MED.render(f"×{combo} COMBO!", True,(255,215,0))
        shadow_text(ct, W//2-ct.get_width()//2, int(14*sc))

def draw_banner(text, tick, dur=100):
    fi = min(1.0, tick/22)
    fo = min(1.0, (dur-tick)/28)
    a  = max(0, min(255, int(255*fi*fo)))
    if a == 0: return
    surf = F_BIG.render(text, True, (255,255,200))
    bg   = pygame.Surface((surf.get_width()+int(50*SC), surf.get_height()+int(22*SC)),
                           pygame.SRCALPHA)
    bg.fill((0,0,0,min(190,a)))
    surf.set_alpha(a)
    screen.blit(bg,  (W//2-bg.get_width()//2,   H//2-int(70*SC)))
    screen.blit(surf,(W//2-surf.get_width()//2,  H//2-int(66*SC)))

def draw_game_over(score, best):
    ov = pygame.Surface((W,H),pygame.SRCALPHA)
    ov.fill((0,0,0,170)); screen.blit(ov,(0,0))
    sc = SC
    for surf,dy in [
        (F_BIG.render("GAME OVER", True,(255,75,75)),                -int(75*sc)),
        (F_MED.render(f"Score:  {int(score)}     Best:  {int(best)}",True,(255,255,255)),-int(18*sc)),
        (F_MED.render("ENTER  →  Restart       ESC  →  Quit",True,(195,195,195)), int(24*sc)),
    ]:
        # shadow
        ss = pygame.Surface(surf.get_size(), pygame.SRCALPHA)
        ss.blit(surf,(0,0)); ss.fill((0,0,0,100),special_flags=pygame.BLEND_RGBA_MULT)
        screen.blit(ss,(W//2-surf.get_width()//2+2,H//2+dy+2))
        screen.blit(surf,(W//2-surf.get_width()//2, H//2+dy))

def draw_start():
    screen.fill((10,14,36))
    sc = SC
    lines = [
        (F_BIG, "DINO RUNNER",        (90,220,105), -int(110*sc)),
        (F_MED, "Four Seasons",        (165,200,155),-int(58*sc)),
        (F_SM,  "SPACE / UP  →  Jump", (200,200,200), int(28*sc)),
        (F_SM,  "ESC  →  Quit",        (150,150,150), int(58*sc)),
    ]
    for font,text,col,dy in lines:
        s = font.render(text,True,col)
        screen.blit(s,(W//2-s.get_width()//2, H//2+dy))

# ── MAIN LOOP ─────────────────────────────────────────────────────────────────
def game_loop():
    dino    = Dino()
    clouds  = [Cloud(spawn_offscreen=False) for _ in range(5)]
    trees   = [BGTree(offscreen=False) for _ in range(8)]
    hills   = [Hill(offscreen=False) for _ in range(4)]
    details = [GroundDetail() for _ in range(16)]
    rain_p  = [Particle("rain") for _ in range(230)]
    snow_p  = [Particle("snow") for _ in range(140)]

    obstacles     = []
    score         = 0.0
    best          = 0
    speed         = 7.8
    tick          = 0
    game_over     = False
    started       = False
    combo         = 0
    banner        = None   # [text, ticks]
    prev_variant  = None

    sc = SC

    def spawn_obs():
        season,_,_,_,_ = get_season_variant(score)
        obstacles.append(SpikeSet(season["name"], speed))

    spawn_obs()

    while True:
        clock.tick(60)
        tick += 1

        for event in pygame.event.get():
            if event.type == pygame.QUIT: pygame.quit(); sys.exit()
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE: pygame.quit(); sys.exit()
                if not started:
                    if event.key in (pygame.K_SPACE, pygame.K_UP):
                        started = True; dino.jump()
                elif not game_over:
                    if event.key in (pygame.K_SPACE, pygame.K_UP):
                        dino.jump()
                else:
                    if event.key == pygame.K_RETURN: return

        if not started:
            draw_start(); pygame.display.flip(); continue

        season, variant_name, variant, do_rain, do_snow = get_season_variant(score)
        light = variant["light"]

        # banner on variant change
        if variant_name != prev_variant and prev_variant is not None:
            banner = [f"{season['icon']} {season['name']}  ·  {variant_name.capitalize()}", 0]
        prev_variant = variant_name

        # ── LOGIC ──────────────────────────────────────────────────────────
        if not game_over:
            score += speed * 0.05
            speed  = min(7.8 + score/280, 16.0)

            dino.update()

            for obs in obstacles:
                obs.update()
                if obs.x + int(60*sc) < dino.x and not obs._counted:
                    obs._counted = True; combo += 1

            obstacles = [o for o in obstacles if not o.off_screen()]

            # spawn gap: enough time to react, scales slightly with speed
            gap = random.randint(int(320*sc), int(520*sc))
            if not obstacles or obstacles[-1].x < W - gap:
                spawn_obs()

            dr = dino.get_rect()
            for obs in obstacles:
                if dr.colliderect(obs.get_rect()):
                    dino.dead = True; game_over = True
                    best = max(best, score); combo = 0

            for c in clouds: c.update()
            for t in trees:  t.update(speed)
            for h in hills:  h.update(speed)
            for d in details: d.update(speed)

            if do_rain:
                for p in rain_p: p.update()
            if do_snow:
                for p in snow_p: p.update()

        # ── DRAW SKY ───────────────────────────────────────────────────────
        c1,c2 = variant["sky"]
        # dim at night
        def dim(c): return tuple(max(0,min(255,int(v*light))) for v in c)
        sky_key = f"{season['name']}_{variant_name}"
        screen.blit(sky_surf(sky_key, dim(c1), dim(c2)), (0,0))

        # stars at night/dusk
        if variant_name == "night":
            draw_stars(tick, 1.0)
        elif variant_name == "dusk":
            draw_stars(tick, 0.4)

        draw_celestial(variant_name, season, tick)

        # hills (far bg)
        for h in hills: h.draw(season, light)

        # clouds
        cloud_col = tuple(max(0,min(255,int(v*min(1.0,light+0.15)))) for v in (245,248,255))
        for c in clouds: c.draw(cloud_col)

        # trees (mid bg)
        for t in trees: t.draw(season["tree_color"], light)

        # ground strip
        gc  = dim(season["ground"])
        gd  = dim(season["ground_dark"])
        pygame.draw.rect(screen, gd, (0, GY,        W, int(6*SC)))
        pygame.draw.rect(screen, gc, (0, GY+int(6*SC), W, H - GY))
        for d in details: d.draw(gc, gd)

        # weather
        if do_rain:
            for p in rain_p: p.draw()
        if do_snow:
            for p in snow_p: p.draw()

        # fog for winter day
        if season["name"]=="Winter" and variant_name in ("day","dawn"):
            fog = pygame.Surface((W,H),pygame.SRCALPHA)
            fog.fill((220,228,240,22))
            screen.blit(fog,(0,0))

        # obstacles
        for obs in obstacles: obs.draw()

        # dino
        dino.draw()

        # HUD
        lv = next((i+1 for i,s in reversed(list(enumerate(SEASONS))) if score>=s["milestone"]),1)
        draw_hud(score, season, variant_name, speed, combo, best, light)

        if banner:
            banner[1] += 1
            draw_banner(banner[0], banner[1])
            if banner[1] > 105: banner = None

        if game_over: draw_game_over(score, best)

        pygame.display.flip()

# ── ENTRY ──────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    while True:
        game_loop()
