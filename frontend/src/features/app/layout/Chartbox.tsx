export default function ChartBox({ title }: { title: string }) {
  return (
    <div className="card p-3">
      <h6>{title}</h6>
      <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: "160px" }}>
        <small className="text-muted">Chart coming soon</small>
      </div>
    </div>
  );
}