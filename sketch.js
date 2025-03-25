const maxCircles = 40;
let circles = [];
let video;
let handPose;
let hands = [];
let drawingCanvas;
let currentMode = "clear";
let currentColor = [0, 0, 0];
let brushSize = 8;
let lastX = 0;
let lastY = 0;
let lastGestureTime = 0;
const gestureDelay = 500;

const buttons = [
  { x: 60, y: 50, size: 40, type: "like", color: [66, 103, 178], active: false, emoji: "👍" },
  { x: 120, y: 50, size: 40, type: "heart", color: [255, 0, 0], active: false, emoji: "❤️" },
  { x: 180, y: 50, size: 40, type: "laugh", color: [255, 215, 0], active: false, emoji: "😂" },
  { x: 240, y: 50, size: 40, type: "wow", color: [255, 140, 0], active: false, emoji: "😮" },
  { x: 300, y: 50, size: 40, type: "draw", color: [0, 0, 0], active: false, emoji: "✏️" },
  { x: 360, y: 50, size: 40, type: "erase", color: [255, 255, 255], active: false, emoji: "🧽" },
  { x: 420, y: 50, size: 40, type: "clear", color: [128, 128, 128], active: false, emoji: "🗑️" }
];

function preload() {
  handPose = ml5.handPose({ flipped: true });
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(640, 480);
  drawingCanvas = createGraphics(640, 480);
  drawingCanvas.clear();

  video = createCapture(VIDEO, { flipped: true });
  video.size(640, 480);
  video.hide();

  handPose.detectStart(video, gotHands);
  textAlign(CENTER, CENTER);
  textSize(24);
  noStroke();
  frameRate(60);
}

function draw() {
  image(video, 0, 0);
  image(drawingCanvas, 0, 0);
  drawButtons();
  if (hands.length > 0) {
    let hand = hands[0];
    handleHandInteractions(hand);
  }
  displayReactions();
}

function drawButtons() {
  for (let button of buttons) {
    fill(button.color);
    stroke(0);
    strokeWeight(2);
    ellipse(button.x, button.y, button.size);

    if (button.active) {
      noFill();
      stroke(255, 255, 0);
      strokeWeight(3);
      ellipse(button.x, button.y, button.size + 10);
    }

    noStroke();
    fill(0);
    text(button.emoji, button.x, button.y);
  }
}

function handleHandInteractions(hand) {
  let index = hand.index_finger_tip;
  let thumb = hand.thumb_tip;
  let pinchDistance = dist(index.x, index.y, thumb.x, thumb.y);
  let isPinching = pinchDistance < 20;
  
  if (isPinching && millis() - lastGestureTime > gestureDelay) {
    for (let button of buttons) {
      if (dist(index.x, index.y, button.x, button.y) < button.size) {
        buttons.forEach(b => b.active = false);
        if(button.active === true) {
          button.active = false;
        } else {
          button.active = true;
        }
        handleButtonAction(button.type);
        lastGestureTime = millis();
      }
    }
  }
  
  if (currentMode === "draw" || currentMode === "erase") {
    if (lastX !== 0 && lastY !== 0) {
      drawingCanvas.stroke(currentMode === "draw" ? currentColor : [255, 255, 255]);
      drawingCanvas.strokeWeight(currentMode === "draw" ? brushSize : 30);
      drawingCanvas.line(lastX, lastY, index.x, index.y);
    }
    lastX = index.x;
    lastY = index.y;
  } else {
    lastX = 0;
    lastY = 0;
  }
  fill(255, 0, 0, 150);
  noStroke();
  ellipse(index.x, index.y, 15);
}

function handleButtonAction(type) {
  switch (type) {
    case "like": currentMode = "react"; break;
    case "heart": currentMode = "react"; break;
    case "laugh": currentMode = "react"; break;
    case "wow": currentMode = "react"; break;
    case "draw":
      currentMode = "draw";
      currentColor = [0, 0, 0];
      brushSize = 8;
      break;
    case "erase":
      currentMode = "erase";
      break;
    case "clear":
      currentMode = "clear";
      drawingCanvas.clear();
      break;
  }
}

function displayReactions() {
  const reactionSize = 100;
  const padding = 20;
  let offsetY = 0;
  for (let button of buttons) {
    if (button.active && ["like", "heart", "laugh", "wow"].includes(button.type)) {
      fill(button.color);
      noStroke();
      ellipse(width - reactionSize/2 - padding, 
              height - reactionSize/2 - padding - offsetY, 
              reactionSize);
      textSize(reactionSize * 0.6);
      text(button.emoji, 
           width - reactionSize/2 - padding, 
           height - reactionSize/2 - padding - offsetY);
      textSize(18);
      offsetY += reactionSize + padding;
    }
  }
}