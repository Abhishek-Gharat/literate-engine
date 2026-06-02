export function Title() {
  return <h2>Header Title</h2>;
}

export function Subtitle() {
  return <p>Small subtitle text</p>;
}

export default function Header() {
  return (
    <header>
      <Title />
      <Subtitle />
    </header>
  );
}