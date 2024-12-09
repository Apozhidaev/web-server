import { HostConfig } from "../configuration";

export function createSiteMap<T extends HostConfig>(sites: T[]) {
  return sites.reduce((acc, cur) => {
    acc[cur.host] = cur;
    return acc;
  }, {} as Record<string, T>);
}
