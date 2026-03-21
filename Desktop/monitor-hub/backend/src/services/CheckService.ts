import axios from 'axios';
import * as dns from 'dns';
import * as net from 'net';
import { promisify } from 'util';

const dnsResolve4 = promisify(dns.resolve4);

export interface CheckResult {
  success: boolean;
  responseTimeMs: number;
  errorMessage?: string;
}

export class CheckService {
  static async checkHttp(
    url: string,
    method: string = 'GET',
    expectedStatusCode: number = 200,
    timeoutMs: number = 5000
  ): Promise<CheckResult> {
    const startTime = Date.now();

    try {
      const response = await axios({
        method: method.toUpperCase(),
        url,
        timeout: timeoutMs,
        validateStatus: () => true, // Não throw em status error
      });

      const responseTimeMs = Date.now() - startTime;
      const success = response.status === expectedStatusCode;

      return {
        success,
        responseTimeMs,
        errorMessage: success ? undefined : `Expected ${expectedStatusCode}, got ${response.status}`,
      };
    } catch (error: any) {
      const responseTimeMs = Date.now() - startTime;
      return {
        success: false,
        responseTimeMs,
        errorMessage: error.message || 'HTTP check failed',
      };
    }
  }

  static async checkTcp(
    host: string,
    port: number,
    timeoutMs: number = 5000
  ): Promise<CheckResult> {
    const startTime = Date.now();

    return new Promise((resolve) => {
      const socket = new net.Socket();
      let isResolved = false;

      const timeout = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          socket.destroy();
          resolve({
            success: false,
            responseTimeMs: Date.now() - startTime,
            errorMessage: 'TCP connection timeout',
          });
        }
      }, timeoutMs);

      socket.on('connect', () => {
        if (!isResolved) {
          isResolved = true;
          clearTimeout(timeout);
          const responseTimeMs = Date.now() - startTime;
          socket.destroy();
          resolve({
            success: true,
            responseTimeMs,
          });
        }
      });

      socket.on('error', (error) => {
        if (!isResolved) {
          isResolved = true;
          clearTimeout(timeout);
          resolve({
            success: false,
            responseTimeMs: Date.now() - startTime,
            errorMessage: error.message,
          });
        }
      });

      socket.connect(port, host);
    });
  }

  static async checkDns(
    hostname: string,
    timeoutMs: number = 5000
  ): Promise<CheckResult> {
    const startTime = Date.now();

    try {
      const result = await Promise.race([
        dnsResolve4(hostname),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('DNS timeout')), timeoutMs)
        ),
      ]);

      const responseTimeMs = Date.now() - startTime;
      return {
        success: !!result,
        responseTimeMs,
      };
    } catch (error: any) {
      return {
        success: false,
        responseTimeMs: Date.now() - startTime,
        errorMessage: error.message || 'DNS check failed',
      };
    }
  }

  static async executeCheck(
    type: string,
    url: string,
    options: any
  ): Promise<CheckResult> {
    switch (type) {
      case 'http':
        return this.checkHttp(url, options.method, options.expectedStatusCode, options.timeoutMs);
      case 'tcp':
        return this.checkTcp(url, options.port, options.timeoutMs);
      case 'dns':
        return this.checkDns(url, options.timeoutMs);
      default:
        throw new Error(`Unknown check type: ${type}`);
    }
  }
}