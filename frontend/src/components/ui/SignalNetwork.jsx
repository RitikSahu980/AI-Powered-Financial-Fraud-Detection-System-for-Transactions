/**
 * The signature visual for this app's auth screens: a quiet network of
 * pulsing nodes representing transactions flowing through the system,
 * with one node periodically flashing red - a caught fraud pattern -
 * accompanied by a brief label. This is deliberately the one place this
 * design "spends its boldness": everything else in the app stays
 * disciplined and quiet by comparison.
 *
 * Positions are fixed (not randomized) so the composition is intentional
 * rather than accidental, and reduced-motion is respected globally via
 * index.css's prefers-reduced-motion block.
 */
export default function SignalNetwork() {
  const nodes = [
    { id: 'a', x: 60, y: 90 },
    { id: 'b', x: 180, y: 50 },
    { id: 'c', x: 290, y: 120 },
    { id: 'd', x: 140, y: 190 },
    { id: 'e', x: 260, y: 230 },
    { id: 'f', x: 40, y: 240 },
    { id: 'flag', x: 210, y: 150 },
  ];

  const edges = [
    ['a', 'b'], ['b', 'c'], ['b', 'flag'], ['flag', 'd'],
    ['d', 'f'], ['flag', 'e'], ['c', 'e'], ['a', 'd'],
  ];

  const findNode = (id) => nodes.find((n) => n.id === id);

  return (
    <div className="relative">
      <svg viewBox="0 0 340 300" className="w-full max-w-md" aria-hidden="true">
        {edges.map(([from, to], i) => {
          const a = findNode(from);
          const b = findNode(to);
          return (
            <line
              key={i}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke="rgba(91, 141, 255, 0.25)"
              strokeWidth="1"
            />
          );
        })}

        {nodes.map((node) =>
          node.id === 'flag' ? (
            <g key={node.id}>
              <circle cx={node.x} cy={node.y} r="14" fill="rgba(220, 38, 38, 0.15)" className="animate-flash-alert" />
              <circle cx={node.x} cy={node.y} r="5.5" fill="#DC2626" className="animate-flash-alert" />
              <circle cx={node.x} cy={node.y} r="5.5" fill="#5B8DFF" className="animate-pulse-node [animation-delay:0.3s]" />
            </g>
          ) : (
            <circle
              key={node.id}
              cx={node.x}
              cy={node.y}
              r="4.5"
              fill="#5B8DFF"
              className={`animate-pulse-node [animation-delay:${(node.id.charCodeAt(0) % 5) * 0.35}s]`}
            />
          )
        )}
      </svg>

      <div
        className="animate-flash-alert absolute left-1/2 top-[46%] flex -translate-x-1/2 items-center gap-1.5
          rounded-lg border border-red-400/30 bg-navy-deep/90 px-2.5 py-1 text-xs font-medium text-red-300 shadow-lg"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
        Fraud pattern flagged
      </div>
    </div>
  );
}
