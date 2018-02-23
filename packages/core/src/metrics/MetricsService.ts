import {AppMetrics} from './impl/AppMetrics';
import {DeviceMetrics} from './impl/DeviceMetrics';
import {Metrics} from './Metrics';
import {MetricsNetworkPublisher, MetricsPublisher} from './MetricsPublisher';

/**
 * AeroGear Services metrics service
 */
export class MetricsService {

    private publisher: MetricsPublisher;

    constructor(url: string) {
        this.publisher = new MetricsNetworkPublisher(url);
    }

    /**
     * Allows to override default metrics publisher
     *
     * @param publisher - implementation of metrics publisher
     */
    public setMetricsPublisher(publisher: MetricsPublisher) {
        this.publisher = publisher;
    }

    /**
     * Collect metrics for all active metrics collectors
     * Send data using metrics publisher
     */
    public sendAppAndDeviceMetrics() {
       this.publish([new AppMetrics(), new DeviceMetrics()]);
    }

    /**
     * Publish metrics using predefined publisher
     *
     * @param - metrics instances that should be published
     */
    public publish(metrics: Metrics[]) {
        const payload: any = {
          'clientId': 'TODO-client',
          'timestamp': new Date().getTime()
        };
        metrics.forEach(value => {
          payload[value.identifier] = value.collect();
        });
        this.publisher.publish(payload);
    }
}
