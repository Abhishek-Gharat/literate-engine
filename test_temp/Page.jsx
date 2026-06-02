import Header, { Title, Subtitle } from './Header.jsx';

export default function Page() {
  return (
    <main>
      <Header />
      <section>
        <Title />
        <Subtitle />
      </section>
    </main>
  );
}