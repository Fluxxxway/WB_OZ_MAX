// Обёртка над MAX Web App Bridge
// Документация: https://dev.max.ru/docs/webapps/bridge

export function getMaxUser() {
  try {
    // Проверка: запущено ли приложение внутри MAX
    if (typeof window === "undefined" || !window.WebApp) {
      return Promise.resolve({
        id: "local-user",
        name: "Тестовый пользователь (локально)",
        platform: "web",
      });
    }

    const initData = window.WebApp.initDataUnsafe;

    if (!initData || !initData.user) {
      return Promise.resolve({
        id: "local-user",
        name: "Тестовый пользователь (нет данных)",
        platform: window.WebApp.platform || "unknown",
      });
    }

    return Promise.resolve({
      id: initData.user.id,
      name: `${initData.user.first_name} ${initData.user.last_name || ""}`.trim(),
      username: initData.user.username,
      photoUrl: initData.user.photo_url,
      platform: window.WebApp.platform || "unknown",
    });
  } catch (error) {
    console.warn("Ошибка получения данных пользователя MAX:", error);
    return Promise.resolve({
      id: "local-user",
      name: "Тестовый пользователь (ошибка)",
      platform: "unknown",
    });
  }
}

export function getPlatform() {
  if (typeof window !== "undefined" && window.WebApp) {
    return window.WebApp.platform || "unknown";
  }
  return "web";
}

// Предотвращение случайного закрытия формы
export function enableClosingConfirmation() {
  if (typeof window !== "undefined" && window.WebApp) {
    window.WebApp.enableClosingConfirmation();
  }
}

export function disableClosingConfirmation() {
  if (typeof window !== "undefined" && window.WebApp) {
    window.WebApp.disableClosingConfirmation();
  }
}

// Скачивание файла (требует HTTPS!)
export function downloadFile(url, filename) {
  if (typeof window !== "undefined" && window.WebApp && window.WebApp.downloadFile) {
    return window.WebApp.downloadFile(url, filename);
  }
  
  // Fallback для браузера
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  return Promise.resolve();
}

// Шеринг контента внутри MAX (требует mid от бота)
export function shareMaxContent(mid, chatType = "DIALOG") {
  if (typeof window !== "undefined" && window.WebApp && window.WebApp.shareMaxContent) {
    return window.WebApp.shareMaxContent({ mid, chatType });
  }
  console.warn("shareMaxContent недоступен вне MAX");
  return Promise.resolve();
}