export interface Shipment {
  id: string;
  status: 'IN_TRANSIT' | 'STORED' | 'DELIVERED';
  destination: string;
}

export class FlowTracker {
  static updateStatus(shipmentId: string, status: Shipment['status']) {
    console.log(`[LOGISTICS] Shipment ${shipmentId} updated to: ${status}`);
    // الربط مع أنظمة التتبع (GPS/Barcode)
  }
}
