
'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { useAuth } from '@/src/components/auth/AuthProvider';

import {
  verifyPayment,
  type VerifyPaymentResponse,
} from '@/src/lib/payments-api';

type PageState =
  | 'loading'
  | 'success'
  | 'failed'
  | 'pending'
  | 'error';

export default function ChapaReturnPage() {
  const searchParams = useSearchParams();

  const {
    accessToken,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();

  const [state, setState] =
    useState<PageState>('loading');

  const [result, setResult] =
    useState<VerifyPaymentResponse | null>(null);

  const [error, setError] = useState('');

  /*
   * Prevent duplicate verification requests.
   *
   * React Strict Mode can run effects more than once
   * during development, so this protects the payment
   * verification endpoint from unnecessary duplicate calls.
   */
  const verificationStarted = useRef(false);

  useEffect(() => {
    let mounted = true;

    async function verify() {
      if (authLoading) {
        return;
      }

      if (!isAuthenticated || !accessToken) {
        if (mounted) {
          setState('error');
          setError(
            'Please sign in to verify your payment.',
          );
        }

        return;
      }

      const txRef =
        searchParams.get('tx_ref');

      if (!txRef) {
        if (mounted) {
          setState('error');
          setError(
            'The payment transaction reference is missing.',
          );
        }

        return;
      }

      if (verificationStarted.current) {
        return;
      }

      verificationStarted.current = true;

      try {
        const response =
          await verifyPayment(
            txRef,
            accessToken,
          );

        if (!mounted) {
          return;
        }

        setResult(response);

        /*
         * The backend is authoritative.
         *
         * We only display success when the backend
         * explicitly confirms both:
         *
         *   success === true
         *   payment.status === PAID
         */
        if (
          response.success === true &&
          response.payment?.status === 'PAID'
        ) {
          setState('success');
          return;
        }

        if (
          response.payment?.status === 'FAILED'
        ) {
          setState('failed');
          return;
        }

        if (
          response.payment?.status === 'PENDING'
        ) {
          setState('pending');
          return;
        }

        setState('error');
        setError(
          response.message ??
            'Unable to determine the payment status.',
        );
      } catch (requestError) {
        if (!mounted) {
          return;
        }

        setState('error');

        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Unable to verify your payment.',
        );
      }
    }

    verify();

    return () => {
      mounted = false;
    };
  }, [
    accessToken,
    isAuthenticated,
    authLoading,
    searchParams,
  ]);

  /*
   * Loading / authentication state
   */
  if (
    authLoading ||
    state === 'loading'
  ) {
    return (
      <section className="payment-result-page">
        <div className="container">
          <div
            className="payment-result-card"
            aria-live="polite"
            aria-busy="true"
          >
            <div className="payment-result-icon payment-result-loading">
              <span
                className="spinner"
                aria-hidden="true"
              />
            </div>

            <h1>
              Verifying your payment
            </h1>

            <p>
              Please wait while we securely
              confirm your transaction with
              Chapa.
            </p>

            <p className="payment-result-note">
              Please do not close this page.
            </p>
          </div>
        </div>
      </section>
    );
  }

  /*
   * Successful payment
   */
  if (state === 'success') {
    return (
      <section className="payment-result-page">
        <div className="container">
          <div className="payment-result-card">
            <div
              className="payment-result-icon payment-result-success"
              aria-hidden="true"
            >
              ✓
            </div>

            <span className="badge badge-success">
              Payment successful
            </span>

            <h1>
              Your payment was confirmed
            </h1>

            <p>
              Your payment has been securely
              verified and your booking has
              been confirmed.
            </p>

            {result?.booking && (
              <div className="payment-result-summary">
                <div className="payment-summary-row">
                  <span>
                    Booking reference
                  </span>

                  <strong>
                    {
                      result.booking
                        .bookingReference
                    }
                  </strong>
                </div>

                <div className="payment-summary-row">
                  <span>
                    Booking status
                  </span>

                  <strong>
                    {formatStatus(
                      result.booking.status,
                    )}
                  </strong>
                </div>

                {result.payment?.amount !==
                  undefined && (
                  <div className="payment-summary-row">
                    <span>
                      Amount paid
                    </span>

                    <strong>
                      {formatAmount(
                        result.payment.amount,
                      )}
                    </strong>
                  </div>
                )}

                {result.payment?.txRef && (
                  <div className="payment-summary-row">
                    <span>
                      Transaction reference
                    </span>

                    <strong>
                      {result.payment.txRef}
                    </strong>
                  </div>
                )}

                {result.payment
                  ?.gatewayReference && (
                  <div className="payment-summary-row">
                    <span>
                      Gateway reference
                    </span>

                    <strong>
                      {
                        result.payment
                          .gatewayReference
                      }
                    </strong>
                  </div>
                )}
              </div>
            )}

            <div className="payment-result-actions">
              <Link
                href={
                  result?.booking?.id
                    ? `/bookings/${result.booking.id}`
                    : '/bookings'
                }
                className="btn btn-primary btn-lg"
              >
                View booking
              </Link>

              <Link
                href="/bookings"
                className="btn btn-secondary btn-lg"
              >
                My bookings
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /*
   * Failed payment
   */
  if (state === 'failed') {
    return (
      <section className="payment-result-page">
        <div className="container">
          <div className="payment-result-card">
            <div
              className="payment-result-icon payment-result-failed"
              aria-hidden="true"
            >
              !
            </div>

            <span className="badge badge-danger">
              Payment failed
            </span>

            <h1>
              Payment was not completed
            </h1>

            <p>
              Your payment could not be
              confirmed. Your booking has not
              been marked as paid.
            </p>

            <div className="payment-result-actions">
              <Link
                href="/bookings"
                className="btn btn-primary btn-lg"
              >
                My bookings
              </Link>

              <Link
                href="/rooms"
                className="btn btn-secondary btn-lg"
              >
                Explore rooms
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /*
   * Payment still pending
   */
  if (state === 'pending') {
    return (
      <section className="payment-result-page">
        <div className="container">
          <div className="payment-result-card">
            <div
              className="payment-result-icon payment-result-pending"
              aria-hidden="true"
            >
              …
            </div>

            <span className="badge badge-warning">
              Payment pending
            </span>

            <h1>
              Your payment is still processing
            </h1>

            <p>
              The payment provider has not
              returned a final payment status
              yet. Please check your booking
              again shortly.
            </p>

            <div className="payment-result-actions">
              <Link
                href="/bookings"
                className="btn btn-primary btn-lg"
              >
                My bookings
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /*
   * General verification error
   */
  return (
    <section className="payment-result-page">
      <div className="container">
        <div className="payment-result-card">
          <div
            className="payment-result-icon payment-result-failed"
            aria-hidden="true"
          >
            !
          </div>

          <span className="badge badge-danger">
            Verification problem
          </span>

          <h1>
            We couldn't verify the payment
          </h1>

          <p>
            {error ||
              'We were unable to verify your transaction.'}
          </p>

          <div className="payment-result-actions">
            <Link
              href="/bookings"
              className="btn btn-primary btn-lg"
            >
              My bookings
            </Link>

            <Link
              href="/rooms"
              className="btn btn-secondary btn-lg"
            >
              Explore rooms
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function formatAmount(
  amount: number | string,
): string {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return String(amount);
  }

  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
}

function formatStatus(
  status: string,
): string {
  return status
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

