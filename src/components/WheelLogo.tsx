export function WheelLogo() {
  return (
    <svg viewBox="0 0 118 100" className="h-[47px] w-[56px]">
      {/* Speed lines */}
      <line x1="8" y1="34" x2="35" y2="34" stroke="#35c8f0" strokeWidth="2.4" strokeLinecap="round" opacity="0.5" />
      <line x1="5" y1="50" x2="38" y2="50" stroke="#35c8f0" strokeWidth="2.4" strokeLinecap="round" opacity="0.75" />
      <line x1="8" y1="66" x2="35" y2="66" stroke="#35c8f0" strokeWidth="2.4" strokeLinecap="round" opacity="0.5" />

      {/* Tire */}
      <circle cx="68" cy="50" r="45" fill="#0b1436" stroke="#35c8f0" strokeWidth="4" />

      {/* Spokes */}
      <line x1="68" y1="50" x2="106" y2="50" stroke="rgba(53,200,240,0.55)" strokeWidth="1.6" />
      <line x1="68" y1="50" x2="94.9" y2="76.9" stroke="rgba(53,200,240,0.55)" strokeWidth="1.6" />
      <line x1="68" y1="50" x2="68" y2="88" stroke="rgba(53,200,240,0.55)" strokeWidth="1.6" />
      <line x1="68" y1="50" x2="41.1" y2="76.9" stroke="rgba(53,200,240,0.55)" strokeWidth="1.6" />
      <line x1="68" y1="50" x2="30" y2="50" stroke="rgba(53,200,240,0.55)" strokeWidth="1.6" />
      <line x1="68" y1="50" x2="41.1" y2="23.1" stroke="rgba(53,200,240,0.55)" strokeWidth="1.6" />
      <line x1="68" y1="50" x2="68" y2="12" stroke="rgba(53,200,240,0.55)" strokeWidth="1.6" />
      <line x1="68" y1="50" x2="94.9" y2="23.1" stroke="rgba(53,200,240,0.55)" strokeWidth="1.6" />

      {/* Hub */}
      <circle cx="68" cy="50" r="6" fill="#35c8f0" />
    </svg>
  )
}
