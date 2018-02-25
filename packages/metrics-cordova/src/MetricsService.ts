import {MetricsService} from '@aerogearservices/metrics';
import {AppMetrics} from './AppMetrics';

/**
 * AeroGear Services metrics service
 */
export class CordovaMetricsService extends MetricsService {

    /**
     * Collect metrics for all active metrics collectors
     * Send data using metrics publisher
     */
    public sendAppAndDeviceMetrics() {
       this.publish([new AppMetrics()]);
    }
}
