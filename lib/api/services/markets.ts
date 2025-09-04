/**
 * market API service
 */

import { ApiClient } from '../client';
import type {
  ApiResponse,
  Symbol,
  Ticker,
  OrderBook,
  Trade,
  Kline,
  KlineParams
} from '../types';

const client = new ApiClient();

export class MarketService {
  // get all trading pairs
  static async getSymbols(): Promise<ApiResponse<Symbol[]>> {
    return client.get<Symbol[]>('/market/symbols');
  }

  // get single trading pair info
  static async getSymbol(symbol: string): Promise<ApiResponse<Symbol>> {
    return client.get<Symbol>(`/market/symbols/${symbol}`);
  }

  // get all ticker data
  static async getTickers(): Promise<ApiResponse<Ticker[]>> {
    return client.get<Ticker[]>('/market/tickers');
  }

  // get single ticker data
  static async getTicker(symbol: string): Promise<ApiResponse<Ticker>> {
    return client.get<Ticker>(`/market/tickers/${symbol}`);
  }

  // get order book
  static async getOrderBook(symbol: string, limit?: number): Promise<ApiResponse<OrderBook>> {
    return client.get<OrderBook>(`/market/orderbook/${symbol}`, { limit });
  }

  // get recent trades
  static async getTrades(symbol: string, limit?: number): Promise<ApiResponse<Trade[]>> {
    return client.get<Trade[]>(`/market/trades/${symbol}`, { limit });
  }

  // get Kline data
  static async getKlines(params: KlineParams): Promise<ApiResponse<Kline[]>> {
    const { symbol, ...queryParams } = params;
    return client.get<Kline[]>(`/market/klines/${symbol}`, queryParams);
  }

  // get 24h stats
  static async get24hrStats(): Promise<ApiResponse<{
    totalVolume: number;
    totalTrades: number;
    priceChangeStats: Array<{
      symbol: string;
      priceChange: number;
      priceChangePercent: number;
    }>;
  }>> {
    return client.get('/market/24hr-stats');
  }

  // get hot trading pairs
  static async getHotSymbols(limit: number = 10): Promise<ApiResponse<Array<{
    symbol: string;
    volume24h: number;
    trades24h: number;
  }>>> {
    return client.get('/market/hot-symbols', { limit });
  }
}
