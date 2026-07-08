const fileInput = document.getElementById("fileInput");
const fileInfo = document.getElementById("fileInfo");
const documentText = document.getElementById("documentText");
const resultText = document.getElementById("resultText");
const historyList = document.getElementById("historyList");

fileInput.addEventListener("change", function () {
  const file = fileInput.files[0];

  if (!file) {
    fileInfo.textContent = "Файл не выбран";
    return;
  }

  fileInfo.textContent = `Выбран файл: ${file.name}`;

  if (file.name.endsWith(".txt")) {
    const reader = new FileReader();

    reader.onload = function (event) {
      documentText.value = event.target.result;
    };

    reader.readAsText(file);
  } else {
    alert("В этой версии MVP автоматически читаются только TXT-файлы. PDF и DOCX можно добавить через backend.");
  }
});

function getText() {
  const text = documentText.value.trim();

  if (!text) {
    alert("Сначала загрузите или вставьте текст документа.");
    return null;
  }

  return text;
}

function generateSummary() {
  const text = getText();
  if (!text) return;

  const sentences = text
    .split(/[.!?]/)
    .map(s => s.trim())
    .filter(s => s.length > 40);

  const summary = sentences.slice(0, 5).join(". ") + ".";

  resultText.value =
`КРАТКОЕ РЕЗЮМЕ ДОКУМЕНТА

${summary}

ОБЩИЙ ВЫВОД:
Документ содержит информацию, которую необходимо изучить ответственным сотрудникам для определения требований, сроков и возможных обязательств компании.`;
}

function findDeadlines() {
  const text = getText();
  if (!text) return;

  const lines = text.split(/\n|\./).filter(line =>
    /срок|дней|день|месяц|год|до |не позднее|в течение|дата/i.test(line)
  );

  resultText.value =
`НАЙДЕННЫЕ СРОКИ И ДАТЫ

${lines.length ? lines.map((line, i) => `${i + 1}. ${line.trim()}`).join("\n") : "Сроки и даты не найдены."}`;
}

function findRisks() {
  const text = getText();
  if (!text) return;

  const lines = text.split(/\n|\./).filter(line =>
    /ответственность|штраф|нарушение|обязан|требуется|запрещается|риск|контроль|санкция/i.test(line)
  );

  resultText.value =
`ВОЗМОЖНЫЕ РИСКИ И ОБЯЗАТЕЛЬСТВА

${lines.length ? lines.map((line, i) => `${i + 1}. ${line.trim()}`).join("\n") : "Риски и обязательства не найдены."}

РЕКОМЕНДАЦИЯ:
Проверить найденные пункты и определить ответственных исполнителей.`;
}

function generateManagerReport() {
  const text = getText();
  if (!text) return;

  const shortText = text.substring(0, 900);

  resultText.value =
`АНАЛИТИЧЕСКАЯ СПРАВКА ДЛЯ РУКОВОДИТЕЛЯ

1. Краткое содержание:
${shortText}...

2. Что необходимо проверить:
- наличие сроков исполнения;
- обязательства компании;
- требования государственных органов;
- возможные риски;
- необходимость подготовки ответа или внутреннего поручения.

3. Рекомендуемые действия:
- назначить ответственного исполнителя;
- определить срок подготовки ответа;
- проверить наличие приложений и связанных документов;
- подготовить официальную позицию компании.

4. Вывод:
Документ требует анализа ответственным подразделением и может быть использован для подготовки управленческого решения.`;
}

function answerQuestion() {
  const text = getText();
  if (!text) return;

  const question = document.getElementById("questionInput").value.trim();

  if (!question) {
    alert("Введите вопрос.");
    return;
  }

  const keywords = question
    .toLowerCase()
    .split(" ")
    .filter(word => word.length > 3);

  const fragments = text.split(/\n|\./).filter(line =>
    keywords.some(keyword => line.toLowerCase().includes(keyword))
  );

  resultText.value =
`ВОПРОС:
${question}

НАЙДЕННЫЕ ФРАГМЕНТЫ:

${fragments.length ? fragments.map((line, i) => `${i + 1}. ${line.trim()}`).join("\n") : "По вопросу не найдено точных совпадений."}

ПРИМЕЧАНИЕ:
В MVP используется поиск по ключевым словам. В следующей версии можно подключить OpenAI API для полноценного AI-ответа по документу.`;
}

function downloadResult() {
  const text = resultText.value.trim();

  if (!text) {
    alert("Сначала сформируйте результат анализа.");
    return;
  }

  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "analysis-result.txt";
  link.click();

  URL.revokeObjectURL(url);
}

function saveOriginalText() {
  const text = getText();
  if (!text) return;

  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "original-document-text.txt";
  link.click();

  URL.revokeObjectURL(url);
}

function saveResult() {
  const text = resultText.value.trim();

  if (!text) {
    alert("Нет результата для сохранения.");
    return;
  }

  const history = JSON.parse(localStorage.getItem("analysisHistory")) || [];

  history.unshift({
    date: new Date().toLocaleString("ru-RU"),
    result: text
  });

  localStorage.setItem("analysisHistory", JSON.stringify(history.slice(0, 10)));
  renderHistory();
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem("analysisHistory")) || [];

  historyList.innerHTML = "";

  history.forEach((item, index) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${item.date}</strong><br>${item.result.substring(0, 180)}...`;
    li.onclick = () => {
      resultText.value = item.result;
    };
    historyList.appendChild(li);
  });
}

function clearHistory() {
  localStorage.removeItem("analysisHistory");
  renderHistory();
}

function clearText() {
  documentText.value = "";
  resultText.value = "";
  fileInput.value = "";
  fileInfo.textContent = "Файл не выбран";
}

renderHistory();
