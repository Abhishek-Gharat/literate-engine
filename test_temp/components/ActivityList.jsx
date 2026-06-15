import React from 'react'

export function ActivityList({ limit = 5 }) {
  const activities = [
    { id: 1, action: 'User login', time: '2 min ago' },
    { id: 2, action: 'New order', time: '5 min ago' },
    { id: 3, action: 'Profile updated', time: '10 min ago' },
    { id: 4, action: 'Settings changed', time: '15 min ago' },
    { id: 5, action: 'Export completed', time: '20 min ago' },
  ].slice(0, limit)

  return (
    <div className="activity-list">
      <h3>Recent Activity</h3>
      <ul>
        {activities.map(activity => (
          <li key={activity.id}>
            <span>{activity.action}</span>
            <span>{activity.time}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
