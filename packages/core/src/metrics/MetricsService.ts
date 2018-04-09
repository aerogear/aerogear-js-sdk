import uuid from "uuid/v1";
import { ServiceConfiguration } from "../configuration";
import { Metrics, MetricsPayload } from "./model";
import { MetricsPublisher, NetworkMetricsPublisher } from "./publisher";

/**
 * AeroGear Services metrics service
 */
export abstract class MetricsService {

    private publisher: MetricsPublisher;

    constructor(private readonly configuration: ServiceConfiguration) {
        this.publisher = new NetworkMetricsPublisher(configuration.url);
    }

    set metricsPublisher(publisher: MetricsPublisher) {
        this.publisher = publisher;
    }

    get metricsPublisher(): MetricsPublisher {
        return this.publisher;
    }

    /**
     * Collect metrics for all active metrics collectors
     * Send data using metrics publisher
     */
    public abstract sendAppAndDeviceMetrics(): Promise<any>;

    /**
     * Publish metrics using predefined publisher
     *
     * @param - metrics instances that should be published
     */
    public publish(metrics: Metrics[]): Promise<any> {
        const payload: MetricsPayload = {
            clientId: this.getClientId(),
            timestamp: new Date().getTime(),
            data: {}
        };

        metrics.forEach(m => {
            payload.data[m.identifier] = m.collect();
        });

        return this.publisher.publish(payload);
    }

    /**
     * Generates a new ID for the device or returns an existing one if stored in the device
     */
    public getClientId(): string {
        let clientId = this.getSavedClientId();

        if (!clientId) {
            clientId = uuid();
            this.saveClientId(clientId);
        }

        return clientId;
    }

    /**
     * Returns an existing client id if stored in the device, otherwise returns undefined
     */
    protected abstract getSavedClientId(): string | undefined;

    /**
     * Save in the persistent storage the id for this device
     * @param id the client id to save
     */
    protected abstract saveClientId(id: string): void;
}
