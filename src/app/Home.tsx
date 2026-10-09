import { Link } from "react-router";
import { gallery } from "../shaders/registry";

/** Placeholder list until the M4 gallery grid. */
export default function Home() {
  if (gallery.length === 0) return <p>The first shaders are still growing.</p>;
  return (
    <ul>
      {gallery.map(({ meta }) => (
        <li key={meta.name}>
          <Link to={`/s/${meta.name}`}>{meta.title}</Link>
        </li>
      ))}
    </ul>
  );
}
