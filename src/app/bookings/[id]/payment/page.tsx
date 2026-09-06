
'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/src/components/auth/AuthProvider';
import ProtectedRoute from '@/src/components/auth/ProtectedRoute';

import {
  getMyBooking,
  type Booking,
} from '@/src/lib/bookings-api';

import {
  formatBookingDate,
  formatBookingPrice,
  getBookingStatusClass,
  getBookingStatusLabel,
} from '@/src/lib/booking-utils';

import {
  initializePayment,
  type PaymentMethod,
  type PaymentType,
} from '@/src/lib/payments-api';

type PaymentOption = {
  type: PaymentType;
  title: string;
  description: string;
};

const paymentOptions: PaymentOption[] = [
  {
    type: 'DEPOSIT',
    title: '30% deposit',
    description:
      'Pay 30% of the booking total now to secure your reservation.',
  },
  {
    type: 'FULL_PAYMENT',
    title: 'Full payment',
    description:
      'Pay the remaining balance in full.',
  },
];

const onlineMethods: {
  method: PaymentMethod;
  title: string;
  description: string;
}[] = [
  {
    method: 'TELEBIRR',
    title: 'Telebirr',
    description:
      'Pay securely using Telebirr through Chapa.',
  },
  {
    method: 'MPESA',
    title: 'M-Pesa',
    description:
      'Pay securely using M-Pesa through Chapa.',
  },
];

function calculatePaidAmount(
  booking: Booking,
): number {
  return booking.payments
    .filter(
      (payment) =>
        payment.status === 'PAID',
    )
    .reduce(
      (sum, payment) =>
        sum + Number(payment.amount ?? 0),
      0,
    );
}

export default function PaymentPage() {
  return (
    <ProtectedRoute>
      <PaymentContent />
    </ProtectedRoute>
  );
}

function PaymentContent() {
  const params = useParams<{ id: string }>();

  const {
    accessToken,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();

  const [booking, setBooking] =
    useState<Booking | null>(null);

  const [paymentType, setPaymentType] =
    useState<PaymentType>('DEPOSIT');

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('TELEBIRR');

  const [loading, setLoading] =
    useState(true);

  const [processing, setProcessing] =
    useState(false);

  const [error, setError] =
    useState('');

  useEffect(() => {
    let mounted = true;

    async function loadBooking() {
      if (authLoading) {
        return;
      }

      if (
        !isAuthenticated ||
        !accessToken
      ) {
        if (mounted) {
          setError(
            'Please sign in to continue with payment.',
          );
          setLoading(false);
        }

        return;
      }

      if (!params.id) {
        if (mounted) {
          setError(
            'Booking ID is missing.',
          );
          setLoading(false);
        }

        return;
      }

      try {
        setLoading(true);
        setError('');

        const data =
          await getMyBooking(
            params.id,
            accessToken,
          );

        if (mounted) {
          setBooking(data);
        }
      } catch (requestError) {
        if (mounted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Unable to load your booking.',
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadBooking();

    return () => {
      mounted = false;
    };
  }, [
    params.id,
    accessToken,
    isAuthenticated,
    authLoading,
  ]);

  const paymentSummary =
    useMemo(() => {
      if (!booking) {
        return {
          total: 0,
          paid: 0,
          balance: 0,
          deposit: 0,
        };
      }

      const total = Number(
        booking.totalAmount,
      );

      const paid =
        calculatePaidAmount(booking);

      const balance = Math.max(
        total - paid,
        0,
      );

      const deposit = Math.min(
        balance,
        total * 0.3,
      );

      return {
        total,
        paid,
        balance,
        deposit,
      };
    }, [booking]);

  const amountToPay =
    paymentType === 'DEPOSIT'
      ? paymentSummary.deposit
      : paymentSummary.balance;

  const isPaymentUnavailable =
    !booking ||
    booking.status === 'CANCELLED' ||
    booking.status === 'CHECKED_OUT' ||
    paymentSummary.balance <= 0;

  async function handlePayment() {
    if (
      !booking ||
      !accessToken ||
      processing
    ) {
      return;
    }

    setError('');

    if (
      booking.status ===
      'CANCELLED'
    ) {
      setError(
        'This booking has been cancelled and cannot receive payment.',
      );
      return;
    }

    if (
      booking.status ===
      'CHECKED_OUT'
    ) {
      setError(
        'This booking has already been checked out.',
      );
      return;
    }

    if (amountToPay <= 0) {
      setError(
        'No payment is required for this booking.',
      );
      return;
    }

    try {
      setProcessing(true);

      const response =
        await initializePayment(
          {
            bookingId:
              booking.id,
            paymentType,
            paymentMethod,
          },
          accessToken,
        );

      if (!response.checkoutUrl) {
        throw new Error(
          'The payment checkout link was not returned by the server.',
        );
      }

      /*
       * Chapa checkout is an external page.
       *
       * Do not use router.push() here because
       * checkoutUrl belongs to Chapa.
       */
      window.location.assign(
        response.checkoutUrl,
      );
    } catch (requestError) {
      setProcessing(false);

      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to initialize payment.',
      );
    }
  }

  if (
    authLoading ||
    loading
  ) {
    return (
      <section className="payment-page">
        <div className="container">
          <div className="booking-loading">
            <span
              className="spinner"
              aria-hidden="true"
            />

            <p>
              {authLoading
                ? 'Verifying your account...'
                : 'Loading payment details...'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (
    !isAuthenticated ||
    !accessToken
  ) {
    return (
      <section className="payment-page">
        <div className="container">
          <div className="payment-empty-card">
            <div
              className="payment-empty-icon"
              aria-hidden="true"
            >
              🔐
            </div>

            <h1>
              Sign in to continue
            </h1>

            <p>
              Please sign in to your
              account before making a
              payment.
            </p>

            <Link
              href={`/login?redirect=/bookings/${params.id}/payment`}
              className="btn btn-primary btn-lg"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (error && !booking) {
    return (
      <section className="payment-page">
        <div className="container">
          <div className="booking-error">
            <strong>
              Unable to load payment
              details
            </strong>

            <p>{error}</p>

            <Link
              href={`/bookings/${params.id}`}
              className="btn btn-secondary"
            >
              Back to booking
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (!booking) {
    return null;
  }

  const firstRoom =
    booking.rooms[0]?.room;

  return (
    <section className="payment-page">
      <div className="container">
        <Link
          href={`/bookings/${booking.id}`}
          className="payment-back-link"
        >
          ← Back to booking
        </Link>

        <div className="payment-header">
          <div>
            <span className="badge badge-primary">
              Secure payment
            </span>

            <h1>
              Complete your payment
            </h1>

            <p>
              Choose your payment option
              and continue securely with
              Chapa.
            </p>
          </div>
        </div>

        {error && (
          <div
            className="booking-error"
            role="alert"
          >
            <span
              className="booking-error-icon"
              aria-hidden="true"
            >
              !
            </span>

            <div>
              <strong>
                Payment couldn&apos;t be
                started
              </strong>

              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="payment-layout">
          <main className="payment-main">
            <div className="payment-card">
              <div className="payment-card-heading">
                <span className="booking-summary-eyebrow">
                  01
                </span>

                <div>
                  <h2>
                    Choose payment amount
                  </h2>

                  <p>
                    Select how much you
                    want to pay now.
                  </p>
                </div>
              </div>

              <div className="payment-options">
                {paymentOptions.map(
                  (option) => {
                    const selected =
                      paymentType ===
                      option.type;

                    const optionAmount =
                      option.type ===
                      'DEPOSIT'
                        ? paymentSummary.deposit
                        : paymentSummary.balance;

                    return (
                      <button
                        key={
                          option.type
                        }
                        type="button"
                        className={`payment-option ${
                          selected
                            ? 'payment-option-selected'
                            : ''
                        }`}
                        onClick={() =>
                          setPaymentType(
                            option.type,
                          )
                        }
                        disabled={
                          processing ||
                          optionAmount <=
                            0 ||
                          booking.status ===
                            'CANCELLED' ||
                          booking.status ===
                            'CHECKED_OUT'
                        }
                      >
                        <span className="payment-option-radio">
                          {selected
                            ? '✓'
                            : ''}
                        </span>

                        <span className="payment-option-content">
                          <strong>
                            {
                              option.title
                            }
                          </strong>

                          <span>
                            {
                              option.description
                            }
                          </span>
                        </span>

                        <strong className="payment-option-amount">
                          {formatBookingPrice(
                            optionAmount,
                          )}
                        </strong>
                      </button>
                    );
                  },
                )}
              </div>
            </div>

            <div className="payment-card">
              <div className="payment-card-heading">
                <span className="booking-summary-eyebrow">
                  02
                </span>

                <div>
                  <h2>
                    Choose payment method
                  </h2>

                  <p>
                    You will be redirected
                    to Chapa&apos;s secure
                    checkout.
                  </p>
                </div>
              </div>

              <div className="payment-method-options">
                {onlineMethods.map(
                  (option) => {
                    const selected =
                      paymentMethod ===
                      option.method;

                    return (
                      <button
                        key={
                          option.method
                        }
                        type="button"
                        className={`payment-method-option ${
                          selected
                            ? 'payment-method-selected'
                            : ''
                        }`}
                        onClick={() =>
                          setPaymentMethod(
                            option.method,
                          )
                        }
                        disabled={
                          processing
                        }
                      >
                        <span className="payment-method-icon">
                          {option.method ===
                          'TELEBIRR'
                            ? 'T'
                            : 'M'}
                        </span>

                        <span>
                          <strong>
                            {
                              option.title
                            }
                          </strong>

                          <small>
                            {
                              option.description
                            }
                          </small>
                        </span>

                        <span className="payment-method-check">
                          {selected
                            ? '✓'
                            : ''}
                        </span>
                      </button>
                    );
                  },
                )}
              </div>

              <div className="payment-security-note">
                <span
                  aria-hidden="true"
                >
                  🔒
                </span>

                <p>
                  Your payment is
                  processed securely
                  through Chapa. Your
                  payment credentials
                  are not stored by this
                  website.
                </p>
              </div>
            </div>

            <div className="payment-card payment-payment-info">
              <div className="payment-info-icon">
                ✓
              </div>

              <div>
                <strong>
                  Secure checkout
                </strong>

                <p>
                  Clicking the button
                  below will take you
                  to Chapa&apos;s secure
                  payment page.
                </p>
              </div>
            </div>
          </main>

          <aside className="payment-sidebar">
            <div className="payment-summary-card">
              <span className="booking-summary-eyebrow">
                Reservation summary
              </span>

              <h2>
                Booking details
              </h2>

              <div className="payment-booking-room">
                <div className="payment-booking-image">
                  {firstRoom
                    ?.roomType
                    .images[0] ? (
                    <img
                      src={
                        firstRoom
                          .roomType
                          .images[0]
                      }
                      alt={
                        firstRoom
                          .roomType
                          .name
                      }
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                    >
                      🏨
                    </span>
                  )}
                </div>

                <div>
                  <strong>
                    {firstRoom
                      ?.roomType
                      .name ||
                      'Hotel room'}
                  </strong>

                  {firstRoom && (
                    <span>
                      Room{' '}
                      {
                        firstRoom.roomNumber
                      }
                    </span>
                  )}
                </div>
              </div>

              <div className="payment-summary-reference">
                <span>
                  Booking reference
                </span>

                <strong>
                  {
                    booking.bookingReference
                  }
                </strong>
              </div>

              <div className="payment-summary-dates">
                <div>
                  <span>
                    Check-in
                  </span>

                  <strong>
                    {formatBookingDate(
                      booking.checkIn,
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Check-out
                  </span>

                  <strong>
                    {formatBookingDate(
                      booking.checkOut,
                    )}
                  </strong>
                </div>
              </div>

              <div className="payment-summary-status">
                <span>
                  Status
                </span>

                <strong
                  className={`booking-status ${getBookingStatusClass(
                    booking.status,
                  )}`}
                >
                  {getBookingStatusLabel(
                    booking.status,
                  )}
                </strong>
              </div>

              <div className="payment-summary-lines">
                <div>
                  <span>
                    Booking total
                  </span>

                  <strong>
                    {formatBookingPrice(
                      paymentSummary.total,
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Already paid
                  </span>

                  <strong>
                    {formatBookingPrice(
                      paymentSummary.paid,
                    )}
                  </strong>
                </div>

                <div className="payment-balance-line">
                  <span>
                    Remaining balance
                  </span>

                  <strong>
                    {formatBookingPrice(
                      paymentSummary.balance,
                    )}
                  </strong>
                </div>
              </div>

              <div className="payment-total">
                <span>
                  Pay now
                </span>

                <strong>
                  {formatBookingPrice(
                    amountToPay,
                  )}
                </strong>
              </div>

              <button
                type="button"
                className="btn btn-primary btn-lg payment-submit-button"
                onClick={
                  handlePayment
                }
                disabled={
                  processing ||
                  isPaymentUnavailable
                }
              >
                {processing ? (
                  <>
                    <span
                      className="spinner spinner-small"
                      aria-hidden="true"
                    />

                    Connecting to
                    Chapa...
                  </>
                ) : (
                  <>
                    Pay{' '}
                    {formatBookingPrice(
                      amountToPay,
                    )}{' '}
                    securely
                  </>
                )}
              </button>

              {isPaymentUnavailable && (
                <p className="payment-disabled-message">
                  {booking.status ===
                  'CANCELLED'
                    ? 'Cancelled bookings cannot be paid.'
                    : booking.status ===
                        'CHECKED_OUT'
                      ? 'Checked-out bookings cannot receive payment.'
                      : paymentSummary.balance <=
                          0
                        ? 'This booking has been fully paid.'
                        : 'Payment is not available for this booking.'}
                </p>
              )}

              <Link
                href={`/bookings/${booking.id}`}
                className="payment-cancel-link"
              >
                Return to booking
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

