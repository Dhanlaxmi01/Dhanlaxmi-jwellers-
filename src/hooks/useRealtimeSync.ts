import { useEffect, useState, useRef, useCallback } from 'react';
import { 
  JewelryProduct, 
  LiveRates, 
  LiveConfig, 
  OccasionThemeId, 
  SiteSettings, 
  Coupon, 
  OrderInquiry,
  RealtimeMessage,
  RealtimeEventType 
} from '../types';

export type RealtimeStatus = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING';

export interface RealtimeSyncHandlers {
  onInitialSync?: (data: {
    products: JewelryProduct[];
    allProductsAdmin?: JewelryProduct[];
    liveRates: LiveRates;
    liveConfig: LiveConfig;
    settings: SiteSettings;
    coupons: Coupon[];
    orders: OrderInquiry[];
  }) => void;
  onProductCreated?: (product: JewelryProduct) => void;
  onProductUpdated?: (product: JewelryProduct) => void;
  onProductDeleted?: (payload: { id: string; name?: string; deletedAt?: string; deletedBy?: string }) => void;
  onProductRestored?: (product: JewelryProduct) => void;
  onRatesUpdated?: (rates: LiveRates) => void;
  onThemeUpdated?: (themeData: { activeThemeId: OccasionThemeId; particlesEnabled: boolean; customAnnouncement: string }) => void;
  onLiveConfigUpdated?: (config: LiveConfig) => void;
  onSettingsUpdated?: (settings: SiteSettings) => void;
  onOrderCreated?: (order: OrderInquiry) => void;
  onOrderUpdated?: (order: OrderInquiry) => void;
  onCouponCreated?: (coupon: Coupon) => void;
  onCouponDeleted?: (payload: { id: string; code?: string }) => void;
}

export function useRealtimeSync(handlers: RealtimeSyncHandlers) {
  const [status, setStatus] = useState<RealtimeStatus>('CONNECTING');
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString());
  const [activeEventsCount, setActiveEventsCount] = useState<number>(0);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let isUnmounted = false;

    function connect() {
      if (isUnmounted) return;

      try {
        eventSource = new EventSource('/api/realtime/stream');

        eventSource.onopen = () => {
          if (!isUnmounted) {
            setStatus('CONNECTED');
            setLastSyncTime(new Date().toLocaleTimeString());
          }
        };

        eventSource.onmessage = (event) => {
          if (!event.data || isUnmounted) return;
          try {
            const message: RealtimeMessage = JSON.parse(event.data);
            const { type, data } = message;

            setActiveEventsCount(c => c + 1);
            setLastSyncTime(new Date().toLocaleTimeString());

            switch (type) {
              case 'INITIAL_SYNC':
                handlersRef.current.onInitialSync?.(data);
                break;
              case 'PRODUCT_CREATED':
                handlersRef.current.onProductCreated?.(data);
                break;
              case 'PRODUCT_UPDATED':
                handlersRef.current.onProductUpdated?.(data);
                break;
              case 'PRODUCT_DELETED':
                handlersRef.current.onProductDeleted?.(data);
                break;
              case 'PRODUCT_RESTORED':
                handlersRef.current.onProductRestored?.(data);
                break;
              case 'RATES_UPDATED':
                handlersRef.current.onRatesUpdated?.(data);
                break;
              case 'THEME_UPDATED':
                handlersRef.current.onThemeUpdated?.(data);
                break;
              case 'LIVE_CONFIG_UPDATED':
                handlersRef.current.onLiveConfigUpdated?.(data);
                break;
              case 'SETTINGS_UPDATED':
                handlersRef.current.onSettingsUpdated?.(data);
                break;
              case 'ORDER_CREATED':
                handlersRef.current.onOrderCreated?.(data);
                break;
              case 'ORDER_UPDATED':
                handlersRef.current.onOrderUpdated?.(data);
                break;
              case 'COUPON_CREATED':
                handlersRef.current.onCouponCreated?.(data);
                break;
              case 'COUPON_DELETED':
                handlersRef.current.onCouponDeleted?.(data);
                break;
              default:
                break;
            }
          } catch (err) {
            console.warn('[Realtime Sync] Parse error on incoming SSE message:', err);
          }
        };

        eventSource.onerror = () => {
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          if (!isUnmounted) {
            setStatus('RECONNECTING');
            reconnectTimeout = setTimeout(connect, 2500);
          }
        };
      } catch (err) {
        console.error('[Realtime Sync] Connection failed:', err);
        if (!isUnmounted) {
          setStatus('DISCONNECTED');
          reconnectTimeout = setTimeout(connect, 3000);
        }
      }
    }

    connect();

    return () => {
      isUnmounted = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  return {
    status,
    lastSyncTime,
    activeEventsCount,
    isConnected: status === 'CONNECTED'
  };
}
