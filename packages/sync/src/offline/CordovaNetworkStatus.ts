import {NetworkStatus} from "./NetworkStatus";

declare var document: any;

export class CordovaNetworkStatus implements NetworkStatus {

  public whenOnline(fn: any): void {
    document.addEventListener("online", fn, false);
  }

  public whenOffline(fn: any): void {
    document.addEventListener("offline", fn, false);
  }
}
