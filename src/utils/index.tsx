import { toast } from "sonner";

export function handleCoreStatus(
  action: string,
  loading: boolean,
  error: any | null,
  t: any,
  prev: any,
  providerName: string
) {
  if (error) console.log(error);
  let formattedErrors = null;
  const commonFields = ["id", "token", "name", "description", "equipmentId"];
  if (error) {
    if (error.response?.data && error.response.data.errors) {
      // handle axios errors
      formattedErrors = error.response.data.errors.map(
        (e: any) =>
          `${t(
            `app.${
              commonFields.includes(e.field) ? "error.field" : providerName
            }.${e.field}`
          )}: ${t(`app.error.${e.code}`)} ${e.value ? `(${e.value})` : ""}`
      );
      toast.error(t(`app.error.title`), {
        description: formattedErrors.join("\n"),
        position: "top-right",
        duration: 5000,
      });
    } else {
      formattedErrors = [`${t(`app.error.common`)}`];
      console.log(error);
      toast.error(t(`app.error.title`), {
        description: JSON.stringify(error),
        position: "top-right",
        duration: 5000,
      });
    }
  }
  return {
    ...prev,
    [action]: {
      loading,
      errors: formattedErrors,
    },
  };
}

export function formatDuration(
  startAt: string | Date,
  finishedAt: string | Date
) {
  const start = new Date(startAt).getTime();
  const end = new Date(finishedAt).getTime();

  let diffInSeconds = Math.floor((end - start) / 1000);

  if (diffInSeconds < 0) return "Intervalo inválido";

  const days = Math.floor(diffInSeconds / (60 * 60 * 24));
  diffInSeconds %= 60 * 60 * 24;

  const hours = Math.floor(diffInSeconds / (60 * 60));
  diffInSeconds %= 60 * 60;

  const minutes = Math.floor(diffInSeconds / 60);
  const seconds = diffInSeconds % 60;

  const parts = [];
  if (days) parts.push(`${days} dia${days > 1 ? "s" : ""}`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (seconds || parts.length === 0) parts.push(`${seconds}s`);

  return parts.join(" ");
}

export function generateURL(data: any, mime: string) {
  const blob = new Blob(data, { type: mime });
  const url = URL.createObjectURL(blob);
  return url;
}
