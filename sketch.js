let segments = [];
let showInstructions = true;

let closeButton, resetButton, downloadButton, helpButton;

const instructions = [
  "Click a segment to split it horizontally or vertically (whichever is closer).",
  "Segments alternate black/white gradients with random opacity.",
  "Each split creates new random opacities (50-100%).",
  "Segments scroll at unique speeds and wrap seamlessly.",
  "No overlaps, no strokes.",
  "Use Reset to start over.",
  "Use Download to save your image.",
  "Use ? to toggle instructions.",
  "Use X to visit modelcollapse.github.io."
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  setupButtons();
  resetSegments();
}

function draw() {
  background(0);

  for (let seg of segments) {
    seg.xOffset += seg.speed;
    let w = seg.right - seg.left;
    let h = seg.bottom - seg.top;

    // Draw 3 copies for seamless wrapping
    for (let k = -1; k <= 1; k++) {
      let x = seg.left + seg.xOffset + k * width;
      drawGradientRect(x, seg.top, w, h, seg.useWhite, seg.opacity);
    }

    // Keep offset within bounds
    if (seg.xOffset > width) seg.xOffset -= width;
    if (seg.xOffset < -width) seg.xOffset += width;
  }

  if (showInstructions) {
    fill(255);
    textSize(16);
    textAlign(LEFT, TOP);
    let y = 55;
    for (let line of instructions) {
      text(line, 15, y, width - 30, 30);
      y += 24;
    }
  }
}

// Draws a horizontal gradient rectangle with opacity
function drawGradientRect(x, y, w, h, whiteToBlack, opacity) {
  let ctx = drawingContext;
  let grad = ctx.createLinearGradient(x, y, x + w, y);

  if (whiteToBlack) {
    grad.addColorStop(0, `rgba(255,255,255,${opacity})`);
    grad.addColorStop(1, `rgba(0,0,0,${opacity})`);
  } else {
    grad.addColorStop(0, `rgba(0,0,0,${opacity})`);
    grad.addColorStop(1, `rgba(255,255,255,${opacity})`);
  }

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.closePath();
  ctx.clip();
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

function mousePressed() {
  if (mouseY < 40 || (showInstructions && mouseY < 45 + instructions.length * 24)) return;

  for (let i = 0; i < segments.length; i++) {
    let seg = segments[i];
    let found = false;

    // Check all wrapped positions
    for (let k = -1; k <= 1; k++) {
      let x = seg.left + seg.xOffset + k * width;
      if (
        mouseX >= x && mouseX <= x + (seg.right - seg.left) &&
        mouseY >= seg.top && mouseY <= seg.bottom
      ) {
        found = true;
        break;
      }
    }

    if (found) {
      // Generate new properties
      let newOpacity = random(0.5, 1);
      let newSpeed = random(-2.5, 2.5);
      let nextUseWhite = !seg.useWhite;

      // Decide split direction based on proximity to center
      let segWidth = seg.right - seg.left;
      let segHeight = seg.bottom - seg.top;
      let distToCenterX = abs(mouseX - (seg.left + segWidth / 2));
      let distToCenterY = abs(mouseY - (seg.top + segHeight / 2));
      if (distToCenterX < distToCenterY) {
        // Split vertically
        let splitX = constrain(mouseX - seg.xOffset, seg.left + 1, seg.right - 1);
        segments.splice(i, 1,
          { top: seg.top, bottom: seg.bottom, left: seg.left, right: splitX, xOffset: seg.xOffset, speed: newSpeed, useWhite: nextUseWhite, opacity: newOpacity },
          { top: seg.top, bottom: seg.bottom, left: splitX, right: seg.right, xOffset: seg.xOffset, speed: -newSpeed, useWhite: nextUseWhite, opacity: newOpacity }
        );
      } else {
        // Split horizontally
        let splitY = constrain(mouseY, seg.top + 1, seg.bottom - 1);
        segments.splice(i, 1,
          { top: seg.top, bottom: splitY, left: seg.left, right: seg.right, xOffset: seg.xOffset, speed: newSpeed, useWhite: nextUseWhite, opacity: newOpacity },
          { top: splitY, bottom: seg.bottom, left: seg.left, right: seg.right, xOffset: seg.xOffset, speed: -newSpeed, useWhite: nextUseWhite, opacity: newOpacity }
        );
      }
      break;
    }
  }
}

function setupButtons() {
  closeButton = createButton('X');
  styleButton(closeButton, 10, 5, 'red');
  closeButton.mousePressed(() => {
    window.open('https://modelcollapse.github.io/', '_blank');
  });

  resetButton = createButton('Reset');
  styleButton(resetButton, 50, 5, '#333');
  resetButton.mousePressed(() => resetSegments());

  downloadButton = createButton('Download');
  styleButton(downloadButton, 140, 5, '#333');
  downloadButton.mousePressed(() => saveCanvas('gradient-art', 'png'));

  helpButton = createButton('?');
  styleButton(helpButton, 260, 5, '#444');
  helpButton.style('font-weight', 'bold');
  helpButton.mousePressed(() => showInstructions = !showInstructions);
}

function resetSegments() {
  segments = [{
    top: 0,
    bottom: height,
    left: 0,
    right: width,
    xOffset: 0,
    speed: random(-1.5, 1.5),
    useWhite: false,
    opacity: random(0.5, 1)
  }];
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  closeButton.position(10, 5);
  resetButton.position(50, 5);
  downloadButton.position(140, 5);
  helpButton.position(260, 5);
  resetSegments();
}

function styleButton(btn, x, y, bg) {
  btn.position(x, y);
  btn.style('color', 'white');
  btn.style('background', bg);
  btn.style('border', 'none');
  btn.style('font-size', '16px');
  btn.style('padding', '5px 15px');
  btn.style('border-radius', '5px');
  btn.style('cursor', 'pointer');
  btn.style('z-index', '1000');
}
