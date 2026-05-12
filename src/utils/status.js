export const STATUS_DISPLAY_MAP = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

export const STATUS_COLOR_MAP = {
  TODO: "badge-gray",
  IN_PROGRESS: "badge-primary",
  DONE: "badge-success",
};

export function getStatusLabel(status) {
  if (!status) return "";
  return STATUS_DISPLAY_MAP[status] || status;
}

export function getStatusClass(status) {
  if (!status) return "badge";
  return `badge ${STATUS_COLOR_MAP[status] || ""}`;
}