import axiosInstance from "./axios";

export async function createStatsSnapshot(username) {
  const response = await axiosInstance.post(`/stats/snapshot/${username}`);
  return response.data;
}

export async function getStatsHistory(username, startDate, endDate) {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const response = await axiosInstance.get(`/stats/history/${username}`, { params });
  return response.data;
}

export async function getStatsComparison(username, period = "month") {
  const response = await axiosInstance.get(`/stats/compare/${username}`, {
    params: { period },
  });
  return response.data;
}

export async function getStatsTrends(username, period = "month", metrics) {
  const params = { period };
  if (metrics) params.metrics = metrics.join(",");

  const response = await axiosInstance.get(`/stats/trends/${username}`, { params });
  return response.data;
}

export async function getProgressReport(username, period = "week") {
  const response = await axiosInstance.get(`/stats/report/${username}`, {
    params: { period },
  });
  return response.data;
}
