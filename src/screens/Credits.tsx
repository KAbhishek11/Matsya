import { BONUS, FISH, type Fish } from '../data/fish'
import { Chunky, FishImg, Panel } from '../ui/kit'

function PhotoList({ fish }: { fish: Fish[] }) {
  return (
    <ul>
      {fish.map((f) => (
        <li key={f.id}>
          <FishImg id={f.id} />
          <span>
            <b>{f.name}</b> — {f.credit.author}, <a href={f.credit.source} target="_blank" rel="noreferrer">{f.credit.license}</a>
            {f.credit.note && <><br /><i>{f.credit.note}</i></>}
          </span>
        </li>
      ))}
    </ul>
  )
}

export function Credits({ onBack }: { onBack: () => void }) {
  return (
    <div className="screen teal-world">
      <div className="column">
        <div className="topbar">
          <Chunky size="round" onClick={onBack} aria-label="Back">←</Chunky>
          <span className="outlined" style={{ fontSize: 30 }}>Credits</span>
        </div>
        <Panel className="credits">
          <h2>Fish photos</h2>
          <p>Real photographs, background removed for the game. Thank you to every photographer.</p>
          <PhotoList fish={FISH} />
          <h2 style={{ marginTop: 18 }}>Bonus fish photos</h2>
          <PhotoList fish={BONUS} />
          <h2 style={{ marginTop: 18 }}>Data &amp; map</h2>
          <p>
            State fish list: Wikipedia, “List of Indian state fishes” (CC BY-SA). States without an official fish, and union territories, are left out.
            India map: <a href="https://github.com/VictorCazanave/svg-maps" target="_blank" rel="noreferrer">@svg-maps/india</a> (CC BY 4.0); it predates the 2019 J&amp;K / Ladakh split.
          </p>
        </Panel>
      </div>
    </div>
  )
}
