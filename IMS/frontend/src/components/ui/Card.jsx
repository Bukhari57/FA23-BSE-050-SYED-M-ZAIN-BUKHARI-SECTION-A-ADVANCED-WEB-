export default function Card({ children, className = '' }) {
  return (
    <div className={`premium-panel rounded-[2rem] p-6 ${className}`}>
      {children}
    </div>
  );
}
