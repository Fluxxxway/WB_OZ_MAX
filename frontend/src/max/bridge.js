// Это временная обёртка.
// Позже нужно заменить методы на реальные методы из документации MAX.

export async function getMaxUser() {
  try {
    // Здесь могут быть разные варианты названий методов.
    // Нужно уточнить в документации или у команды.
    if (window.MAX && window.MAX.bridge && window.MAX.bridge.getUser) {
      return await window.MAX.bridge.getUser();
    }

    if (window.max && window.max.bridge && window.max.bridge.getUser) {
      return await window.max.bridge.getUser();
    }
  } catch (error) {
    console.warn("MAX Bridge getUser недоступен:", error);
  }

  // Заглушка для браузера
  return {
    id: "local-user",
    name: "Тестовый пользователь",
  };
}

export async function takePhotoWithMax() {
  try {
    if (window.MAX && window.MAX.bridge && window.MAX.bridge.openCamera) {
      return await window.MAX.bridge.openCamera();
    }

    if (window.max && window.max.bridge && window.max.bridge.openCamera) {
      return await window.max.bridge.openCamera();
    }
  } catch (error) {
    console.warn("MAX Bridge камера недоступна:", error);
  }

  throw new Error("Камера через MAX пока недоступна");
}