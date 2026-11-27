// The source artwork and publication notes are listed in docs/portfolio-collaborations.md.
const brands = [
  ["Amazon", "amazon", "amazon.png"],
  ["Australia Post", "auspost", "auspost.svg"],
  ["Blue Yonder", "blue", "blue.png"],
  ["ConvergentIS", "convergent", "convergent.png"],
  ["Farfetch", "farfetch", "farfetch.svg"],
  ["Zeelo", "zeelo", "zeelo.svg"],
] as const;

export function FolioCollaborations() {
  return (
    <section className="folio-collaborations" aria-labelledby="folio-collaborations-heading">
      <div className="folio-collaborations-inner">
        <div className="folio-collaborations-label">
          <h2 id="folio-collaborations-heading">Selected collaborations</h2>
        </div>
        <ul className="folio-collaborations-marks" role="list">
          {brands.map(([name, key, file]) => (
            <li key={key} data-brand={key}>
              {/* Fixed CSS bounds and original artwork; no remote image requests. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/brand/collaborations/${file}`} alt={name} decoding="async" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
