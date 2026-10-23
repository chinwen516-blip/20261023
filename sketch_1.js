// =====================================================
// p5.js 響應式國中七年級歷史選擇題測驗系統
// =====================================================

// -------------------------
// Google Fonts 字型名稱
// -------------------------

// 中文使用 LXGW WenKai TC
const chineseFont = "LXGW WenKai TC";

// 英文與數字使用 Changa One
const englishFont = "Changa One";

// -------------------------
// 五題國中七年級歷史題庫
// answer 為正確答案的索引值
// -------------------------
const questions = [
  {
    question: "秦始皇在哪一年完成中國統一？",
    options: ["西元前221年", "西元前206年", "西元前202年", "西元前141年"],
    answer: 0
  },
  {
    question: "中國歷史上第一個大一統帝國是？",
    options: ["漢朝", "秦朝", "唐朝", "明朝"],
    answer: 1
  },
  {
    question: "漢武帝時期，主要推行哪一種思想作為治國思想？",
    options: ["道家思想", "法家思想", "儒家思想", "墨家思想"],
    answer: 2
  },
  {
    question: "唐朝的首都是哪一座城市？",
    options: ["洛陽", "長安", "南京", "北京"],
    answer: 1
  },
  {
    question: "隋朝開通的大運河，主要具有什麼功能？",
    options: ["便利南北交通", "防止外族入侵", "推廣佛教", "發展海上貿易"],
    answer: 0
  }
];

// -------------------------
// 顏色設定
// -------------------------
const COLORS = {
  background: "#bde0fe", // 畫布背景色
  questionBox: "#a68a64", // 題目方框背景色
  normal: "#ffffff",      // 一般選項背景色
  correct: "#ffe5ec",     // 答對時使用者選項背景色
  wrong: "#ccd5ae",       // 答錯時使用者選項背景色
  answer: "#ffccd5",      // 答錯時正確答案背景色
  button: "#ffafcc",      // 按鈕背景色
  text: "#263238",        // 文字顏色
  lightText: "#ffffff",   // 題目方框文字顏色
  border: "#78909c"       // 邊框顏色
};

// -------------------------
// 測驗狀態變數
// -------------------------
let currentQuestion = 0; // 目前題目索引
let selectedOption = -1; // 使用者選擇的選項索引
let hasAnswered = false; // 是否已經作答
let score = 0;           // 答對題數
let animationStart = 0;  // 選項動畫開始時間

// -------------------------
// 特效變數
// -------------------------
let fireworks = [];       // 儲存煙火物件
let encouragements = [];  // 儲存加油特效物件
let lastEffectTime = 0;  // 上一次建立特效的時間

// -------------------------
// 儲存響應式版面資料
// -------------------------
let layout = {};

// -------------------------
// 預先載入字型
// -------------------------
function preload() {
  // 使用 Google Fonts 載入中文與英文字型
  // 若字型已由 index.html 載入，p5.js 會直接使用該字型
  textFont(chineseFont);
}

// -------------------------
// 初始化畫布
// -------------------------
function setup() {
  // 建立符合瀏覽器視窗大小的畫布
  createCanvas(windowWidth, windowHeight);

  // 設定矩形以中心點作為定位基準
  rectMode(CENTER);

  // 設定文字預設水平與垂直置中
  textAlign(CENTER, CENTER);

  // 設定文字換行模式
  textWrap(WORD);

  // 計算初始響應式版面
  calculateLayout();

  // 啟用平滑繪圖
  smooth();
}

// -------------------------
// 每一幀重新繪製畫面
// -------------------------
function draw() {
  // 設定畫布背景顏色
  background(COLORS.background);

  // 每一幀重新計算版面，確保畫面能響應式調整
  calculateLayout();

  // 如果所有題目完成，顯示成績畫面
  if (currentQuestion >= questions.length) {
    drawResultScreen();
    drawResultEffect();
    return;
  }

  // 顯示測驗作答畫面
  drawQuizScreen();
}

// -------------------------
// 計算響應式版面
// -------------------------
function calculateLayout() {
  // 取得畫布寬度與高度中較小的數值
  const shortSide = min(width, height);

  // 設定畫布四周邊界
  const margin = constrain(shortSide * 0.055, 16, 65);

  // 限制內容最大寬度，避免寬螢幕內容過寬
  const contentWidth = min(width - margin * 2, 920);

  // 設定題目方框高度
  const questionHeight = constrain(shortSide * 0.22, 110, 190);

  // 設定選項高度
  const optionHeight = constrain(shortSide * 0.105, 48, 78);

  // 設定選項之間的間距
  const optionGap = constrain(shortSide * 0.025, 10, 22);

  // 設定標題與題目區域的位置
  const titleY = max(margin * 0.75, 32);

  const progressY =
    titleY + constrain(shortSide * 0.07, 30, 50);

  const questionBoxY =
    progressY + constrain(shortSide * 0.105, 55, 85);

  const optionsY =
    questionBoxY +
    questionHeight / 2 +
    constrain(shortSide * 0.07, 24, 55);

  // 設定下一題按鈕尺寸與位置
  const buttonHeight = constrain(shortSide * 0.1, 48, 66);
  const buttonWidth = min(contentWidth * 0.55, 280);

  const buttonY =
    optionsY +
    optionHeight * 4 +
    optionGap * 3 +
    constrain(shortSide * 0.1, 48, 85);

  // 儲存所有響應式版面資料
  layout = {
    margin: margin,
    contentWidth: contentWidth,

    questionHeight: questionHeight,
    questionBoxY: questionBoxY,

    optionHeight: optionHeight,
    optionGap: optionGap,
    optionsY: optionsY,

    buttonWidth: buttonWidth,
    buttonHeight: buttonHeight,
    buttonY: buttonY,

    // 設定響應式字體大小
    titleSize: constrain(shortSide * 0.07, 22, 42),
    progressSize: constrain(shortSide * 0.032, 14, 22),
    questionSize: constrain(shortSide * 0.045, 17, 30),
    optionSize: constrain(shortSide * 0.04, 16, 27),
    buttonSize: constrain(shortSide * 0.043, 17, 27)
  };
}

// -------------------------
// 設定中文文字樣式
// -------------------------
function useChineseFont(size, style = NORMAL) {
  // 使用 LXGW WenKai TC 顯示中文
  textFont(chineseFont);

  // 設定文字大小
  textSize(size);

  // 設定文字粗細樣式
  textStyle(style);
}

// -------------------------
// 設定英數文字樣式
// -------------------------
function useEnglishFont(size, style = NORMAL) {
  // 使用 Changa One 顯示英文與數字
  textFont(englishFont);

  // 設定文字大小
  textSize(size);

  // 設定文字樣式
  textStyle(style);
}

// -------------------------
// 繪製測驗畫面
// -------------------------
function drawQuizScreen() {
  // 取得目前題目
  const quiz = questions[currentQuestion];

  // 顯示中文測驗標題
  fill(COLORS.text);
  useChineseFont(layout.titleSize, BOLD);
  text("國中七年級歷史小測驗", width / 2, layout.titleY);

  // 顯示題數進度
  useChineseFont(layout.progressSize, NORMAL);
  text(
    `第 ${currentQuestion + 1} 題／共 ${questions.length} 題`,
    width / 2,
    layout.progressY
  );

  // 顯示題目方框
  drawQuestionBox(quiz.question);

  // 繪製四個選項
  for (let i = 0; i < quiz.options.length; i++) {
    // 計算選項位置
    const optionX = width / 2;

    const optionY =
      layout.optionsY +
      i * (layout.optionHeight + layout.optionGap);

    // 取得選項動畫位置
    const movement = getOptionMovement(i);

    // 取得選項背景顏色
    const optionColor = getOptionColor(i);

    // 繪製選項
    drawOption(
      quiz.options[i],
      optionX + movement.x,
      optionY + movement.y,
      layout.contentWidth,
      layout.optionHeight,
      optionColor,
      layout.optionSize,
      i
    );
  }

  // 作答後顯示下一題按鈕
  if (hasAnswered) {
    drawNextButton();
  }
}

// -------------------------
// 繪製題目方框
// -------------------------
function drawQuestionBox(questionText) {
  // 儲存目前繪圖狀態
  push();

  // 設定題目方框背景色
  fill(COLORS.questionBox);

  // 設定題目方框邊框
  stroke(COLORS.border);
  strokeWeight(2);

  // 繪製題目方框
  rect(
    width / 2,
    layout.questionBoxY,
    layout.contentWidth,
    layout.questionHeight,
    16
  );

  // 設定中文題目字型
  fill(COLORS.lightText);
  useChineseFont(layout.questionSize, BOLD);

  // 顯示題目文字
  text(
    questionText,
    width / 2,
    layout.questionBoxY,
    layout.contentWidth * 0.86,
    layout.questionHeight * 0.78
  );

  // 恢復繪圖狀態
  pop();
}

// -------------------------
// 取得選項背景顏色
// -------------------------
function getOptionColor(optionIndex) {
  // 尚未作答時，所有選項為白色
  if (!hasAnswered) {
    return COLORS.normal;
  }

  // 取得正確答案索引
  const correctAnswer = questions[currentQuestion].answer;

  // 答對時，使用者選項為粉紅色
  if (selectedOption === correctAnswer && optionIndex === selectedOption) {
    return COLORS.correct;
  }

  // 答錯時，使用者選項為灰綠色
  if (selectedOption !== correctAnswer && optionIndex === selectedOption) {
    return COLORS.wrong;
  }

  // 答錯時，正確答案為淺粉紅色
  if (selectedOption !== correctAnswer && optionIndex === correctAnswer) {
    return COLORS.answer;
  }

  // 其他選項維持白色
  return COLORS.normal;
}

// -------------------------
// 取得選項動畫移動量
// -------------------------
function getOptionMovement(optionIndex) {
  // 尚未作答時，選項不移動
  if (!hasAnswered) {
    return { x: 0, y: 0 };
  }

  // 取得正確答案
  const correctAnswer = questions[currentQuestion].answer;

  // 計算動畫經過秒數
  const elapsed = (millis() - animationStart) / 1000;

  // 計算動畫幅度
  const verticalAmount = min(layout.optionHeight * 0.18, 12);
  const horizontalAmount = min(layout.contentWidth * 0.025, 12);

  // 答對時，使用者選項上下跳動
  if (selectedOption === correctAnswer && optionIndex === selectedOption) {
    return {
      x: 0,
      y: sin(elapsed * 8) * verticalAmount
    };
  }

  // 答錯時，使用者選項左右移動
  if (selectedOption !== correctAnswer && optionIndex === selectedOption) {
    return {
      x: sin(elapsed * 18) * horizontalAmount,
      y: 0
    };
  }

  // 答錯時，正確答案上下跳動
  if (selectedOption !== correctAnswer && optionIndex === correctAnswer) {
    return {
      x: 0,
      y: sin(elapsed * 8) * verticalAmount
    };
  }

  // 其他選項不移動
  return { x: 0, y: 0 };
}

// -------------------------
// 繪製單一選項
// -------------------------
function drawOption(
  label,
  x,
  y,
  optionWidth,
  optionHeight,
  optionColor,
  fontSize,
  optionIndex
) {
  // 儲存繪圖狀態
  push();

  // 設定選項背景色
  fill(optionColor);

  // 設定選項邊框
  stroke(COLORS.border);
  strokeWeight(2);

  // 繪製選項方框
  rect(x, y, optionWidth, optionHeight, 14);

  // 建立選項文字
  const optionLabel =
    String.fromCharCode(65 + optionIndex) +
    ". " +
    label;

  // 設定中文與英數混合文字樣式
  fill(COLORS.text);
  noStroke();
  useChineseFont(fontSize, NORMAL);

  // 顯示選項文字
  text(
    optionLabel,
    x,
    y,
    optionWidth * 0.88,
    optionHeight * 0.8
  );

  // 恢復繪圖狀態
  pop();
}

// -------------------------
// 繪製下一題按鈕
// -------------------------
function drawNextButton() {
  // 儲存繪圖狀態
  push();

  // 設定按鈕背景色
  fill(COLORS.button);

  // 設定按鈕邊框
  stroke(COLORS.border);
  strokeWeight(2);

  // 繪製按鈕
  rect(
    width / 2,
    layout.buttonY,
    layout.buttonWidth,
    layout.buttonHeight,
    14
  );

  // 建立按鈕文字
  const buttonText =
    currentQuestion === questions.length - 1
      ? "查看成績"
      : "下一題";

  // 顯示按鈕文字
  fill(COLORS.text);
  noStroke();
  useChineseFont(layout.buttonSize, BOLD);
  text(buttonText, width / 2, layout.buttonY);

  // 恢復繪圖狀態
  pop();
}

// -------------------------
// 繪製最後成績畫面
// -------------------------
function drawResultScreen() {
  // 取得畫布短邊
  const shortSide = min(width, height);

  // 每題 20 分
  const totalScore = score * 20;

  // 顯示測驗完成標題
  fill(COLORS.text);
  useChineseFont(constrain(shortSide * 0.085, 30, 64), BOLD);
  text("測驗完成！", width / 2, height * 0.17);

  // 顯示答對題數
  useChineseFont(constrain(shortSide * 0.055, 22, 44), BOLD);
  text(
    `答對 ${score} 題，共 ${questions.length} 題`,
    width / 2,
    height * 0.29
  );

  // 顯示總成績
  useChineseFont(constrain(shortSide * 0.055, 22, 44), BOLD);
  text(
    `總成績：${totalScore} 分`,
    width / 2,
    height * 0.38
  );

  // 達到 60 分時顯示成功訊息
  if (totalScore >= 60) {
    fill("#8a4f7d");
    useChineseFont(constrain(shortSide * 0.04, 18, 31), BOLD);
    text(
      "太棒了！你已經達到 60 分！",
      width / 2,
      height * 0.47
    );
  } else {
    // 低於 60 分時顯示鼓勵訊息
    fill("#8a4f7d");
    useChineseFont(constrain(shortSide * 0.04, 18, 31), BOLD);
    text(
      "別灰心！繼續努力，下次一定會更好！",
      width / 2,
      height * 0.47
    );
  }

  // 設定重新測驗按鈕大小
  const buttonWidth = min(width * 0.58, 300);
  const buttonHeight = constrain(shortSide * 0.105, 52, 68);
  const buttonY = min(height * 0.76, height - buttonHeight);

  // 繪製重新測驗按鈕
  fill(COLORS.button);
  stroke(COLORS.border);
  strokeWeight(2);
  rect(width / 2, buttonY, buttonWidth, buttonHeight, 14);

  // 顯示重新測驗文字
  fill(COLORS.text);
  noStroke();
  useChineseFont(constrain(shortSide * 0.05, 18, 30), BOLD);
  text("重新測驗", width / 2, buttonY);

  // 儲存重新測驗按鈕資料
  layout.resultButton = {
    x: width / 2,
    y: buttonY,
    width: buttonWidth,
    height: buttonHeight
  };
}

// -------------------------
// 顯示成績頁特效
// -------------------------
function drawResultEffect() {
  // 計算最後分數
  const totalScore = score * 20;

  // 達到 60 分顯示煙火
  if (totalScore >= 60) {
    drawFireworkEffect();
  } else {
    // 低於 60 分顯示加油特效
    drawEncouragementEffect();
  }
}

// =====================================================
// 煙火特效
// =====================================================

// -------------------------
// 繪製煙火
// -------------------------
function drawFireworkEffect() {
  // 每 700 毫秒新增一個煙火
  if (millis() - lastEffectTime > 700) {
    fireworks.push(new Firework());
    lastEffectTime = millis();
  }

  // 更新與繪製所有煙火
  for (let i = fireworks.length - 1; i >= 0; i--) {
    fireworks[i].update();
    fireworks[i].display();

    // 移除已完成的煙火
    if (fireworks[i].isFinished()) {
      fireworks.splice(i, 1);
    }
  }
}

// -------------------------
// 煙火類別
// -------------------------
class Firework {
  constructor() {
    // 設定煙火初始位置
    this.position = createVector(
      random(width * 0.15, width * 0.85),
      height + 10
    );

    // 設定煙火上升速度
    this.velocity = createVector(
      random(-1.5, 1.5),
      random(-10, -7)
    );

    // 設定煙火是否爆炸
    this.exploded = false;

    // 儲存爆炸粒子
    this.particles = [];

    // 設定煙火顏色
    this.color = color(
      random(180, 255),
      random(80, 255),
      random(120, 255)
    );
  }

  update() {
    // 尚未爆炸時，讓煙火持續上升
    if (!this.exploded) {
      this.velocity.y += 0.12;
      this.position.add(this.velocity);

      // 上升到最高點後爆炸
      if (this.velocity.y >= -1) {
        this.explode();
      }
    }

    // 更新所有爆炸粒子
    for (let particle of this.particles) {
      particle.update();
    }

    // 移除已經消失的粒子
    this.particles = this.particles.filter(
      particle => !particle.isFinished()
    );
  }

  explode() {
    // 設定爆炸狀態
    this.exploded = true;

    // 建立爆炸粒子
    const particleCount = floor(random(45, 75));

    for (let i = 0; i < particleCount; i++) {
      this.particles.push(
        new FireworkParticle(
          this.position.copy(),
          this.color
        )
      );
    }
  }

  display() {
    // 繪製尚未爆炸的煙火火箭
    if (!this.exploded) {
      stroke(255);
      strokeWeight(4);
      point(this.position.x, this.position.y);
    }

    // 繪製爆炸粒子
    for (let particle of this.particles) {
      particle.display();
    }
  }

  isFinished() {
    // 爆炸且所有粒子消失後，煙火完成
    return this.exploded && this.particles.length === 0;
  }
}

// -------------------------
// 煙火粒子類別
// -------------------------
class FireworkParticle {
  constructor(position, particleColor) {
    // 設定粒子位置
    this.position = position.copy();

    // 設定粒子隨機方向與速度
    const angle = random(TWO_PI);
    const speed = random(2, 6);

    this.velocity = p5.Vector.fromAngle(angle).mult(speed);

    // 設定重力
    this.acceleration = createVector(0, 0.08);

    // 設定透明度
    this.alpha = 255;

    // 儲存粒子顏色
    this.color = particleColor;
  }

  update() {
    // 加入重力效果
    this.velocity.add(this.acceleration);

    // 更新位置
    this.position.add(this.velocity);

    // 降低透明度
    this.alpha -= 4;
  }

  display() {
    // 繪製半透明粒子
    noStroke();
    fill(
      red(this.color),
      green(this.color),
      blue(this.color),
      this.alpha
    );

    // 根據畫布大小調整粒子尺寸
    ellipse(
      this.position.x,
      this.position.y,
      constrain(min(width, height) * 0.012, 3, 7)
    );
  }

  isFinished() {
    // 透明度低於零時消失
    return this.alpha <= 0;
  }
}

// =====================================================
// 加油特效
// =====================================================

// -------------------------
// 繪製加油特效
// -------------------------
function drawEncouragementEffect() {
  // 每 500 毫秒產生一個鼓勵粒子
  if (millis() - lastEffectTime > 500) {
    encouragements.push(new EncouragementParticle());
    lastEffectTime = millis();
  }

  // 更新與繪製鼓勵粒子
  for (let i = encouragements.length - 1; i >= 0; i--) {
    encouragements[i].update();
    encouragements[i].display();

    // 移除已完成的粒子
    if (encouragements[i].isFinished()) {
      encouragements.splice(i, 1);
    }
  }

  // 建立跳動的加油文字
  push();

  // 使用正弦函數製造呼吸效果
  const pulse = 1 + sin(frameCount * 0.08) * 0.08;

  // 將文字放到成績區域下方
  translate(width / 2, height * 0.62);

  // 套用跳動比例
  scale(pulse);

  // 設定加油文字樣式
  fill("#d95d8a");
  noStroke();
  useChineseFont(constrain(min(width, height) * 0.06, 24, 48), BOLD);

  // 顯示加油文字
  text("加油！你一定可以！", 0, 0);

  // 恢復繪圖狀態
  pop();
}

// -------------------------
// 加油特效粒子類別
// -------------------------
class EncouragementParticle {
  constructor() {
    // 設定粒子初始位置
    this.x = random(width * 0.1, width * 0.9);
    this.y = height + random(10, 80);

    // 設定粒子移動速度
    this.speed = random(0.7, 1.8);

    // 設定粒子大小
    this.size = random(18, 36);

    // 設定粒子透明度
    this.alpha = 255;

    // 設定粒子左右漂浮角度
    this.angle = random(TWO_PI);

    // 隨機選擇鼓勵符號
    this.symbol = random(["★", "♥", "✦", "加油"]);
  }

  update() {
    // 讓粒子向上移動
    this.y -= this.speed;

    // 讓粒子左右漂浮
    this.x += sin(this.angle) * 0.7;

    // 持續變化漂浮角度
    this.angle += 0.04;

    // 粒子靠近上方時逐漸消失
    if (this.y < height * 0.18) {
      this.alpha -= 4;
    }
  }

  display() {
    // 儲存繪圖狀態
    push();

    // 設定粒子位置
    translate(this.x, this.y);

    // 設定粒子文字樣式
    fill(217, 93, 138, this.alpha);
    noStroke();

    // 中文與符號使用中文標楷字型
    useChineseFont(this.size, BOLD);

    // 顯示鼓勵符號
    text(this.symbol, 0, 0);

    // 恢復繪圖狀態
    pop();
  }

  isFinished() {
    // 透明度低於零時，粒子消失
    return this.alpha <= 0;
  }
}

// -------------------------
// 滑鼠點擊事件
// -------------------------
function mousePressed() {
  // 如果測驗已完成，處理重新測驗按鈕
  if (currentQuestion >= questions.length) {
    handleResultClick();
    return;
  }

  // 尚未作答時，處理選項點擊
  if (!hasAnswered) {
    handleOptionClick();
    return;
  }

  // 已作答時，處理下一題按鈕
  handleNextButtonClick();
}

// -------------------------
// 處理選項點擊
// -------------------------
function handleOptionClick() {
  // 取得目前題目
  const quiz = questions[currentQuestion];

  // 逐一檢查四個選項
  for (let i = 0; i < quiz.options.length; i++) {
    // 計算選項中心位置
    const optionX = width / 2;

    const optionY =
      layout.optionsY +
      i * (layout.optionHeight + layout.optionGap);

    // 判斷滑鼠是否位於選項區域
    const clicked =
      mouseX >= optionX - layout.contentWidth / 2 &&
      mouseX <= optionX + layout.contentWidth / 2 &&
      mouseY >= optionY - layout.optionHeight / 2 &&
      mouseY <= optionY + layout.optionHeight / 2;

    // 如果點擊到選項
    if (clicked) {
      // 記錄選擇的選項
      selectedOption = i;

      // 設定為已作答
      hasAnswered = true;

      // 記錄動畫開始時間
      animationStart = millis();

      // 如果答對，增加答對題數
      if (selectedOption === quiz.answer) {
        score++;
      }

      // 完成後離開迴圈
      break;
    }
  }
}

// -------------------------
// 處理下一題按鈕
// -------------------------
function handleNextButtonClick() {
  // 判斷滑鼠是否點擊下一題按鈕
  const clicked =
    mouseX >= width / 2 - layout.buttonWidth / 2 &&
    mouseX <= width / 2 + layout.buttonWidth / 2 &&
    mouseY >= layout.buttonY - layout.buttonHeight / 2 &&
    mouseY <= layout.buttonY + layout.buttonHeight / 2;

  // 如果沒有點擊按鈕，停止執行
  if (!clicked) {
    return;
  }

  // 進入下一題
  currentQuestion++;

  // 清除上一題狀態
  selectedOption = -1;
  hasAnswered = false;
  animationStart = 0;
}

// -------------------------
// 處理重新測驗
// -------------------------
function handleResultClick() {
  // 如果按鈕資料不存在，停止執行
  if (!layout.resultButton) {
    return;
  }

  // 取得按鈕資料
  const button = layout.resultButton;

  // 判斷滑鼠是否點擊按鈕
  const clicked =
    mouseX >= button.x - button.width / 2 &&
    mouseX <= button.x + button.width / 2 &&
    mouseY >= button.y - button.height / 2 &&
    mouseY <= button.y + button.height / 2;

  // 如果沒有點擊按鈕，停止執行
  if (!clicked) {
    return;
  }

  // 回到第一題
  currentQuestion = 0;

  // 分數歸零
  score = 0;

  // 清除選擇與作答狀態
  selectedOption = -1;
  hasAnswered = false;
  animationStart = 0;

  // 清除所有特效
  fireworks = [];
  encouragements = [];

  // 重設特效計時
  lastEffectTime = millis();

  // 清除按鈕資料
  layout.resultButton = null;
}

// -------------------------
// 視窗大小改變事件
// -------------------------
function windowResized() {
  // 重新調整畫布大小
  resizeCanvas(windowWidth, windowHeight);

  // 重新計算響應式版面
  calculateLayout();
}