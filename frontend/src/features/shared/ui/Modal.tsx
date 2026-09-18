import { useEffect } from "react";

interface Props {
  show: boolean;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClose: () => void;
  size?: "default" | "wide";
}

export default function Modal({ show, title, children, footer, onClose, size = "default" }: Props) {

  // ESC key close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!show) return null;

  return (
    <>
      {/* BACKDROP */}
      <div
        className="modal-backdrop fade show"
        onClick={onClose}
        style={{ zIndex: 1040 }}
      ></div>

      {/* MODAL */}
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        style={{ zIndex: 1050 }}
      >
        <div className={`modal-dialog modal-dialog-centered modal-dialog-scrollable ${size === "wide" ? "modal-dialog--wide" : ""}`}>
          <div className="modal-content rounded-4 shadow">

            {/* HEADER */}
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>

            {/* BODY */}
            <div className="modal-body">
              {children}
            </div>

            {/* FOOTER */}
            {footer && (
              <div className="modal-footer">
                {footer}
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}