import { ConflictResolutionData } from "./ConflictResolutionData";
import { ConflictResolutionStrategy } from "./ConflictResolutionStrategy";


// Used as default strategy for SDK
export const clientWins: ConflictResolutionStrategy =
  (base: ConflictResolutionData, server: ConflictResolutionData, client: ConflictResolutionData) => {
    const { clientDiff } = calculateDiffs(base, client, server);
    return Object.assign(base, clientDiff);
  };

function calculateDiffs(base: any, client: any, server: any) {
  if (!base) {
    // tslint:disable-next-line: no-console
    console.log("should not happen");
  }
  const clientDiff: any = {};
  for (const key of Object.keys(client)) {
    if (base[key] && base[key] !== client[key]) {
      clientDiff[key] = client[key];
    }
  }
  const serverDiff: any = {};
  for (const key of Object.keys(client)) {
    if (base[key] && base[key] !== server[key]) {
      serverDiff[key] = server[key];
      if (clientDiff[key]) {
        // FIXME just temporary code
        console.log(`found conflict on ${key}`);
      }
    }
  }
  console.log(`Client diff ${clientDiff}. 
                 Server diff ${serverDiff}`);
  return { clientDiff, serverDiff };
}

