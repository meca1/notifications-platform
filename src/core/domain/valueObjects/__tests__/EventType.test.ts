import { EventType } from '../EventType';

describe('EventType', () => {
  describe('create', () => {
    it('should create a valid event type', () => {
      const eventType = EventType.create('ORDER_CREATED');
      expect(eventType.getValue()).toBe('ORDER_CREATED');
    });

    it('should throw error for invalid event type', () => {
      expect(() => EventType.create('INVALID_TYPE')).toThrow('Invalid event type: INVALID_TYPE');
    });

    it('should create all valid event types', () => {
      const validTypes = [
        'PAYMENT_RECEIVED',
        'PAYMENT_FAILED',
        'ORDER_CREATED',
        'ORDER_UPDATED',
        'ORDER_CANCELLED',
        'SHIPMENT_CREATED',
        'SHIPMENT_DELIVERED',
        'REFUND_PROCESSED'
      ];

      validTypes.forEach(type => {
        const eventType = EventType.create(type);
        expect(eventType.getValue()).toBe(type);
      });
    });
  });

  describe('getValue', () => {
    it('should return the event type value', () => {
      const eventType = EventType.create('ORDER_CREATED');
      expect(eventType.getValue()).toBe('ORDER_CREATED');
    });
  });

  describe('equals', () => {
    it('should return true for same event type', () => {
      const eventType1 = EventType.create('ORDER_CREATED');
      const eventType2 = EventType.create('ORDER_CREATED');
      expect(eventType1.equals(eventType2)).toBe(true);
    });

    it('should return false for different event types', () => {
      const eventType1 = EventType.create('ORDER_CREATED');
      const eventType2 = EventType.create('ORDER_UPDATED');
      expect(eventType1.equals(eventType2)).toBe(false);
    });
  });
}); 