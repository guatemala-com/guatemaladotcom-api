import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';
import { PeerCertificate, TLSSocket } from 'tls';

export interface RequestWithCertificate extends Request {
  certificateFingerprint?: string;
  clientCertificate?: PeerCertificate;
}

/**
 * Certificate Validation Middleware
 *
 * Extracts and validates client certificates from HTTPS requests.
 * Adds certificate fingerprint to the request for further validation.
 */
@Injectable()
export class CertificateValidationMiddleware implements NestMiddleware {
  use(req: RequestWithCertificate, res: Response, next: NextFunction) {
    try {
      // Extract certificate from TLS connection
      const certificate = this.extractCertificate(req);

      if (certificate) {
        // Calculate SHA-256 fingerprint
        const fingerprint = this.calculateFingerprint(certificate);

        // Add certificate info to request
        req.certificateFingerprint = fingerprint;
        req.clientCertificate = certificate;

        // Log certificate presence for debugging
        console.log(`Client certificate detected: ${fingerprint}`);
      }

      next();
    } catch (error) {
      console.warn(
        'Certificate validation error:',
        error instanceof Error ? error.message : 'Unknown error',
      );
      // Don't fail the request - certificate validation is optional
      next();
    }
  }

  /**
   * Extract client certificate from TLS connection
   */
  private extractCertificate(
    req: RequestWithCertificate,
  ): PeerCertificate | null {
    // Check if request has TLS connection with client certificate
    const connection = req.connection || req.socket;

    if (!connection || !this.isTLSSocket(connection)) {
      return null;
    }

    try {
      const certificate = connection.getPeerCertificate(true);

      // Check if certificate is valid and not empty
      if (!certificate || Object.keys(certificate).length === 0) {
        return null;
      }

      return certificate;
    } catch (error) {
      console.warn(
        'Error extracting peer certificate:',
        error instanceof Error ? error.message : 'Unknown error',
      );
      return null;
    }
  }

  /**
   * Type guard to check if connection is TLS socket
   */
  private isTLSSocket(connection: unknown): connection is TLSSocket {
    return (
      connection instanceof TLSSocket ||
      (typeof connection === 'object' &&
        connection !== null &&
        'getPeerCertificate' in connection)
    );
  }

  /**
   * Calculate SHA-256 fingerprint of certificate
   */
  private calculateFingerprint(certificate: PeerCertificate): string {
    try {
      // Use the certificate's raw DER data if available
      if (certificate.raw) {
        return createHash('sha256')
          .update(certificate.raw)
          .digest('hex')
          .toUpperCase();
      }

      // Fallback: use certificate fingerprint if available
      if (certificate.fingerprint) {
        return certificate.fingerprint.replace(/:/g, '').toUpperCase();
      }

      // Fallback: create hash from certificate subject + serial
      const certData = `${certificate.subject?.CN || ''}:${certificate.serialNumber || ''}`;
      return createHash('sha256').update(certData).digest('hex').toUpperCase();
    } catch (error) {
      console.warn(
        'Error calculating certificate fingerprint:',
        error instanceof Error ? error.message : 'Unknown error',
      );
      throw new Error('Unable to calculate certificate fingerprint');
    }
  }
}
