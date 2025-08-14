export const formatFullDateTime = (date: Date | string): string => {
  return new Date(date).toLocaleString("es-CL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Santiago",
  });
};

export const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString("es-CL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/Santiago",
  });
};

export const formatTime = (date: Date | string): string => {
  return new Date(date).toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Santiago",
  });
};