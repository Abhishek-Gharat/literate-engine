// Tiny test component for e2e testing
import React from 'react';

export function Button({ onClick, children }) {
  return <button onClick={onClick}>{children}</button>;
}

export default function TestComponent() {
  return (
    <div>
      <h1>Test Component</h1>
      <Button onClick={() => console.log('clicked')}>Click me</Button>
    </div>
  );
}
