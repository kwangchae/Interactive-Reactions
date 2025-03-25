let video; // 비디오
let handPose; // 손 인식
let hands = []; // 손 위치
let drawingCanvas; // 그림 그리기
let currentMode = "clear"; // 현재 모드
let currentColor = [0, 0, 0]; // 현재 색상
let brushSize = 8; // 브러쉬 크기
let lastX = 0; // 마지막 x 좌표
let lastY = 0; // 마지막 y 좌표
let lastGestureTime = 0; // 마지막 제스처 시간
const gestureDelay = 500; // 제스처 딜레이

// 버튼 정보
const buttons = [
  { x: 60, y: 50, size: 40, type: "like", color: [66, 103, 178], active: false, emoji: "👍" }, // 좋아요
  { x: 120, y: 50, size: 40, type: "heart", color: [255, 0, 0], active: false, emoji: "❤️" }, // 하트
  { x: 180, y: 50, size: 40, type: "laugh", color: [255, 215, 0], active: false, emoji: "😂" }, // 웃겨요
  { x: 240, y: 50, size: 40, type: "wow", color: [255, 140, 0], active: false, emoji: "😮" }, // 놀라워요
  { x: 300, y: 50, size: 40, type: "draw", color: [0, 0, 0], active: false, emoji: "✏️" }, // 그리기
  { x: 360, y: 50, size: 40, type: "clear", color: [255, 255, 255], active: false, emoji: "🧽" } // 지우기
];

function preload() { // 모델 로드
  handPose = ml5.handPose({ flipped: true }); // 손 인식 모델
}

function gotHands(results) { // 손 위치 가져오기
  hands = results; // 손 위치 저장
}

function setup() { 
  createCanvas(640, 480); // 캔버스 생성
  drawingCanvas = createGraphics(640, 480); // 그림 그리기 생성
  drawingCanvas.clear(); // 그림 그리기 초기화

  video = createCapture(VIDEO, { flipped: true }); // 비디오 캡쳐
  video.size(640, 480); // 비디오 크기
  video.hide(); // 비디오 숨기기

  handPose.detectStart(video, gotHands); // 손 인식 시작

  textAlign(CENTER, CENTER); // 텍스트 정렬
  textSize(24); // 텍스트 크기
  noStroke(); // 선 제거

  frameRate(60); // 프레임 설정
}

function draw() { 
  image(video, 0, 0); // 비디오 그리기
  image(drawingCanvas, 0, 0); // 그림 그리기
  drawButtons(); // 버튼 그리기
  if (hands.length > 0) { // 손이 인식되면
    let hand = hands[0]; // 첫 번째 손
    handleHandInteractions(hand); // 손 상호작용
  }
  displayReactions(); // 반응 표시
}

function drawButtons() { // 버튼 그리기
  for (let button of buttons) { // 버튼 반복
    fill(button.color); // 색상
    stroke(0); // 선 색상 (검정색)
    strokeWeight(2); // 선 두께
    ellipse(button.x, button.y, button.size); // 원 그리기

    if (button.active) { // 활성화되면
      noFill(); // 채우기 제거
      stroke(255, 255, 0);  // 노란색 선
      strokeWeight(3); // 선 두께
      ellipse(button.x, button.y, button.size + 10); // 원 그리기
    }

    noStroke(); // 선 제거
    fill(0); // 색상 (검정색)
    text(button.emoji, button.x, button.y); // 이모지 그리기
  }
}

function handleHandInteractions(hand) { // 손 상호작용
  let index = hand.index_finger_tip; // 검지 손가락 
  let thumb = hand.thumb_tip; // 엄지 손가락
  let pinchDistance = dist(index.x, index.y, thumb.x, thumb.y); // 핀치 거리
  let isPinching = pinchDistance < 20; // 핀치 여부
  
  if (isPinching && millis() - lastGestureTime > gestureDelay) { // 핀치하고 제스처 딜레이가 지났을 때
    for (let button of buttons) { // 버튼 반복
      if (dist(index.x, index.y, button.x, button.y) < button.size) { // 버튼을 클릭했을 때
        //buttons.forEach(b => b.active = false); // 모든 버튼 비활성화
        if(button.active) { // 버튼이 활성화되어 있으면
          button.active = false; // 버튼 비활성화
          currentMode = "clear"; // 모드 초기화
          drawingCanvas.clear(); // 그림 지우기
        } else {
          button.active = true; // 버튼 활성화
          handleButtonAction(button.type); // 버튼 액션
        }
        lastGestureTime = millis(); // 제스처 시간 업데이트
      }
    }
  }
  
  if (currentMode === "draw") { // 그리기 모드일 때
    if (lastX !== 0 && lastY !== 0) { // 마지막 좌표가 있을 때
      drawingCanvas.stroke(currentColor); // 색상
      drawingCanvas.strokeWeight(brushSize); // 브러쉬 크기
      drawingCanvas.line(lastX, lastY, index.x, index.y); // 선 그리기
    }
    lastX = index.x; // 마지막 x 좌표 업데이트
    lastY = index.y; // 마지막 y 좌표 업데이트
  } else { // 그리기 모드가 아닐 때
    lastX = 0; // 마지막 x 좌표 초기화
    lastY = 0; // 마지막 y 좌표 초기화
  }
  fill(255, 0, 0, 150); // 색상 (빨간색) 
  noStroke(); // 선 제거 
  ellipse(index.x, index.y, 15); // 원 그리기 (검지 손가락) 
}

function handleButtonAction(type) { // 버튼 액션
  switch (type) { // 버튼 타입에 따라
    case "like": currentMode = "react"; break; // 좋아요
    case "heart": currentMode = "react"; break; // 하트
    case "laugh": currentMode = "react"; break; // 웃겨요
    case "wow": currentMode = "react"; break; // 놀라워요
    case "draw": // 그리기
      currentMode = "draw"; // 그리기 모드
      currentColor = [0, 0, 0]; // 색상 초기화 (검정색)
      brushSize = 8; // 브러쉬 크기
      break;
    case "clear": // 지우기
      currentMode = "clear"; // 모드 초기화
      drawingCanvas.clear(); // 그림 지우기
      break;
  }
}

function displayReactions() { // 반응 표시
  const reactionSize = 100; // 반응 크기
  const padding = 20; // 간격
  let offsetY = 0; // y 좌표
  for (let button of buttons) { // 버튼 반복
    if (button.active && ["like", "heart", "laugh", "wow"].includes(button.type)) { // 활성화되어 있고 반응 버튼일 때
      fill(button.color); // 색상 
      noStroke(); // 선 제거
      ellipse(width - reactionSize/2 - padding,  // 원 그리기
              height - reactionSize/2 - padding - offsetY,  // x, y 좌표
              reactionSize); // 크기
      textSize(reactionSize * 0.6); // 텍스트 크기
      text(button.emoji,  // 이모지 텍스트
           width - reactionSize/2 - padding,  // x 좌표
           height - reactionSize/2 - padding - offsetY); // y 좌표
      textSize(18); // 텍스트 크기
      offsetY += reactionSize + padding; // y 좌표 업데이트
    }
  }
}