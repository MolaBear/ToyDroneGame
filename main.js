const popupButton = document.getElementById('popup-button');
const popupContainer = document.getElementById('popup-container');

popupButton.addEventListener('click', () => {
    if (popupContainer.style.display === 'none' || popupContainer.style.display === '') {
    popupContainer.style.display = 'block';
    } else {
    popupContainer.style.display = 'none';
    }
});

const closeButton = document.getElementById('popup-close-btn');
closeButton.addEventListener('click', () => {
    popupContainer.style.display = 'none';
});

// Get the canvas and its context
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Constants for the game grid
const gridSize = 11;
const unitSize = canvas.width / gridSize;
const droneSize = unitSize;
canvas.height = unitSize * 12;
canvas.width = unitSize * 12;

// Define a class for the drone
class Drone {
    constructor() {
        this.position = { x: 0, y: -1 };
        this.direction = 'NORTH';
        this.active = false;

        this.images = {
            'NORTH': new Image(),
            'SOUTH': new Image(),
            'EAST': new Image(),
            'WEST': new Image(),
        };
        this.loadImages();

        // Initialize the active image
        this.image = this.images['NORTH'];
        this.explosionActive = false;
    }

    // Load drone images
    loadImages() {
        this.images['NORTH'].src = './image/drone_north.png';
        this.images['SOUTH'].src = './image/drone_south.png';
        this.images['EAST'].src = './image/drone_east.png';
        this.images['WEST'].src = './image/drone_west.png';
    }

    // Place the drone on the grid
    place(x, y, direction) {
        if (this.isValidPosition(x, y)) {
            this.position.x = x;
            this.position.y = y;
            this.direction = direction;
            this.active = true;
            this.draw();
        }
    }

    // Move the drone
    move() {
        if (!this.active) return;

        // Define movement deltas based on direction
        const movementDeltas = {
            'NORTH': { dx: 0, dy: -1 },
            'SOUTH': { dx: 0, dy: 1 },
            'EAST': { dx: 1, dy: 0 },
            'WEST': { dx: -1, dy: 0 },
        };

        const delta = movementDeltas[this.direction];

        if (!delta) return; // Invalid direction

        const newX = this.position.x + delta.dx;
        const newY = this.position.y + delta.dy;

        if (this.isValidPosition(newX, newY)) {
            this.position.x = newX;
            this.position.y = newY;
            this.draw();
        }
    }

    // Rotate the drone to the left
    left() {
        if (!this.active) return;
        switch (this.direction) {
            case 'NORTH':
                this.direction = 'WEST';
                this.image = this.images['WEST']; // Change to the west-facing image
                break;
            case 'SOUTH':
                this.direction = 'EAST';
                this.image = this.images['EAST']; // Change to the east-facing image
                break;
            case 'EAST':
                this.direction = 'NORTH';
                this.image = this.images['NORTH']; // Change to the north-facing image
                break;
            case 'WEST':
                this.direction = 'SOUTH';
                this.image = this.images['SOUTH']; // Change to the south-facing image
                break;
        }
        this.draw();
    }

    // Rotate the drone to the right
    right() {
        if (!this.active) return;
        switch (this.direction) {
            case 'NORTH':
                this.direction = 'EAST';
                this.image = this.images['EAST']; // Change to the west-facing image
                break;
            case 'SOUTH':
                this.direction = 'WEST';
                this.image = this.images['WEST']; // Change to the west-facing image
                break;
            case 'EAST':
                this.direction = 'SOUTH';
                this.image = this.images['SOUTH']; // Change to the west-facing image
                break;
            case 'WEST':
                this.direction = 'NORTH';
                this.image = this.images['NORTH']; // Change to the west-facing image
                break;
        }
        this.draw();
    }

    // Get a report of the drone's status
    report() {
        if (!this.active) return 'Drone is not on the surface.';
        return `Current position: (${this.position.x}, ${-this.position.y + 10}), facing ${this.direction}`;
    }

    // Simulate an attack action
    attack() {
        
        if (!this.active || this.explosionActive) return;
    
        const targetPosition = calculateTargetPosition(this.position, this.direction);
    
        if (this.isValidPosition(targetPosition.x, targetPosition.y)) {
            this.explosionActive = true; // Set explosion as active
            this.drawExplosion(targetPosition.x, targetPosition.y);
    
            setTimeout(() => {
                this.explosionActive = false;
                this.draw(); // Redraw the drone
            }, 3000);
        }
    }

    // Draw the drone on the canvas
    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const x = this.position.x * unitSize + unitSize / 4;
        const y = this.position.y * unitSize + unitSize / 4;

        // Draw the drone image at the updated position
        ctx.drawImage(this.image, x, y, droneSize, droneSize);
    }

    // Draw an explosion at the specified position
    drawExplosion(x, y) {
        if (this.explosionActive) {
            const explosionImage = new Image();
            explosionImage.src = './image/explosion.png'; 
            ctx.drawImage(explosionImage, x * unitSize + unitSize / 4, y * unitSize + unitSize / 4, droneSize, droneSize);
        }
    }

    // Check if a position is within the valid grid boundaries
    isValidPosition(x, y) {
        return x >= 0 && x < gridSize && y >= 0 && y < gridSize;
    }
}

// Calculate position of projectile to be fired
function calculateTargetPosition(position, direction) {
    let targetX = position.x;
    let targetY = position.y;

    switch (direction) {
        case 'NORTH':
            targetY -= 2;
            break;
        case 'SOUTH':
            targetY += 2;
            break;
        case 'EAST':
            targetX += 2;
            break;
        case 'WEST':
            targetX -= 2;
            break;
    }

    return { x: targetX, y: targetY };
}

// Get the feedback element
const feedback = document.getElementById('feedback-popup');

function showFeedback(type, message) {
    const popup = document.getElementById("feedback-popup");
    popup.textContent = message;
    popup.className = `feedback-popup ${type}`;
    popup.style.display = "block";
  
    // Close the popup after a set duration (e.g., 3 seconds)
    setTimeout(() => {
      popup.style.display = "none";
    }, 3000);
  }

// Create a new Drone instance
const drone = new Drone();

// Event listeners for buttons
document.getElementById('place-button').addEventListener('click', () => {
    drone.place(0, 10, 'NORTH');
    feedback.innerText = 'Drone placed.';
});

document.getElementById('move-button').addEventListener('click', () => {
    if (drone.active) {
        drone.move();
        showFeedback("general", "Drone moved.");
      } else {
        feedback.innerText = 'Drone is not on the surface.';
      }
});

document.getElementById('left-button').addEventListener('click', () => {
    if (drone.active) {
        drone.left();
        feedback.innerText = 'Drone turned left.';
      } else {
        feedback.innerText = 'Drone is not on the surface.';
      }
});

document.getElementById('right-button').addEventListener('click', () => {
    if (drone.active) {
        drone.right();
        feedback.innerText = 'Drone turned right.';
      } else {
        feedback.innerText = 'Drone is not on the surface.';
      }
});

document.getElementById('report-button').addEventListener('click', () => {
    if (drone.active) {
        const report = drone.report();
        showFeedback("general", report);
      } else {
        feedback.innerText = 'Drone is not on the surface.';
      }
});

document.getElementById('attack-button').addEventListener('click', () => {
    if (drone.active) {
        const targetPosition = calculateTargetPosition(drone.position, drone.direction);

        if (drone.isValidPosition(targetPosition.x, targetPosition.y)) {
            drone.attack();
            showFeedback("success", "Drone attacked.");
        } else {
            showFeedback("error", "The ship is too close to the edge. It can't attack from this position; it needs at least 8 spaces.");
        }
      } else {
        feedback.innerText = 'Drone is not on the surface.';
      }
});

// Event listener for keyboard input
addEventListener('keydown', ({ key }) => {
    switch (key) {
        case 'Enter':
            drone.place(0, 10, 'NORTH');
            feedback.innerText = 'Drone placed.';
            break;
        case 'ArrowLeft':
            case 'a':
            if (drone.active) {
                drone.left();
                feedback.innerText = 'Drone turned left.';
              } else {
                feedback.innerText = 'Drone is not on the surface.';
              }
            break;
        case 'ArrowRight':
            case 'd':
            if (drone.active) {
                drone.right();
                feedback.innerText = 'Drone turned right.';
              } else {
                feedback.innerText = 'Drone is not on the surface.';
              }
            break;
        case ' ':
            if (drone.active) {
                const targetPosition = calculateTargetPosition(drone.position, drone.direction);
        
                if (drone.isValidPosition(targetPosition.x, targetPosition.y)) {
                    drone.attack();
                    showFeedback("success", "Drone attacked.");
                } else {
                    showFeedback("error", "The ship is too close to the edge. It can't attack from this position; it needs at least 8 spaces.");
                }
              } else {
                feedback.innerText = 'Drone is not on the surface.';
              }
            break;
        case 'ArrowUp':
            case 'w':
            if (drone.active) {
                drone.move();
                showFeedback("general", "Drone moved.");
              } else {
                feedback.innerText = 'Drone is not on the surface.';
              }
            break;
    }
});
