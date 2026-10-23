// =====================================================
// p5.js 國中七年級歷史選擇題測驗系統
// 題庫來源：Google Sheets 公開 CSV
// =====================================================

// -------------------------
// Google Sheets 題庫網址
// -------------------------

// Google 試算表發布後的公開 CSV 連結
const GOOGLE_SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSyxp7Do-cLErNm_ubYd4z6-9f0aY5CDr6QKSgBUHhm9ux5fcuB6DTBv_46sRQ6PhOCIWrpYJeCAfkD/pub?gid=283898964&single=true&output=csv";

// -------------------------
// Google Fonts 字型名稱
// -------------------------

// 中文字型
const chineseFont = "LXGW WenKai TC";

// 英文與數字字型
const englishFont = "Changa One";

// -------------------------
// 顏色設定
// -------------------------

const COLORS = {
  background: "#bde0fe", // 畫布背景色
  questionBox: "#a68a64", // 題目方框背景色
  normal: "#ffffff",      // 一般選項背景色
  correct: "#ffe5ec",     // 答對選項背景色
  wrong: "#ccd5ae",       // 答錯選項背景色
  answer: "#ffccd5",      // 正確答案背景色
  button: "#ffafcc",      // 按鈕背景色
  text: "#263238",        // 文字顏色
  lightText: "#ffffff",   // 題目方框文字顏色
  border: "#78909c",      // 邊框顏色
  error: "#b23a48"        // 錯誤文字顏色
};

// -------------------------
// 題庫變數
// -------------------------

// 儲存 Google Sheets 中的完整題庫
let allQuestions = [];

// 儲存本次隨機抽出的五題
let quizQuestions = [];

// 儲存 Google Sheets 表格資料
let questionTable = null;

// -------------------------
// 測驗狀態變數
// -------------------------

// 目前題目索引
let currentQuestion = 0;

// 答對題數
let correctCount = 0;

// 使用者選擇的選項索引
let selectedOption = -1;

// 目前題目是否已作答
let hasAnswered = false;

// 選項動畫開始時間
let animationStart = 0;

// 程式目前狀態
// loading：讀取題庫
// error：讀取失敗
// quiz：作答中
// result：顯示成績
let gameState = "loading";

// 錯誤訊息
let errorMessage = "";

// -------------------------
// 響應式版面資料
// -------------------------

let layout = {};

// -------------------------
// 成績特效變數
// -------------------------

// 儲存煙火物件
let fireworks = [];

// 儲存加油特效物件
let encouragements = [];

// 上一次產生特效的時間
let lastEffectTime = 0;

// =====================================================
// p5.js 初始化
// =====================================================

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);

  // 設定矩形以中心點作為定位基準
  rectMode(CENTER);

  // 設定文字水平與垂直置中
  textAlign(CENTER, CENTER);

  // 設定文字換行模式
  textWrap(WORD);

  // 計算響應式版面
  calculateLayout();

  // 讀取 Google Sheets 題庫
  loadQuestionBank();

  // 啟用平滑繪圖
  smooth();
}

// =====================================================
// 每一幀重新繪製畫面
// =====================================================

function draw() {
  // 填滿畫布背景色
  background(COLORS.background);

  // 持續更新響應式版面
  calculateLayout();

  // 依照目前狀態顯示畫面
  if (gameState === "loading") {
    drawLoadingScreen();
  } else if (gameState === "error") {
    drawErrorScreen();
  } else if (gameState === "quiz") {
    drawQuizScreen();
  } else if (gameState === "result") {
    drawResultScreen();
    drawResultEffect();
  }
}

// =====================================================
// 從 Google Sheets 載入題庫
// =====================================================

function loadQuestionBank() {
  // 將網站狀態設定為載入中
  gameState = "loading";

  // 清除舊題庫
  allQuestions = [];

  // 清除本次測驗題目
  quizQuestions = [];

  // 加入時間參數，避免瀏覽器讀取舊快取
  const latestURL =
    `${GOOGLE_SHEET_CSV_URL}&t=${Date.now()}`;

  // 使用 p5.js loadTable 讀取公開 CSV
  loadTable(
    latestURL,
    "csv",
    "header",

    // CSV 成功載入時執行
    function (table) {
      // 儲存最新的 Google Sheets 資料
      questionTable = table;

      // 將試算表資料解析成題庫
      parseQuestionTable();

      // 確認題庫至少有五題
      if (allQuestions.length < 5) {
        gameState = "error";
        errorMessage = "題庫至少需要五題，請檢查 Google 試算表。";
        return;
      }

      // 題庫載入成功，隨機抽出五題
      startQuiz();
    },

    // CSV 載入失敗時執行
    function (error) {
      // 設定錯誤狀態
      gameState = "error";

      // 設定錯誤訊息
      errorMessage =
        "無法讀取 Google 試算表，請確認試算表已發布成 CSV。";

      // 將詳細錯誤輸出到瀏覽器主控台
      console.error("Google Sheets 載入錯誤：", error);
    }
  );
}

// =====================================================
// 將 Google Sheets 資料解析成題庫
// =====================================================

function parseQuestionTable() {
  // 清空原本的題庫
  allQuestions = [];

  // 逐列讀取 Google Sheets
  for (let i = 0; i < questionTable.getRowCount(); i++) {
    // 取得目前資料列
    const row = questionTable.getRow(i);

    // 取得正確答案文字
    const answerText =
      String(row.get("answer")).trim().toUpperCase();

    // 建立題目物件
    const questionData = {
      // 題目編號
      id: row.get("id"),

      // 題目內容
      question: row.get("question"),

      // 四個選項
      options: [
        row.get("optionA"),
        row.get("optionB"),
        row.get("optionC"),
        row.get("optionD")
      ],

      // 將 A、B、C、D 轉成 0、1、2、3
      answer: convertAnswerToIndex(answerText)
    };

    // 確認題目與四個選項都有內容
    const isValid =
      questionData.question &&
      questionData.options.length === 4 &&
      questionData.options.every(option => option);

    // 只加入有效題目
    if (isValid) {
      allQuestions.push(questionData);
    }
  }
}

// =====================================================
// 將答案字母轉換成選項索引
// =====================================================

function convertAnswerToIndex(answerText) {
  // A 代表第一個選項
  if (answerText === "A") {
    return 0;
  }

  // B 代表第二個選項
  if (answerText === "B") {
    return 1;
  }

  // C 代表第三個選項
  if (answerText === "C") {
    return 2;
  }

  // D 代表第四個選項
  if (answerText === "D") {
    return 3;
  }

  // 如果答案格式錯誤，預設第一個選項
  return 0;
}

// =====================================================
// 從完整題庫隨機抽出五題
// =====================================================

function startQuiz() {
  // 複製完整題庫，避免修改原始陣列
  const questionPool = [...allQuestions];

  // 清除本次測驗題目
  quizQuestions = [];

  // 隨機抽出五題
  for (let i = 0; i < 5; i++) {
    // 產生隨機索引
    const randomIndex = floor(random(questionPool.length));

    // 將題目放入本次測驗
    quizQuestions.push(questionPool[randomIndex]);

    // 移除已抽出的題目，避免重複抽題
    questionPool.splice(randomIndex, 1);
  }

  // 重設測驗進度
  currentQuestion = 0;

  // 重設答對題數
  correctCount = 0;

  // 清除使用者選項
  selectedOption = -1;

  // 設定為尚未作答
  hasAnswered = false;

  // 重設動畫時間
  animationStart = 0;

  // 清除舊特效
  fireworks = [];
  encouragements = [];

  // 重設特效時間
  lastEffectTime = millis();

  // 進入測驗狀態
  gameState = "quiz";
}

// =====================================================
// 計算響應式版面
// =====================================================

function calculateLayout() {
  // 取得畫布寬度與高度中較小的數值
  const shortSide = min(width, height);

  // 設定畫布邊界
  const margin = constrain(shortSide * 0.055, 16, 65);

  // 設定內容最大寬度
  const contentWidth = min(width - margin * 2, 920);

  // 設定題目方框高度
  const questionHeight = constrain(shortSide * 0.22, 110, 190);

  // 設定選項高度
  const optionHeight = constrain(shortSide * 0.105, 48, 78);

  // 設定選項之間的距離
  const optionGap = constrain(shortSide * 0.025, 10, 22);

  // 設定標題位置
  const titleY = max(margin * 0.75, 32);

  // 設定題數進度位置
  const progressY =
    titleY + constrain(shortSide * 0.07, 30, 50);

  // 設定題目方框位置
  const questionBoxY =
    progressY + constrain(shortSide * 0.105, 55, 85);

  // 設定選項起始位置
  const optionsY =
    questionBoxY +
    questionHeight / 2 +
    constrain(shortSide * 0.07, 24, 55);

  // 設定下一題按鈕尺寸
  const buttonHeight = constrain(shortSide * 0.1, 48, 66);
  const buttonWidth = min(contentWidth * 0.55, 280);

  // 設定下一題按鈕位置
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

// =====================================================
// 設定中文字型
// =====================================================

function useChineseFont(size, style = NORMAL) {
  // 使用 index.html 載入的中文 Google Font
  textFont(chineseFont);

  // 設定文字大小
  textSize(size);

  // 設定文字樣式
  textStyle(style);
}

// =====================================================
// 繪製載入畫面
// =====================================================

function drawLoadingScreen() {
  // 設定文字顏色
  fill(COLORS.text);

  // 設定中文字型
  useChineseFont(26, BOLD);

  // 顯示載入訊息
  text("正在讀取最新題庫……", width / 2, height / 2);
}

// =====================================================
// 繪製錯誤畫面
// =====================================================

function drawErrorScreen() {
  // 設定錯誤文字顏色
  fill(COLORS.error);

  // 設定中文字型
  useChineseFont(22, BOLD);

  // 顯示錯誤訊息
  text(
    errorMessage,
    width / 2,
    height / 2 - 30,
    width * 0.8,
    height * 0.25
  );

  // 顯示重新載入提示
  useChineseFont(18, NORMAL);
  text(
    "點擊畫面重新載入題庫",
    width / 2,
    height / 2 + 50
  );
}

// =====================================================
// 繪製測驗畫面
// =====================================================

function drawQuizScreen() {
  // 取得目前題目
  const quiz = quizQuestions[currentQuestion];

  // 顯示測驗標題
  fill(COLORS.text);
  useChineseFont(layout.titleSize, BOLD);
  text("國中七年級歷史小測驗", width / 2, layout.titleY);

  // 顯示題數
  useChineseFont(layout.progressSize, NORMAL);
  text(
    `第 ${currentQuestion + 1} 題／共 ${quizQuestions.length} 題`,
    width / 2,
    layout.progressY
  );

  // 繪製題目方框
  drawQuestionBox(quiz.question);

  // 逐一繪製四個選項
  for (let i = 0; i < quiz.options.length; i++) {
    // 計算選項位置
    const optionX = width / 2;

    const optionY =
      layout.optionsY +
      i * (layout.optionHeight + layout.optionGap);

    // 取得動畫位移
    const movement = getOptionMovement(i);

    // 取得選項顏色
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

// =====================================================
// 繪製題目方框
// =====================================================

function drawQuestionBox(questionText) {
  // 儲存繪圖狀態
  push();

  // 設定題目方框顏色
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

  // 設定題目文字顏色
  fill(COLORS.lightText);

  // 設定中文字型與大小
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

// =====================================================
// 取得選項背景顏色
// =====================================================

function getOptionColor(optionIndex) {
  // 尚未作答時，所有選項都是白色
  if (!hasAnswered) {
    return COLORS.normal;
  }

  // 取得正確答案
  const correctAnswer = quizQuestions[currentQuestion].answer;

  // 答對時，使用者選項變成粉紅色
  if (selectedOption === correctAnswer && optionIndex === selectedOption) {
    return COLORS.correct;
  }

  // 答錯時，使用者選項變成灰綠色
  if (selectedOption !== correctAnswer && optionIndex === selectedOption) {
    return COLORS.wrong;
  }

  // 答錯時，正確答案變成淺粉紅色
  if (selectedOption !== correctAnswer && optionIndex === correctAnswer) {
    return COLORS.answer;
  }

  // 其他選項維持白色
  return COLORS.normal;
}

// =====================================================
// 取得選項動畫位移
// =====================================================

function getOptionMovement(optionIndex) {
  // 尚未作答時不移動
  if (!hasAnswered) {
    return { x: 0, y: 0 };
  }

  // 取得正確答案
  const correctAnswer = quizQuestions[currentQuestion].answer;

  // 計算動畫經過秒數
  const elapsed = (millis() - animationStart) / 1000;

  // 設定上下跳動幅度
  const verticalAmount = min(layout.optionHeight * 0.18, 12);

  // 設定左右移動幅度
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

// =====================================================
// 繪製單一選項
// =====================================================

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
  // 儲存目前繪圖狀態
  push();

  // 設定選項背景色
  fill(optionColor);

  // 設定選項邊框
  stroke(COLORS.border);
  strokeWeight(2);

  // 繪製選項方框
  rect(x, y, optionWidth, optionHeight, 14);

  // 建立 A、B、C、D 標示
  const optionLabel =
    String.fromCharCode(65 + optionIndex) +
    ". " +
    label;

  // 設定選項文字
  fill(COLORS.text);
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

// =====================================================
// 繪製下一題按鈕
// =====================================================

function drawNextButton() {
  // 儲存繪圖狀態
  push();

  // 設定按鈕外觀
  fill(COLORS.button);
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

  // 最後一題顯示查看成績
  const buttonText =
    currentQuestion === quizQuestions.length - 1
      ? "查看成績"
      : "下一題";

  // 顯示按鈕文字
  fill(COLORS.text);
  useChineseFont(layout.buttonSize, BOLD);
  text(buttonText, width / 2, layout.buttonY);

  // 恢復繪圖狀態
  pop();
}

// =====================================================
// 繪製最後成績畫面
// =====================================================

function drawResultScreen() {
  // 取得畫布短邊
  const shortSide = min(width, height);

  // 每題 20 分
  const totalScore = correctCount * 20;

  // 顯示完成標題
  fill(COLORS.text);
  useChineseFont(constrain(shortSide * 0.085, 30, 64), BOLD);
  text("測驗完成！", width / 2, height * 0.17);

  // 顯示答對題數
  useChineseFont(constrain(shortSide * 0.055, 22, 44), BOLD);
  text(
    `答對 ${correctCount} 題，共 ${quizQuestions.length} 題`,
    width / 2,
    height * 0.29
  );

  // 顯示總成績
  text(
    `總成績：${totalScore} 分`,
    width / 2,
    height * 0.38
  );

  // 60 分以上顯示成功訊息
  if (totalScore >= 60) {
    fill("#8a4f7d");
    useChineseFont(constrain(shortSide * 0.04, 18, 31), BOLD);
    text(
      "太棒了！你已經達到 60 分！",
      width / 2,
      height * 0.47
    );
  } else {
    // 低於 60 分顯示鼓勵訊息
    fill("#8a4f7d");
    useChineseFont(constrain(shortSide * 0.04, 18, 31), BOLD);
    text(
      "別灰心！繼續努力，下次一定會更好！",
      width / 2,
      height * 0.47
    );
  }

  // 設定重新測驗按鈕
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
  useChineseFont(constrain(shortSide * 0.05, 18, 30), BOLD);
  text("重新測驗", width / 2, buttonY);

  // 儲存按鈕資料
  layout.resultButton = {
    x: width / 2,
    y: buttonY,
    width: buttonWidth,
    height: buttonHeight
  };
}

// =====================================================
// 成績頁特效
// =====================================================

function drawResultEffect() {
  // 計算最後總分
  const totalScore = correctCount * 20;

  // 60 分以上顯示煙火
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

function drawFireworkEffect() {
  // 每隔一段時間建立煙火
  if (millis() - lastEffectTime > 700) {
    fireworks.push(new Firework());
    lastEffectTime = millis();
  }

  // 更新並繪製所有煙火
  for (let i = fireworks.length - 1; i >= 0; i--) {
    fireworks[i].update();
    fireworks[i].display();

    // 移除完成的煙火
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

    // 設定煙火速度
    this.velocity = createVector(
      random(-1.5, 1.5),
      random(-10, -7)
    );

    // 設定是否已爆炸
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
    // 尚未爆炸時持續上升
    if (!this.exploded) {
      this.velocity.y += 0.12;
      this.position.add(this.velocity);

      // 到達最高點後爆炸
      if (this.velocity.y >= -1) {
        this.explode();
      }
    }

    // 更新爆炸粒子
    for (let particle of this.particles) {
      particle.update();
    }

    // 移除消失的粒子
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
    // 繪製上升中的煙火
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
    // 爆炸且所有粒子消失後視為完成
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

    // 設定隨機方向與速度
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
    // 加入重力
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

    // 依畫布大小調整粒子大小
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

function drawEncouragementEffect() {
  // 定期建立新的鼓勵粒子
  if (millis() - lastEffectTime > 500) {
    encouragements.push(new EncouragementParticle());
    lastEffectTime = millis();
  }

  // 更新並繪製鼓勵粒子
  for (let i = encouragements.length - 1; i >= 0; i--) {
    encouragements[i].update();
    encouragements[i].display();

    // 移除完成的粒子
    if (encouragements[i].isFinished()) {
      encouragements.splice(i, 1);
    }
  }

  // 繪製跳動的加油文字
  push();

  // 建立呼吸動畫
  const pulse = 1 + sin(frameCount * 0.08) * 0.08;

  // 設定文字位置
  translate(width / 2, height * 0.62);

  // 套用動畫比例
  scale(pulse);

  // 設定加油文字樣式
  fill("#d95d8a");
  useChineseFont(constrain(min(width, height) * 0.06, 24, 48), BOLD);

  // 顯示加油文字
  text("加油！你一定可以！", 0, 0);

  // 恢復繪圖狀態
  pop();
}

// -------------------------
// 加油粒子類別
// -------------------------

class EncouragementParticle {
  constructor() {
    // 設定粒子起始位置
    this.x = random(width * 0.1, width * 0.9);
    this.y = height + random(10, 80);

    // 設定上升速度
    this.speed = random(0.7, 1.8);

    // 設定粒子大小
    this.size = random(18, 36);

    // 設定透明度
    this.alpha = 255;

    // 設定漂浮角度
    this.angle = random(TWO_PI);

    // 隨機選擇鼓勵符號
    this.symbol = random(["★", "♥", "✦", "加油"]);
  }

  update() {
    // 粒子向上移動
    this.y -= this.speed;

    // 粒子左右漂浮
    this.x += sin(this.angle) * 0.7;

    // 改變漂浮角度
    this.angle += 0.04;

    // 接近畫面上方時逐漸消失
    if (this.y < height * 0.18) {
      this.alpha -= 4;
    }
  }

  display() {
    // 儲存繪圖狀態
    push();

    // 移動到粒子位置
    translate(this.x, this.y);

    // 設定粒子文字
    fill(217, 93, 138, this.alpha);
    useChineseFont(this.size, BOLD);

    // 顯示鼓勵符號
    text(this.symbol, 0, 0);

    // 恢復繪圖狀態
    pop();
  }

  isFinished() {
    // 透明度低於零時消失
    return this.alpha <= 0;
  }
}

// =====================================================
// 滑鼠點擊事件
// =====================================================

function mousePressed() {
  // 載入錯誤時，點擊畫面重新載入
  if (gameState === "error") {
    loadQuestionBank();
    return;
  }

  // 測驗狀態下，處理選項點擊
  if (gameState === "quiz") {
    handleOptionClick();
    return;
  }

  // 成績狀態下，處理重新測驗
  if (gameState === "result") {
    handleResultClick();
  }
}

// =====================================================
// 處理選項點擊
// =====================================================

function handleOptionClick() {
  // 如果已作答，不允許再次選擇
  if (hasAnswered) {
    handleNextButtonClick();
    return;
  }

  // 取得目前題目
  const quiz = quizQuestions[currentQuestion];

  // 檢查四個選項
  for (let i = 0; i < quiz.options.length; i++) {
    // 計算選項位置
    const optionX = width / 2;

    const optionY =
      layout.optionsY +
      i * (layout.optionHeight + layout.optionGap);

    // 判斷滑鼠是否點擊選項
    const clicked =
      mouseX >= optionX - layout.contentWidth / 2 &&
      mouseX <= optionX + layout.contentWidth / 2 &&
      mouseY >= optionY - layout.optionHeight / 2 &&
      mouseY <= optionY + layout.optionHeight / 2;

    // 點擊到選項時處理答案
    if (clicked) {
      // 記錄使用者選項
      selectedOption = i;

      // 設定為已作答
      hasAnswered = true;

      // 記錄動畫開始時間
      animationStart = millis();

      // 答對時增加一題
      if (selectedOption === quiz.answer) {
        correctCount++;
      }

      // 停止檢查其他選項
      break;
    }
  }
}

// =====================================================
// 處理下一題按鈕
// =====================================================

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

  // 如果五題已完成，進入成績畫面
  if (currentQuestion >= quizQuestions.length) {
    lastEffectTime = millis();
    gameState = "result";
  }
}

// =====================================================
// 處理重新測驗按鈕
// =====================================================

function handleResultClick() {
  // 如果按鈕資料不存在，停止執行
  if (!layout.resultButton) {
    return;
  }

  // 取得按鈕資料
  const button = layout.resultButton;

  // 判斷滑鼠是否點擊重新測驗按鈕
  const clicked =
    mouseX >= button.x - button.width / 2 &&
    mouseX <= button.x + button.width / 2 &&
    mouseY >= button.y - button.height / 2 &&
    mouseY <= button.y + button.height / 2;

  // 如果沒有點擊按鈕，停止執行
  if (!clicked) {
    return;
  }

  // 重新讀取 Google Sheets 最新題庫
  loadQuestionBank();
}

// =====================================================
// 視窗大小改變事件
// =====================================================

function windowResized() {
  // 重新調整畫布大小
  resizeCanvas(windowWidth, windowHeight);

  // 重新計算響應式版面
  calculateLayout();
}