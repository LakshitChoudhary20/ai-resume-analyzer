import pygame
import random
import os
import sys

# Initialize
pygame.init()
WIDTH, HEIGHT = 800, 400
win = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Pixel Dino Runner")
clock = pygame.time.Clock()
font = pygame.font.SysFont('Segoe UI', 24)

# Load images
dino_img = pygame.image.load("dino.png")
dino_img = pygame.transform.scale(dino_img, (70, 70))  # Enlarged dino

spike1_img = pygame.transform.scale(pygame.image.load("spike1.png"), (30, 60))
spike3_img = pygame.transform.scale(pygame.image.load("spike3.png"), (50, 60))  # triple spike
spike_imgs = [spike1_img, spike3_img]

cloud_img = pygame.image.load("cloud.jpg")
cloud_img = pygame.transform.scale(cloud_img, (80, 40))

# Colors
bg_color = (245, 245, 255)
ground_color = (50, 50, 50)

# Dino Class
class Dino:
    def __init__(self):
        self.img = dino_img
        self.x = 100
        self.y = HEIGHT - 110       # 70px dino aligned with ground
        self.vel_y = 0
        self.jump = False
        self.gravity = 1

    def draw(self):
        win.blit(self.img, (self.x, self.y))

    def update(self):
        if self.jump:
            self.vel_y = -15
            self.jump = False

        self.vel_y += self.gravity
        self.y += self.vel_y

        if self.y >= HEIGHT - 110:  # Correct ground clamp
            self.y = HEIGHT - 110
            self.vel_y = 0

# Spike Class
class Spike:
    def __init__(self):
        self.img = random.choice(spike_imgs)
        self.x = WIDTH + random.randint(0, 300)
        self.y = HEIGHT - 100
        self.width = self.img.get_width()

    def draw(self):
        win.blit(self.img, (self.x, self.y))

    def update(self, speed):
        self.x -= speed

    def collide(self, dino_rect):
        return dino_rect.colliderect(
            pygame.Rect(self.x, self.y, self.width, 60)
        )

# Cloud Class
class Cloud:
    def __init__(self):
        self.x = random.randint(0, WIDTH)
        self.y = random.randint(20, 100)
        self.speed = random.uniform(1, 2)

    def draw(self):
        win.blit(cloud_img, (self.x, self.y))

    def update(self):
        self.x -= self.speed
        if self.x < -100:
            self.x = WIDTH + random.randint(100, 300)
            self.y = random.randint(20, 100)

# Game Loop
def main():
    run = True
    speed = 8
    score = 0
    dino = Dino()
    spikes = [Spike()]
    clouds = [Cloud() for _ in range(3)]
    game_over = False

    while run:
        clock.tick(60)
        win.fill(bg_color)

        # Draw ground
        pygame.draw.rect(win, ground_color, (0, HEIGHT - 40, WIDTH, 40))

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                run = False

            if not game_over:
                if event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_SPACE and dino.y == HEIGHT - 110:
                        dino.jump = True

            if game_over:
                if event.type == pygame.KEYDOWN and event.key == pygame.K_RETURN:
                    main()

        if not game_over:
            # Clouds
            for cloud in clouds:
                cloud.update()
                cloud.draw()

            # Dino
            dino.update()
            dino.draw()

            # Spikes
            for spike in spikes:
                spike.update(speed)
                spike.draw()

                if spike.collide(pygame.Rect(dino.x, dino.y, 70, 70)):  # Updated collision
                    game_over = True

            # Spawn new spikes
            if spikes[-1].x < WIDTH - 300:
                spikes.append(Spike())

            # Remove old spikes
            if spikes[0].x < -100:
                spikes.pop(0)

            # Score
            score += 0.1
            score_text = font.render("Score: " + str(int(score)), True, (20, 20, 20))
            win.blit(score_text, (10, 10))

        else:
            over_text = font.render("Game Over! Press Enter to Restart", True, (200, 0, 0))
            score_text = font.render("Final Score: " + str(int(score)), True, (50, 50, 50))
            win.blit(over_text, (WIDTH//2 - over_text.get_width()//2, HEIGHT//2 - 30))
            win.blit(score_text, (WIDTH//2 - score_text.get_width()//2, HEIGHT//2 + 10))

        pygame.display.update()

    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()
