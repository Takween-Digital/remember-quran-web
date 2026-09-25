export function hapticFeedback(pattern: "light" | "medium" | "heavy" | "success" | "error" | "warning" = "light") {
  if (typeof window === "undefined" || !("vibrate" in navigator)) return;

  try {
    switch (pattern) {
      case "light":
        navigator.vibrate(10);
        break;
      case "medium":
        navigator.vibrate(20);
        break;
      case "heavy":
        navigator.vibrate(30);
        break;
      case "success":
        navigator.vibrate([10, 60, 20]);
        break;
      case "error":
        navigator.vibrate([30, 40, 30, 40, 40]);
        break;
      case "warning":
        navigator.vibrate([20, 50, 20]);
        break;
    }
  } catch (e) {
    // Ignore errors for unsuported devices
  }
}
