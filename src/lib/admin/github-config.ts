export type GitHubRepoConfig = {
  owner: string;
  repo: string;
  branch: string;
};

export function getGitHubRepoConfig(): GitHubRepoConfig {
  return {
    owner: import.meta.env.PUBLIC_GITHUB_OWNER ?? '',
    repo: import.meta.env.PUBLIC_GITHUB_REPO ?? '',
    branch: import.meta.env.PUBLIC_GITHUB_BRANCH ?? 'main',
  };
}

export function isGitHubRepoConfigured() {
  const config = getGitHubRepoConfig();
  return Boolean(config.owner && config.repo);
}

export function getGitHubRepoLabel() {
  const config = getGitHubRepoConfig();
  return `${config.owner}/${config.repo}`;
}
