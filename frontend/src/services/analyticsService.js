import { getPredictionHistory } from "./predictionService";
import { getOpenAlerts } from "./alertService";
import { getUsers } from "./userService";

export async function getAnalyticsData() {
  const [predictions, alerts, users] = await Promise.all([
    getPredictionHistory({
      page: 0,
      size: 1000,
      sort: "predictionId,desc",
    }),

    getOpenAlerts(),

    getUsers({
      page: 0,
      size: 1000,
    }),
  ]);

  return {
    predictions,
    alerts,
    users,
  };
}
