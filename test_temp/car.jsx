import React from 'react';
import { CarContext } from './context';

export default function Car() {
  const { car } = React.useContext(CarContext);

  return (
    <div>
      <h2>Car</h2>
      <p>Car name: {car.name}</p>
      <p>Car color: {car.color}</p>
    </div>
  );
}