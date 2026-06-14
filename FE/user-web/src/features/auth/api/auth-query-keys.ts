export const authQueryKeys = {
  all: ["auth"] as const,
  me: () => [...authQueryKeys.all, "me"] as const,
  profile: () => [...authQueryKeys.all, "profile"] as const,
  devices: () => [...authQueryKeys.all, "devices"] as const,
};
