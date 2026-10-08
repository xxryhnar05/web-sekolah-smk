export function normalizeMissionContent(value: unknown): string {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .join("\n\n");
  }

  if (typeof value !== "string") {
    return "";
  }

  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return normalizeMissionContent(parsed);
    }
    if (typeof parsed === "string") {
      return parsed;
    }
  } catch {
    return value;
  }

  return value;
}
