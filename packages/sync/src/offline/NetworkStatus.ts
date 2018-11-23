/**
 * Responsable to handle Networks status (Online/Offline)
 */
export interface NetworkStatus {
  /**
   * Trigger a function whenever the user switches into "Online Mode"
   *
   * @param fn Function to be called when got online
   */
  whenOnline(fn: any): void;

  /**
   * Trigger a function whenever the user switches into "Offline Mode"
   *
   * @param fn Function to be called when got offline
   */
  whenOffline(fn: any): void;
}
