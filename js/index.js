/**
 * W3 Calculator – index.js
 * ฟังก์ชันทั้งหมดของเครื่องคิดเลข
 */

// ─── State ───────────────────────────────────────────────────────
let currentValue = '0';   // ค่าที่แสดงบนจอ
let previousValue = null; // ค่าก่อนหน้า (ตัวตั้ง)
let operator = null;      // ตัวดำเนินการที่เลือก
let resetNext = false;    // ถ้า true → กดตัวเลขถัดไปจะเริ่มใหม่
let memory = 0;           // หน่วยความจำ

// ─── DOM ─────────────────────────────────────────────────────────
const display = document.getElementById('display');

// ─── Helpers ─────────────────────────────────────────────────────

/** อัปเดตหน้าจอ */
function updateDisplay() {
  // จำกัดความยาวตัวเลขไม่ให้ล้นจอ
  let text = currentValue;
  if (text.length > 16) {
    const num = parseFloat(text);
    text = Number.isFinite(num) ? num.toPrecision(12) : text.slice(0, 16);
  }
  display.textContent = text;
}

/** แปลง currentValue เป็นตัวเลข */
function toNumber(str) {
  return parseFloat(str);
}

/** คำนวณผลลัพธ์จาก previousValue, operator, currentValue */
function calculate(a, op, b) {
  switch (op) {
    case 'add':      return a + b;
    case 'subtract': return a - b;
    case 'multiply': return a * b;
    case 'divide':
      if (b === 0) return 'Error';
      return a / b;
    default:         return b;
  }
}

/** จัดรูปแบบผลลัพธ์ให้เป็น string ที่สะอาด */
function formatResult(value) {
  if (typeof value === 'string') return value;        // "Error"
  if (!Number.isFinite(value))   return 'Error';
  // ตัดทศนิยมที่ยาวเกินไป
  const str = parseFloat(value.toPrecision(12)).toString();
  return str;
}

// ─── Actions ─────────────────────────────────────────────────────

/** กดปุ่มตัวเลข 0-9 */
function inputDigit(digit) {
  if (resetNext) {
    currentValue = digit;
    resetNext = false;
  } else {
    currentValue = currentValue === '0' ? digit : currentValue + digit;
  }
  updateDisplay();
}

/** กดปุ่มจุดทศนิยม */
function inputDecimal() {
  if (resetNext) {
    currentValue = '0.';
    resetNext = false;
    updateDisplay();
    return;
  }
  if (!currentValue.includes('.')) {
    currentValue += '.';
  }
  updateDisplay();
}

/** กดปุ่ม +/- เปลี่ยนเครื่องหมาย */
function toggleSign() {
  if (currentValue === '0' || currentValue === 'Error') return;
  if (currentValue.startsWith('-')) {
    currentValue = currentValue.slice(1);
  } else {
    currentValue = '-' + currentValue;
  }
  updateDisplay();
}

/** กดปุ่ม CE – ล้างค่าปัจจุบัน */
function clearEntry() {
  currentValue = '0';
  previousValue = null;
  operator = null;
  resetNext = false;
  updateDisplay();
}

/** กดปุ่มตัวดำเนินการ (+, -, ×, ÷) */
function handleOperator(nextOp) {
  const value = toNumber(currentValue);

  // ถ้ามีค่าก่อนหน้าอยู่ → คำนวณก่อน (chain calculation)
  if (previousValue !== null && !resetNext) {
    const result = calculate(previousValue, operator, value);
    currentValue = formatResult(result);
    previousValue = currentValue === 'Error' ? null : toNumber(currentValue);
    updateDisplay();
  } else {
    previousValue = value;
  }

  operator = nextOp;
  resetNext = true;
}

/** กดปุ่ม = */
function handleEquals() {
  if (operator === null || previousValue === null) return;

  const value = toNumber(currentValue);
  const result = calculate(previousValue, operator, value);
  currentValue = formatResult(result);
  previousValue = null;
  operator = null;
  resetNext = true;
  updateDisplay();
}

/** กดปุ่ม √ (square root) */
function handleSquareRoot() {
  const value = toNumber(currentValue);
  if (value < 0) {
    currentValue = 'Error';
  } else {
    currentValue = formatResult(Math.sqrt(value));
  }
  resetNext = true;
  updateDisplay();
}

/** กดปุ่ม % */
function handlePercent() {
  const value = toNumber(currentValue);
  if (previousValue !== null) {
    // เช่น 200 + 10% → 200 + (200 * 0.10)
    currentValue = formatResult(previousValue * (value / 100));
  } else {
    currentValue = formatResult(value / 100);
  }
  resetNext = true;
  updateDisplay();
}

/** กดปุ่ม 1/x (reciprocal) */
function handleReciprocal() {
  const value = toNumber(currentValue);
  if (value === 0) {
    currentValue = 'Error';
  } else {
    currentValue = formatResult(1 / value);
  }
  resetNext = true;
  updateDisplay();
}

// ─── Memory ──────────────────────────────────────────────────────

function memoryClear()    { memory = 0; }
function memoryRecall()   { currentValue = formatResult(memory); resetNext = true; updateDisplay(); }
function memoryAdd()      { memory += toNumber(currentValue); }
function memorySubtract() { memory -= toNumber(currentValue); }

// ─── Event Delegation (ปุ่มบนหน้าจอ) ────────────────────────────

document.addEventListener('click', (e) => {
  const btn = e.target.closest('button.key');
  if (!btn) return;

  // ปุ่มตัวเลข
  if (btn.dataset.value !== undefined) {
    inputDigit(btn.dataset.value);
    return;
  }

  // ปุ่มที่มี data-action
  const action = btn.dataset.action;
  if (!action) return;

  switch (action) {
    // Operators
    case 'add':
    case 'subtract':
    case 'multiply':
    case 'divide':
      handleOperator(action);
      break;

    // Special
    case 'equals':       handleEquals();      break;
    case 'decimal':      inputDecimal();      break;
    case 'toggle-sign':  toggleSign();        break;
    case 'clear':        clearEntry();        break;
    case 'square-root':  handleSquareRoot();  break;
    case 'percent':      handlePercent();     break;
    case 'reciprocal':   handleReciprocal();  break;

    // Memory
    case 'memory-clear':    memoryClear();    break;
    case 'memory-recall':   memoryRecall();   break;
    case 'memory-add':      memoryAdd();      break;
    case 'memory-subtract': memorySubtract(); break;
  }
});

// ─── Keyboard Support ────────────────────────────────────────────

document.addEventListener('keydown', (e) => {
  const key = e.key;

  // ตัวเลข 0-9
  if (/^[0-9]$/.test(key)) {
    inputDigit(key);
    return;
  }

  switch (key) {
    case '.':       inputDecimal();              break;
    case '+':       handleOperator('add');        break;
    case '-':       handleOperator('subtract');   break;
    case '*':       handleOperator('multiply');   break;
    case '/':
      e.preventDefault(); // ป้องกัน quick-find ในบางเบราว์เซอร์
      handleOperator('divide');
      break;
    case 'Enter':
    case '=':       handleEquals();               break;
    case 'Escape':  clearEntry();                 break;
    case 'Backspace':
      // ลบตัวเลขทีละหลัก
      if (currentValue.length > 1) {
        currentValue = currentValue.slice(0, -1);
      } else {
        currentValue = '0';
      }
      updateDisplay();
      break;
    case '%':       handlePercent();              break;
  }
});
