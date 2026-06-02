import StatsCard from './StatsCard.jsx';
import ActivityList from './ActivityList.jsx';

export default function Dashboard() {
  return (
    <main>
      <h2>Dashboard</h2>
      <StatsCard title="Users" value="128" />
      <StatsCard title="Revenue" value="$4500" />
      <ActivityList />
    </main>
  );
}