'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/src/components/auth/AuthProvider';
import {
  checkInBooking,
  checkOutBooking,
  getAdminBookings,
  getAdminBooking,
  updateBookingStatus,
  type Booking,
  type BookingStatus,
} from '@/src/lib/admin-bookings-api';
import { ApiError } from '@/src/lib/api';

const STATUS_OPTIONS: Array<BookingStatus | 'ALL'> = [
  'ALL',
  'PENDING',
  'CONFIRMED',
  'CHECKED_IN',
  'CHECKED_OUT',
  'CANCELLED',
];

const statusLabels: Record<BookingStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CHECKED_IN: 'Checked in',
  CHECKED_OUT: 'Checked out',
  CANCELLED: 'Cancelled',
};

function formatCurrency(value: number | string): string {
  const amount =
    typeof value === 'number' ? value : Number.parseFloat(value);

  if (!Number.isFinite(amount)) {
    return 'ETB 0.00';
  }

  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function getStatusClass(status: BookingStatus): string {
  return `booking-status booking-status-${status.toLowerCase()}`;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}

function canConfirm(status: BookingStatus): boolean {
  return status === 'PENDING';
}

function canCancel(status: BookingStatus): boolean {
  return status === 'PENDING' || status === 'CONFIRMED';
}

function canCheckIn(status: BookingStatus): boolean {
  return status === 'CONFIRMED';
}

function canCheckOut(status: BookingStatus): boolean {
  return status === 'CHECKED_IN';
}

function getPrimaryGuest(booking: Booking) {
  return (
    booking.guests.find((guest) => guest.isPrimary) ??
    booking.guests[0]
  );
}

export default function AdminBookingsPage() {
  const { accessToken, user, isLoading: authLoading } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(
    null,
  );

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    BookingStatus | 'ALL'
  >('ALL');

  const [isLoading, setIsLoading] = useState(true);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const loadBookings = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await getAdminBookings(accessToken);
      setBookings(data);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!authLoading && accessToken) {
      loadBookings();
    }
  }, [accessToken, authLoading, loadBookings]);

  const filteredBookings = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const primaryGuest = getPrimaryGuest(booking);

      const matchesSearch =
        normalizedSearch.length === 0 ||
        booking.bookingReference.toLowerCase().includes(normalizedSearch) ||
        primaryGuest?.fullName
          .toLowerCase()
          .includes(normalizedSearch) ||
        primaryGuest?.phone
          .toLowerCase()
          .includes(normalizedSearch) ||
        booking.customerId.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === 'ALL' || booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, statusFilter]);

  const statistics = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter(
        (booking) => booking.status === 'PENDING',
      ).length,
      confirmed: bookings.filter(
        (booking) => booking.status === 'CONFIRMED',
      ).length,
      checkedIn: bookings.filter(
        (booking) => booking.status === 'CHECKED_IN',
      ).length,
      checkedOut: bookings.filter(
        (booking) => booking.status === 'CHECKED_OUT',
      ).length,
      cancelled: bookings.filter(
        (booking) => booking.status === 'CANCELLED',
      ).length,
    };
  }, [bookings]);

  async function openBookingDetails(bookingId: string) {
    if (!accessToken) {
      return;
    }

    setIsDetailsLoading(true);
    setActionError('');

    try {
      const booking = await getAdminBooking(
        bookingId,
        accessToken,
      );

      setSelectedBooking(booking);
    } catch (requestError) {
      setActionError(getErrorMessage(requestError));
    } finally {
      setIsDetailsLoading(false);
    }
  }

  function closeBookingDetails() {
    if (actionLoading) {
      return;
    }

    setSelectedBooking(null);
    setActionError('');
  }

  async function handleConfirm(booking: Booking) {
    if (!accessToken || !canConfirm(booking.status)) {
      return;
    }

    const confirmed = window.confirm(
      `Confirm booking ${booking.bookingReference}?`,
    );

    if (!confirmed) {
      return;
    }

    await performAction(
      booking.id,
      async () =>
        updateBookingStatus(
          booking.id,
          { status: 'CONFIRMED' },
          accessToken,
        ),
    );
  }

  async function handleCancel(booking: Booking) {
    if (!accessToken || !canCancel(booking.status)) {
      return;
    }

    const confirmed = window.confirm(
      `Cancel booking ${booking.bookingReference}? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    await performAction(
      booking.id,
      async () =>
        updateBookingStatus(
          booking.id,
          { status: 'CANCELLED' },
          accessToken,
        ),
    );
  }

  async function handleCheckIn(booking: Booking) {
    if (!accessToken || !canCheckIn(booking.status)) {
      return;
    }

    const confirmed = window.confirm(
      `Check in booking ${booking.bookingReference}?`,
    );

    if (!confirmed) {
      return;
    }

    await performAction(
      booking.id,
      async () =>
        checkInBooking(
          booking.id,
          accessToken,
        ),
    );
  }

  async function handleCheckOut(booking: Booking) {
    if (!accessToken || !canCheckOut(booking.status)) {
      return;
    }

    const confirmed = window.confirm(
      `Check out booking ${booking.bookingReference}?`,
    );

    if (!confirmed) {
      return;
    }

    await performAction(
      booking.id,
      async () =>
        checkOutBooking(
          booking.id,
          accessToken,
        ),
    );
  }

  async function performAction(
    bookingId: string,
    action: () => Promise<Booking>,
  ) {
    setActionLoading(bookingId);
    setActionError('');

    try {
      const updatedBooking = await action();

      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking.id === updatedBooking.id
            ? updatedBooking
            : booking,
        ),
      );

      setSelectedBooking((currentBooking) =>
        currentBooking?.id === updatedBooking.id
          ? updatedBooking
          : currentBooking,
      );
    } catch (requestError) {
      setActionError(getErrorMessage(requestError));
    } finally {
      setActionLoading(null);
    }
  }

  function renderActionButtons(booking: Booking) {
    const isActionLoading = actionLoading === booking.id;

    return (
      <div className="booking-actions">
        {canConfirm(booking.status) && (
          <button
            type="button"
            className="btn btn-success btn-sm"
            disabled={isActionLoading}
            onClick={() => handleConfirm(booking)}
          >
            {isActionLoading ? 'Processing...' : 'Confirm'}
          </button>
        )}

        {canCheckIn(booking.status) && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={isActionLoading}
            onClick={() => handleCheckIn(booking)}
          >
            {isActionLoading ? 'Processing...' : 'Check in'}
          </button>
        )}

        {canCheckOut(booking.status) && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={isActionLoading}
            onClick={() => handleCheckOut(booking)}
          >
            {isActionLoading ? 'Processing...' : 'Check out'}
          </button>
        )}

        {canCancel(booking.status) && (
          <button
            type="button"
            className="btn btn-danger btn-sm"
            disabled={isActionLoading}
            onClick={() => handleCancel(booking)}
          >
            Cancel
          </button>
        )}
      </div>
    );
  }

  if (authLoading || !user) {
    return (
      <div className="admin-page">
        <div className="admin-loading-card">
          <div className="admin-spinner" />
          <p>Loading booking management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page admin-bookings-page">
      <div className="admin-page-header">
        <div>
          <span className="admin-eyebrow">Operations</span>
          <h1>Booking Management</h1>
          <p>
            Manage reservations, guest stays, and booking status
            from one place.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={loadBookings}
          disabled={isLoading}
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <section className="booking-stat-grid">
        <div className="booking-stat-card">
          <span className="booking-stat-label">Total bookings</span>
          <strong>{statistics.total}</strong>
        </div>

        <div className="booking-stat-card booking-stat-pending">
          <span className="booking-stat-label">Pending</span>
          <strong>{statistics.pending}</strong>
        </div>

        <div className="booking-stat-card booking-stat-confirmed">
          <span className="booking-stat-label">Confirmed</span>
          <strong>{statistics.confirmed}</strong>
        </div>

        <div className="booking-stat-card booking-stat-checked-in">
          <span className="booking-stat-label">Checked in</span>
          <strong>{statistics.checkedIn}</strong>
        </div>

        <div className="booking-stat-card booking-stat-checked-out">
          <span className="booking-stat-label">Checked out</span>
          <strong>{statistics.checkedOut}</strong>
        </div>

        <div className="booking-stat-card booking-stat-cancelled">
          <span className="booking-stat-label">Cancelled</span>
          <strong>{statistics.cancelled}</strong>
        </div>
      </section>

      <section className="admin-card booking-management-card">
        <div className="booking-toolbar">
          <div className="booking-search-wrapper">
            <label htmlFor="booking-search">
              Search bookings
            </label>

            <input
              id="booking-search"
              type="search"
              className="form-input"
              placeholder="Reference, guest name, or phone..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <div className="booking-filter-wrapper">
            <label htmlFor="booking-status-filter">
              Status
            </label>

            <select
              id="booking-status-filter"
              className="form-select"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as BookingStatus | 'ALL',
                )
              }
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status === 'ALL'
                    ? 'All statuses'
                    : statusLabels[status]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="admin-alert admin-alert-error">
            <div>
              <strong>Unable to load bookings</strong>
              <p>{error}</p>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={loadBookings}
            >
              Try again
            </button>
          </div>
        )}

        {actionError && (
          <div className="admin-alert admin-alert-error">
            <div>
              <strong>Action failed</strong>
              <p>{actionError}</p>
            </div>

            <button
              type="button"
              className="admin-alert-close"
              onClick={() => setActionError('')}
              aria-label="Close error"
            >
              ×
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="booking-loading">
            <div className="admin-spinner" />
            <p>Loading bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="booking-empty">
            <div className="booking-empty-icon">▣</div>

            <h2>No bookings found</h2>

            <p>
              {search || statusFilter !== 'ALL'
                ? 'Try changing your search or status filter.'
                : 'There are no bookings available yet.'}
            </p>
          </div>
        ) : (
          <>
            <div className="booking-table-wrapper">
              <table className="booking-table">
                <thead>
                  <tr>
                    <th>Booking</th>
                    <th>Guest</th>
                    <th>Stay</th>
                    <th>Rooms</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th className="booking-actions-column">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredBookings.map((booking) => {
                    const primaryGuest =
                      getPrimaryGuest(booking);

                    return (
                      <tr key={booking.id}>
                        <td>
                          <button
                            type="button"
                            className="booking-reference-button"
                            onClick={() =>
                              openBookingDetails(booking.id)
                            }
                          >
                            {booking.bookingReference}
                          </button>

                          <span className="booking-created-date">
                            Created{' '}
                            {booking.createdAt
                              ? formatDate(
                                  booking.createdAt,
                                )
                              : '—'}
                          </span>
                        </td>

                        <td>
                          <div className="booking-guest-cell">
                            <strong>
                              {primaryGuest?.fullName ??
                                'No guest'}
                            </strong>

                            <span>
                              {primaryGuest?.phone ?? '—'}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div className="booking-stay-cell">
                            <strong>
                              {formatDate(
                                booking.checkIn,
                              )}
                            </strong>
                            <span>
                              to{' '}
                              {formatDate(
                                booking.checkOut,
                              )}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span className="booking-room-count">
                            {booking.rooms.length}{' '}
                            {booking.rooms.length === 1
                              ? 'room'
                              : 'rooms'}
                          </span>
                        </td>

                        <td>
                          <strong>
                            {formatCurrency(
                              booking.totalAmount,
                            )}
                          </strong>
                        </td>

                        <td>
                          <span
                            className={getStatusClass(
                              booking.status,
                            )}
                          >
                            {statusLabels[
                              booking.status
                            ]}
                          </span>
                        </td>

                        <td>
                          <div className="booking-row-actions">
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() =>
                                openBookingDetails(
                                  booking.id,
                                )
                              }
                            >
                              Details
                            </button>

                            {renderActionButtons(booking)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="booking-mobile-list">
              {filteredBookings.map((booking) => {
                const primaryGuest =
                  getPrimaryGuest(booking);

                return (
                  <article
                    className="booking-mobile-card"
                    key={booking.id}
                  >
                    <div className="booking-mobile-card-header">
                      <div>
                        <button
                          type="button"
                          className="booking-reference-button"
                          onClick={() =>
                            openBookingDetails(booking.id)
                          }
                        >
                          {booking.bookingReference}
                        </button>

                        <span>
                          {primaryGuest?.fullName ??
                            'No guest'}
                        </span>
                      </div>

                      <span
                        className={getStatusClass(
                          booking.status,
                        )}
                      >
                        {statusLabels[booking.status]}
                      </span>
                    </div>

                    <div className="booking-mobile-details">
                      <div>
                        <span>Stay</span>
                        <strong>
                          {formatDate(booking.checkIn)}
                          {' — '}
                          {formatDate(booking.checkOut)}
                        </strong>
                      </div>

                      <div>
                        <span>Rooms</span>
                        <strong>
                          {booking.rooms.length}
                        </strong>
                      </div>

                      <div>
                        <span>Total</span>
                        <strong>
                          {formatCurrency(
                            booking.totalAmount,
                          )}
                        </strong>
                      </div>
                    </div>

                    <div className="booking-mobile-actions">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() =>
                          openBookingDetails(booking.id)
                        }
                      >
                        Details
                      </button>

                      {renderActionButtons(booking)}
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>

      {selectedBooking && (
        <div
          className="admin-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeBookingDetails();
            }
          }}
        >
          <div
            className="admin-modal booking-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-details-title"
          >
            <div className="admin-modal-header">
              <div>
                <span className="admin-eyebrow">
                  Booking details
                </span>

                <h2 id="booking-details-title">
                  {selectedBooking.bookingReference}
                </h2>
              </div>

              <button
                type="button"
                className="admin-modal-close"
                onClick={closeBookingDetails}
                disabled={Boolean(actionLoading)}
                aria-label="Close booking details"
              >
                ×
              </button>
            </div>

            {isDetailsLoading ? (
              <div className="booking-details-loading">
                <div className="admin-spinner" />
                <p>Loading booking details...</p>
              </div>
            ) : (
              <div className="admin-modal-body">
                <div className="booking-detail-summary">
                  <div>
                    <span>Status</span>
                    <strong>
                      <span
                        className={getStatusClass(
                          selectedBooking.status,
                        )}
                      >
                        {
                          statusLabels[
                            selectedBooking.status
                          ]
                        }
                      </span>
                    </strong>
                  </div>

                  <div>
                    <span>Total amount</span>
                    <strong>
                      {formatCurrency(
                        selectedBooking.totalAmount,
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Check-in</span>
                    <strong>
                      {formatDateTime(
                        selectedBooking.checkIn,
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Check-out</span>
                    <strong>
                      {formatDateTime(
                        selectedBooking.checkOut,
                      )}
                    </strong>
                  </div>
                </div>

                <section className="booking-detail-section">
                  <div className="booking-detail-section-heading">
                    <h3>Customer</h3>
                  </div>

                  <div className="booking-detail-grid">
                    <div>
                      <span>Customer ID</span>
                      <strong>
                        {selectedBooking.customerId}
                      </strong>
                    </div>

                    {getPrimaryGuest(selectedBooking) && (
                      <>
                        <div>
                          <span>Name</span>
                          <strong>
                            {
                              getPrimaryGuest(
                                selectedBooking,
                              )?.fullName
                            }
                          </strong>
                        </div>

                        <div>
                          <span>Phone</span>
                          <strong>
                            {
                              getPrimaryGuest(
                                selectedBooking,
                              )?.phone
                            }
                          </strong>
                        </div>

                        <div>
                          <span>Nationality</span>
                          <strong>
                            {
                              getPrimaryGuest(
                                selectedBooking,
                              )?.nationality
                            }
                          </strong>
                        </div>
                      </>
                    )}
                  </div>
                </section>

                <section className="booking-detail-section">
                  <div className="booking-detail-section-heading">
                    <h3>
                      Rooms ({selectedBooking.rooms.length})
                    </h3>
                  </div>

                  <div className="booking-detail-list">
                    {selectedBooking.rooms.map(
                      (bookingRoom) => (
                        <div
                          className="booking-detail-item"
                          key={bookingRoom.id}
                        >
                          <div>
                            <strong>
                              Room{' '}
                              {
                                bookingRoom.room
                                  .roomNumber
                              }
                            </strong>

                            <span>
                              {
                                bookingRoom.room
                                  .roomType.name
                              }
                            </span>
                          </div>

                          <span>
                            Floor{' '}
                            {bookingRoom.room.floor}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </section>

                <section className="booking-detail-section">
                  <div className="booking-detail-section-heading">
                    <h3>
                      Guests ({selectedBooking.guests.length})
                    </h3>
                  </div>

                  <div className="booking-detail-list">
                    {selectedBooking.guests.map(
                      (guest) => (
                        <div
                          className="booking-detail-item"
                          key={guest.id}
                        >
                          <div>
                            <strong>
                              {guest.fullName}
                              {guest.isPrimary && (
                                <span className="booking-primary-label">
                                  Primary
                                </span>
                              )}
                            </strong>

                            <span>
                              {guest.phone}
                            </span>
                          </div>

                          <span>
                            {guest.nationality}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </section>

                <section className="booking-detail-section">
                  <div className="booking-detail-section-heading">
                    <h3>
                      Payments ({selectedBooking.payments.length})
                    </h3>
                  </div>

                  {selectedBooking.payments.length === 0 ? (
                    <div className="booking-no-data">
                      No payments recorded for this booking.
                    </div>
                  ) : (
                    <div className="booking-detail-list">
                      {selectedBooking.payments.map(
                        (payment) => (
                          <div
                            className="booking-detail-item"
                            key={payment.id}
                          >
                            <div>
                              <strong>
                                {formatCurrency(
                                  payment.amount ??
                                    0,
                                )}
                              </strong>

                              <span>
                                {payment.status ??
                                  'Unknown'}
                              </span>
                            </div>

                            <span>
                              {payment.paidAt
                                ? formatDateTime(
                                    payment.paidAt,
                                  )
                                : 'Not paid'}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </section>
              </div>
            )}

            <div className="admin-modal-footer">
              {renderActionButtons(selectedBooking)}

              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeBookingDetails}
                disabled={Boolean(actionLoading)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}