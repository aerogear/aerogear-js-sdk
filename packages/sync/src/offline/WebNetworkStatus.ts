import {NetworkStatus} from "./NetworkStatus";

declare var window: any;

export class WebNetworkStatus implements NetworkStatus {
  public whenOnline(fn: any): void {
    window.addEventListener("online", fn, false);
  }

  public whenOffline(fn: any): void {
    window.addEventListener("offline", fn, false);
  }
}
