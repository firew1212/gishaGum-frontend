import { apiRequest } from './api';

export type PaymentMethod =
  | 'TELEBIRR'
  | 'MPESA'
  | 'BANK_TRANSFER'
  | 'CASH';

export type PaymentType =
  | 'DEPOSIT'
  | 'BALANCE'
  | 'FULL_PAYMENT';

export type PaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED';

export interface InitializePaymentPayload {
  bookingId: string;
  paymentType: PaymentType;
  paymentMethod: PaymentMethod;
}

export interface InitializePaymentResponse {
  checkoutUrl: string;
  txRef: string;
  paymentId?: string;
  amount?: number | string;
  paymentType?: PaymentType;
}

export interface VerifiedPayment {
  id: string;
  txRef?: string | null;
  gatewayReference?: string | null;
  amount?: number | string;
  status: PaymentStatus | string;
  paidAt?: string | null;
}

export interface VerifiedBooking {
  id: string;
  bookingReference: string;
  status: string;
  totalAmount: number | string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message?: string;
  payment: VerifiedPayment;
  booking: VerifiedBooking;
}

export async function initializePayment(
  payload: InitializePaymentPayload,
  accessToken: string,
): Promise<InitializePaymentResponse> {
  return apiRequest<InitializePaymentResponse>('/payments/initialize', {
    method: 'POST',
    token: accessToken,
    body: JSON.stringify(payload),
  });
}

export async function verifyPayment(
  txRef: string,
  accessToken: string,
): Promise<VerifyPaymentResponse> {
  return apiRequest<VerifyPaymentResponse>(
    `/payments/verify/${encodeURIComponent(txRef)}`,
    {
      method: 'GET',
      token: accessToken,
    },
  );
}