"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/src/components/auth/AuthProvider";
import DashboardSection from "@/src/components/admin/dashboard/DashboardSection";
import DashboardStatCard from "@/src/components/admin/dashboard/DashboardStatCard";
import RoomStatusOverview from "@/src/components/admin/dashboard/RoomStatusOverview";
import BookingStatusOverview from "@/src/components/admin/dashboard/BookingStatusOverview";
import RecentBookingsTable from "@/src/components/admin/dashboard/RecentBookingsTable";

import {
  calculateDashboardMetrics,
  formatCurrency,
  getRecentBookings,
  type DashboardMetrics,
} from "@/src/lib/admin-dashboard";

import {
  getAdminDashboardData,
  type AdminDashboardData,
} from "@/src/lib/admin-api";

function OverviewIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function RoomIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M3 21V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v16" />
      <path d="M3 17h18" />
      <path d="M7 13h3v-3H7z" />
      <path d="M14 13h3v-3h-3z" />
    </svg>
  );
}

function BookingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <path d="m8 15 2 2 5-5" />
    </svg>
  );
}

function PaymentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18M7 15h3" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M20 11a8.1 8.1 0 0 0-14.8-4L3 10" />
      <path d="M3 4v6h6" />
      <path d="M4 13a8.1 8.1 0 0 0 14.8 4L21 14" />
      <path d="M21 20v-6h-6" />
    </svg>
  );
}

const emptyMetrics: DashboardMetrics = {
  totalRooms: 0,
  availableRooms: 0,
  occupiedRooms: 0,
  maintenanceRooms: 0,
  unavailableRooms: 0,
  totalBookings: 0,
  pendingBookings: 0,
  confirmedBookings: 0,
  checkedInBookings: 0,
  checkedOutBookings: 0,
  cancelledBookings: 0,
  totalRevenue: 0,
  paidPayments: 0,
  pendingPayments: 0,
};

export default function AdminDashboardPage() {
  const { accessToken } = useAuth();

  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics>(emptyMetrics);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const dashboardData = await getAdminDashboardData(accessToken);

      setData(dashboardData);

      setMetrics(
        calculateDashboardMetrics(
          dashboardData.rooms,
          dashboardData.bookings,
          dashboardData.payments,
        ),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load dashboard data.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (isLoading) {
    return (
      <section className="admin-page">
        <div className="admin-page-heading">
          <div>
            <p className="admin-page-kicker">Overview</p>
            <h2 className="admin-page-title">Dashboard</h2>
          </div>
        </div>

        <div className="dashboard-loading-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="dashboard-skeleton-card" key={index} />
          ))}
        </div>

        <div className="dashboard-skeleton-large" />
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="admin-page">
        <div className="admin-page-heading">
          <div>
            <p className="admin-page-kicker">Overview</p>
            <h2 className="admin-page-title">Dashboard</h2>
          </div>
        </div>

        <div className="dashboard-error-state">
          <h3>Unable to load dashboard</h3>
          <p>{errorMessage}</p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={loadDashboard}
          >
            Try again
          </button>
        </div>
      </section>
    );
  }

  const recentBookings = getRecentBookings(data?.bookings ?? []);

  return (
    <section className="admin-page">
      <div className="admin-page-heading">
        <div>
          <p className="admin-page-kicker">Overview</p>
          <h2 className="admin-page-title">Dashboard</h2>
          <p className="admin-page-description">
            Monitor your hotel operations and daily performance.
          </p>
        </div>

        <button
          type="button"
          className="admin-refresh-button"
          onClick={loadDashboard}
          aria-label="Refresh dashboard"
        >
          <RefreshIcon />
          <span>Refresh</span>
        </button>
      </div>

      <div className="dashboard-stat-grid">
        <DashboardStatCard
          label="Total rooms"
          value={metrics.totalRooms}
          description={`${metrics.availableRooms} currently available`}
          tone="blue"
          icon={<RoomIcon />}
        />

        <DashboardStatCard
          label="Total bookings"
          value={metrics.totalBookings}
          description={`${metrics.pendingBookings} awaiting action`}
          tone="purple"
          icon={<BookingIcon />}
        />

        <DashboardStatCard
          label="Paid revenue"
          value={formatCurrency(metrics.totalRevenue)}
          description={`${metrics.paidPayments} successful payments`}
          tone="green"
          icon={<PaymentIcon />}
        />

        <DashboardStatCard
          label="Occupied rooms"
          value={metrics.occupiedRooms}
          description={`${metrics.maintenanceRooms} under maintenance`}
          tone="orange"
          icon={<OverviewIcon />}
        />
      </div>

      <div className="dashboard-content-grid">
        <DashboardSection
          title="Room status"
          description="Current room availability"
          action={
            <Link href="/admin/rooms" className="dashboard-section-link">
              Manage rooms
            </Link>
          }
        >
          <RoomStatusOverview metrics={metrics} />
        </DashboardSection>

        <DashboardSection
          title="Booking status"
          description="Current booking lifecycle"
          action={
            <Link href="/admin/bookings" className="dashboard-section-link">
              View bookings
            </Link>
          }
        >
          <BookingStatusOverview metrics={metrics} />
        </DashboardSection>
      </div>

      <DashboardSection
        title="Recent bookings"
        description="The latest booking activity"
        action={
          <Link href="/admin/bookings" className="dashboard-section-link">
            View all
          </Link>
        }
      >
        <RecentBookingsTable bookings={recentBookings} />
      </DashboardSection>
    </section>
  );
}
