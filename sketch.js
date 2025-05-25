let segments = [];
let showInstructions = true;

let resetButton, downloadButton, helpButton;

const instructions = [
  "Click a segment to split it horizontally/vertically",
  "Segments alternate black/white gradients with random opacity",
  "Each split creates new random opacities (50-100%)",
  "Segments scroll at unique speeds",
  "Use Reset to start over",
  "Use Download to save your image",
  "Use ? to toggle instructions"
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

function drawGradientRect(x, y, w, h, whiteToBlack, opacity) {
  let ctx = drawingContext;
  let grad = ctx.createLinearGradient(x, y, x + w, y);
  
  if (whiteToBlack) {
    grad.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
    grad.addColorStop(1, `rgba(0, 0, 0, ${opacity})`);
  } else {
    grad.addColorStop(0, `rgba(0, 0, 0, ${opacity})`);
    grad.addColorStop(1, `rgba(255, 255, 255, ${opacity})`);
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
      if (mouseX >= x && mouseX <= x + (seg.right - seg.left) &&
          mouseY >= seg.top && mouseY <= seg.bottom) {
        found = true;
        break;
      }
    }

    if (found) {
      // Generate new properties
      let newOpacity = random(0.5, 1);
      let newSpeed = random(-2.5, 2.5);
      let splitVertical = random() < 0.5;

      // Actual split logic
      if (splitVertical) {
        let splitX = constrain(mouseX - seg.xOffset, seg.left + 1, seg.right - 1);
        segments.splice(i, 1,
          { ...seg, right: splitX, opacity: newOpacity, speed: newSpeed, useWhite: !seg.useWhite },
          { ...seg, left: splitX, opacity: newOpacity, speed: -newSpeed, useWhite: !seg.useWhite }
        );
      } else {
        let splitY = constrain(mouseY, seg.top + 1, seg.bottom - 1);
        segments.splice(i, 1,
          { ...seg, bottom: splitY, opacity: newOpacity, speed: newSpeed, useWhite: !seg.useWhite },
          { ...seg, top: splitY, opacity: newOpacity, speed: -newSpeed, useWhite: !seg.useWhite }
        );
      }
      break;
    }
  }
}

// UI and helper functions remain same as previous version
// (setupButtons, resetSegments, windowResized, styleButton)

function setupButtons() {
  resetButton = createButton('Reset');
  styleButton(resetButton, 10, 5, '#333');
  resetButton.mousePressed(() => resetSegments());

  downloadButton = createButton('Download');
  styleButton(downloadButton, 100, 5, '#333');
  downloadButton.mousePressed(() => saveCanvas('gradient-art', 'png'));

  helpButton = createButton('?');
  styleButton(helpButton, 220, 5, '#444');
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
  resetButton.position(10, 5);
  downloadButton.position(100, 5);
  helpButton.position(220, 5);
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
