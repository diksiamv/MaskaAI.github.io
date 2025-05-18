// ===== Тема =====
document.getElementById("theme-toggle").addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");
});

// ===== Анонимизация =====
function anonymizeText(text) {
  const options = Array.from(document.querySelectorAll('#anonymize-options input:checked')).map(i => i.value);

  if (options.includes("iin")) {
    text = text.replace(/\b\d{12}\b/g, '[ИИН]');
  }
  if (options.includes("name")) {
    text = text.replace(/[А-ЯЁ][а-яё]+\s[А-ЯЁ][а-яё]+/g, '[ФИО]');
  }
  if (options.includes("phone")) {
    text = text.replace(/\b(?:\+7|8)?\s*\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}\b/g, '[Телефон]');
  }
  if (options.includes("card")) {
    text = text.replace(/\b(?:\d{4}[\s-]?){3}\d{4}\b/g, '[Номер карты]');
  }
  if (options.includes("cvv")) {
    text = text.replace(/\b\d{3}\b(?=\D|$)/g, '[CVV]');
  }

  return text;
}


// ===== Чат =====
const chatInput = document.getElementById("chat-input");
const chatSend = document.getElementById("chat-send");
const chatMessages = document.getElementById("chat-messages");

chatSend.addEventListener("click", sendMessage);
chatInput.addEventListener("keydown", e => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const message = chatInput.value.trim();
  if (!message) return;

  appendMessage("Вы", message, true);
  appendMessage("Бот", anonymizeText(message));

  chatInput.value = "";
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function appendMessage(sender, text, bold = false) {
  const div = document.createElement("div");
  div.textContent = `${sender}: ${text}`;
  if (bold) div.style.fontWeight = "bold";
  chatMessages.appendChild(div);
}

// ===== Файлы =====
document.getElementById("file-input").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const chatMessages = document.getElementById("chat-messages");

  // Показываем картинку
  const img = document.createElement("img");
  img.style.maxWidth = "100%";
  img.style.marginTop = "10px";

  const reader = new FileReader();
  reader.onload = async function () {
    img.src = reader.result;
    chatMessages.appendChild(img);

    // OCR с поддержкой русского + английского + цифры
    const result = await Tesseract.recognize(reader.result, 'rus+eng', {
      logger: m => console.log(m)
    });

    const rawText = result.data.text.trim();
    const anonymized = anonymizeText(rawText);

    const response = document.createElement("div");
    response.textContent = "🕵️ Анонимизировано из изображения: " + anonymized;
    response.style.marginTop = "10px";
    chatMessages.appendChild(response);

    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  reader.readAsDataURL(file);
});

document.getElementById("file-input").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const chatMessages = document.getElementById("chat-messages");

  const reader = new FileReader();
  reader.onload = async function () {
    const typedarray = new Uint8Array(reader.result);

    try {
      const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
      }

      const anonymized = anonymizeText(fullText);
      const response = document.createElement("div");
      response.textContent = "🕵️ Анонимизировано из PDF: " + anonymized;
      response.style.marginTop = "10px";
      chatMessages.appendChild(response);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (error) {
      console.error("Ошибка при обработке PDF:", error);
      const errorMsg = document.createElement("div");
      errorMsg.textContent = "❌ Не удалось обработать PDF-файл.";
      errorMsg.style.color = "red";
      chatMessages.appendChild(errorMsg);
    }
  };

  reader.readAsArrayBuffer(file);
});

if (file.type.startsWith("image/")) {
  const img = document.createElement("img");
  img.style.maxWidth = "100%";
  img.style.marginTop = "10px";

  const reader = new FileReader();
  reader.onload = async function () {
    img.src = reader.result;
    chatMessages.appendChild(img);

    const result = await Tesseract.recognize(reader.result, 'rus+eng', {
      logger: m => console.log(m)
    });

    const rawText = result.data.text.trim();
    const anonymized = anonymizeText(rawText);

    const response = document.createElement("div");
    response.textContent = "🕵️ Анонимизировано из изображения: " + anonymized;
    response.style.marginTop = "10px";
    chatMessages.appendChild(response);

    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  reader.readAsDataURL(file);
}

