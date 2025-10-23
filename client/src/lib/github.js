import api from "./axios";

export async function getGithubInsights(username, refresh = false) {
  const params = refresh ? { refresh: true } : {};
  const { data } = await api.get(`/github/insights/${encodeURIComponent(username)}`, { params });
  return data;
}

export async function getGithubRecommendations(username, refresh = false) {
  const params = refresh ? { refresh: true } : {};
  const { data } = await api.get(`/github/recommendations/${encodeURIComponent(username)}`, { params });
  return data;
}

export async function getAIInsights(username, refresh = false) {
  const params = refresh ? { refresh: true } : {};
  const { data } = await api.get(`/github/ai-insights/${encodeURIComponent(username)}`, { params });
  return data;
}

export async function getRepositoryInsights(owner, repo, refresh = false) {
  const params = refresh ? { refresh: true } : {};
  const { data } = await api.get(
    `/repository/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
    { params }
  );
  return data;
}

export const fetchUser = async (username, refresh = false) => {
  try {
    const params = refresh ? { refresh: true } : {};
    const response = await api.get(`/github/user/${username}`, { params });
    return response.data; // This will return the { data, lastUpdated } object
  } catch (error) {
    console.error(`Failed to fetch user ${username}`, error);
    throw error;
  }
};

export const fetchUserRepos = async (username, refresh = false) => {
  try {
    const params = refresh ? { refresh: true } : {};
    const response = await api.get(`/github/user/${username}/repos`, { params });
    return response.data; // This will return the { data, lastUpdated } object
  } catch (error) {
    console.error(`Failed to fetch repos for ${username}`, error);
    throw error;
  }
};

export const fetchRepoStats = async (owner, repo, refresh = false) => {
  try {
    const params = refresh ? { refresh: true } : {};
    const response = await api.get(`/github/repo/${owner}/${repo}/stats`, { params });
    return response.data; // This will return the { data, lastUpdated } object
  } catch (error) {
    console.error(`Failed to fetch stats for ${owner}/${repo}`, error);
    throw error;
  }
};
