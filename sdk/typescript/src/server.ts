import { Request, Response, NextFunction } from 'express';
import {
  Keypair,
  SorobanRpc,
  TransactionBuilder,
  Contract,
  nativeToScVal,
  Address,
} from '@stellar/stellar-sdk';
import { X402PaymentPayload, PaymentAuth, X402FlashServerConfig } from './types';
import * as nacl from 'tweetnacl';

export class X402FlashServer {
  private server: SorobanRpc.Server;
  private keypair: Keypair;
  private contractId: string;
  private networkPassphrase: string;
  private paymentAddress: string;

  constructor(config: X402FlashServerConfig) {
    this.server = new SorobanRpc.Server(config.rpcUrl);
    this.keypair = Keypair.fromSecret(config.secretKey);
    this.contractId = config.contractId;
    this.networkPassphrase = config.networkPassphrase;
    this.paymentAddress = config.paymentAddress;
  }

  /**
   * Express middleware for x402-flash payments
   */
  middleware(routes: {
    [route: string]: {
      price: string;
      token: string;
      network: string;
    };
  }) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const routeKey = `${req.method} ${req.path}`;
      const routeConfig = routes[routeKey];

      if (!routeConfig) {
        return next();
      }

      const paymentHeader = req.header('X-Payment');

      if (!paymentHeader) {
        // Return 402 with payment requirements
        return res.status(402).json({
          x402Version: 1,
          accepts: [
            {
              scheme: 'flash',
              network: routeConfig.network,
              maxAmountRequired: routeConfig.price,
              resource: req.originalUrl,
              description: `Access to ${req.path}`,
              mimeType: 'application/json',
              payTo: this.paymentAddress,
              maxTimeoutSeconds: 60,
              asset: routeConfig.token,
              extra: {},
            },
          ],
          error: 'X-Payment header required',
        });
      }

      // Parse payment
      try {
        const decoded = Buffer.from(paymentHeader, 'base64').toString('utf-8');
        const paymentPayload: X402PaymentPayload = JSON.parse(decoded);

        if (paymentPayload.scheme !== 'flash') {
          return res.status(400).json({ error: 'Unsupported payment scheme' });
        }

        // Verify and settle payment
        const { auth, signature, publicKey } = paymentPayload.payload;

        // Settle payment on-chain (async)
        this.settlePaymentAsync(auth, signature, publicKey).catch((err) => {
          console.error('Settlement failed:', err);
        });

        // Immediately respond (flash!)
        res.setHeader(
          'X-Payment-Response',
          Buffer.from(
            JSON.stringify({
              success: true,
              network: paymentPayload.network,
              timestamp: Date.now(),
            })
          ).toString('base64')
        );

        next();
      } catch (err) {
        console.error('Payment processing error:', err);
        return res.status(400).json({ error: 'Invalid payment' });
      }
    };
  }

  /**
   * Settle payment on-chain (async, doesn't block response)
   */
  private async settlePaymentAsync(
    auth: PaymentAuth,
    signature: string,
    publicKey: string
  ): Promise<void> {
    const account = await this.server.getAccount(this.keypair.publicKey());
    
    const contract = new Contract(this.contractId);

    // Convert signature from hex to bytes
    const sigBytes = Buffer.from(signature, 'hex');
    
    const tx = new TransactionBuilder(account, {
      fee: '100000',
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(
        contract.call(
          'settle_payment',
          nativeToScVal(Address.fromString(auth.client), { type: 'address' }),
          nativeToScVal(Address.fromString(auth.server), { type: 'address' }),
          nativeToScVal(auth, { type: 'map' }), // Convert PaymentAuth to ScVal map
          nativeToScVal(sigBytes, { type: 'bytes' }),
          nativeToScVal(Buffer.from(publicKey), { type: 'bytes' })
        )
      )
      .setTimeout(30)
      .build();

    tx.sign(this.keypair);

    await this.server.sendTransaction(tx);
    
    console.log(`✅ Payment settled: ${auth.amount} from ${auth.client}`);
  }
}

/**
 * Convenience function to create middleware
 */
export function x402FlashMiddleware(
  config: X402FlashServerConfig,
  routes: any
) {
  const server = new X402FlashServer(config);
  return server.middleware(routes);
}
