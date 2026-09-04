'use client';

import ProtectedRoute from '@/src/components/auth/ProtectedRoute';
import { useAuth } from '@/src/components/auth/AuthProvider';

function AccountContent() {
const { user } = useAuth();

if (!user) {
return null;
}

return ( <section className="section"> <div className="container"> <span className="badge badge-success">
Authenticated </span>


    <h1
      className="heading-lg"
      style={{ marginTop: 18 }}
    >
      Welcome, {user.fullName}
    </h1>

    <p
      className="text-lead"
      style={{
        marginTop: 14,
        maxWidth: 650,
      }}
    >
      Your authentication is working. This account
      area will later become the customer dashboard.
    </p>

    <div
      className="card"
      style={{
        maxWidth: 650,
        marginTop: 36,
        padding: 24,
      }}
    >
      <h2 className="heading-md">
        Account information
      </h2>

      <dl
        style={{
          display: 'grid',
          gap: 16,
          margin: '24px 0 0',
        }}
      >
        <div>
          <dt className="text-muted">
            Full name
          </dt>
          <dd
            style={{
              margin: '4px 0 0',
              fontWeight: 700,
            }}
          >
            {user.fullName}
          </dd>
        </div>

        <div>
          <dt className="text-muted">
            Phone
          </dt>
          <dd
            style={{
              margin: '4px 0 0',
              fontWeight: 700,
            }}
          >
            {user.phone}
          </dd>
        </div>

        <div>
          <dt className="text-muted">
            Email
          </dt>
          <dd
            style={{
              margin: '4px 0 0',
              fontWeight: 700,
            }}
          >
            {user.email || 'Not provided'}
          </dd>
        </div>

        <div>
          <dt className="text-muted">
            Role
          </dt>
          <dd style={{ margin: '6px 0 0' }}>
            <span className="badge badge-primary">
              {user.role}
            </span>
          </dd>
        </div>
      </dl>
    </div>
  </div>
</section>


);
}

export default function AccountPage() {
return ( <ProtectedRoute> <AccountContent /> </ProtectedRoute>
);
}
