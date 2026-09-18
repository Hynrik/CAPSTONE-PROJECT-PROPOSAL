interface Props {
  title: string;
  value: string;
  icon: string;
  color: string;
}

export default function StatCard({ title, value, icon, color }: Props) {
  return (
    <div className="col-xl-3 col-lg-6 col-md-6">
      <div className="card stat-card h-100 border-0 bg-white">
        <div className="card-body d-flex justify-content-between align-items-center">
          <div>
            <h6 className="text-muted mb-1">{title}</h6>
            <h3 className="mb-0 fw-bold">{value}</h3>
          </div>
          <div className={`stat-icon bg-${color} text-white`}>
            <i className={`bi ${icon} fs-4`}></i>
          </div>
        </div>
      </div>
    </div>
  );
}