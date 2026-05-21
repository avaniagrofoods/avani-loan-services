import React from 'react';
import { Link } from 'react-router-dom';
import services from '../data/services.json';

export default function ServicesList() {
  return (
    <div className="container services-list">
      <h1>Our Loan Products</h1>
      <ul>
        {services.map((s) => (
          <li key={s.slug}>
            <Link to={`/services/${s.slug}`}>{s.h1}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
