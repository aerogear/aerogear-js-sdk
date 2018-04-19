/**
 * Represents a Metrics object
 * @private
 * @example
 * var appMetrics = new MetricsImpl("app", { platform: "android" });
 */
export class MetricsImpl {

  public identifier: string;
  public data: any;
  /**
   * Create a Metrics object.
   * @param {string} id - A name identifying the kind of metrics.
   * @param {object} data - An object containing all metrics and its values.
   */
  constructor(id: string, data: any) {
    this.identifier = id;
    this.data = data;
  }

  /**
   * Get all metrics
   * @public
   * @returns {object} An object containing all metrics and its values.
   */
  public collect(): object {
    return this.data;
  }
}
