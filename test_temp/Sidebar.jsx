import NavItem from './NavItem.jsx';

export default function Sidebar() {
  return (
    <aside>
      <h2>Sidebar</h2>
      <nav>
        <NavItem label="Home" />
        <NavItem label="Reports" />
        <NavItem label="Settings" />
      </nav>
    </aside>
  );
}