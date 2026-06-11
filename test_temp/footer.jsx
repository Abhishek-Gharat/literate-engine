import Dashboard from './Dashboard.jsx';

export default function Footer() {
  return (
    <footer>
      <p>&copy; 2026 ReactViz Test. All rights reserved.</p>
      <Dashboard />
    </footer>
  );
}

export function FooterLink({ href, text }) {
  return <a href={href}>{text}</a>;
}

export function FooterNav() {
  return (
    <nav>
      <FooterLink href="/home" text="Home" />
      <FooterLink href="/about" text="About" />
      <FooterLink href="/contact" text="Contact" />
    </nav>
  );
}
