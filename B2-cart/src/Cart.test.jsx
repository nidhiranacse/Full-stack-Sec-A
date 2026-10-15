import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Cart from './Cart.jsx';

const products = [
  { id: 1, name: 'Keyboard', price: 120 },
  { id: 2, name: 'Mouse', price: 50 },
  { id: 3, name: 'Monitor', price: 1000 },
];

const click = (id) => fireEvent.click(screen.getByTestId(id));

describe('Cart', () => {
  it('starts empty', () => {
    render(<Cart products={products} />);
    expect(screen.getByTestId('cart-empty')).toHaveTextContent('Cart is empty');
    expect(screen.getByTestId('total')).toHaveTextContent('Total: 0.00');
    expect(screen.queryByTestId('discount')).toBeNull();
  });

  it('adds, increments, decrements and totals', () => {
    render(<Cart products={products} />);
    click('add-1');
    click('add-2');
    expect(screen.getByTestId('total')).toHaveTextContent('Total: 170.00');
    click('inc-1');
    expect(screen.getByTestId('qty-1')).toHaveTextContent('2');
    click('dec-1');
    expect(screen.getByTestId('qty-1')).toHaveTextContent('1');
  });

  it('adding the same product again increases quantity', () => {
    render(<Cart products={products} />);
    click('add-1');
    click('add-1');
    expect(screen.getByTestId('qty-1')).toHaveTextContent('2');
  });

  it('removes a line and shows empty message', () => {
    render(<Cart products={products} />);
    click('add-1');
    click('remove-1');
    expect(screen.getByTestId('cart-empty')).toBeInTheDocument();
  });

  it('applies discount at 1000', () => {
    render(<Cart products={products} />);
    click('add-3');
    expect(screen.getByTestId('total')).toHaveTextContent('Total: 1000.00');
    expect(screen.getByTestId('discount')).toHaveTextContent('Discount: 100.00');
    expect(screen.getByTestId('grand-total')).toHaveTextContent('Grand Total: 900.00');
  });
});
