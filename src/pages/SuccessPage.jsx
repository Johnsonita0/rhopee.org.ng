import './SuccessPage.css';

function SuccessPage({ data }) {
  return (
    <section className="success-page">
      <div className="success-card">
        <div className="success-head">
          <span className="badge verified">Member verified</span>
          <h2>Registration complete</h2>
          <p>{data.name || data.fullName} has been registered successfully as a verified member.</p>
        </div>

        <div className="success-details">
          <div>
            <strong>Name</strong>
            <p>{data.name || data.fullName}</p>
          </div>
          <div>
            <strong>Position</strong>
            <p>{data.position}</p>
          </div>
          <div>
            <strong>Membership ID</strong>
            <p>{data.membership_id || data.membershipId}</p>
          </div>
          <div>
            <strong>Chapter</strong>
            <p>{data.chapter}</p>
          </div>
          <div>
            <strong>Local Government</strong>
            <p>{data.local_government || data.localGovernment}</p>
          </div>
          <div>
            <strong>Passport</strong>
            {data.passport_url ? (
              <div className="success-passport-wrap">
                <img src={data.passport_url} alt="Passport" className="success-passport" />
              </div>
            ) : data.passport_data ? (
              <div className="success-passport-wrap">
                <img src={data.passport_data} alt="Passport" className="success-passport" />
              </div>
            ) : (
              <p>{data.passport_name || 'N/A'}</p>
            )}
          </div>
          <div>
            <strong>Issued</strong>
            <p>{data.issued_at || data.issuedAt}</p>
          </div>
          <div>
            <strong>Expires</strong>
            <p>{data.expires_at || data.expiresAt}</p>
          </div>
        </div>

        <div className="barcode-panel">
          <div className="barcode-placeholder">{data.barcode}</div>
          <p className="barcode-label">Scan code to verify this member</p>
        </div>
      </div>
    </section>
  );
}

export default SuccessPage;
