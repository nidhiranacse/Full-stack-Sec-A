import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Cart from './Cart';

describe('Shopping Cart with Discount (React)', () => {
  const mockProducts = [
    { id: 1, name: 'Headphones', price: 170.0 },
    { id: 2, name: 'Mechanical Keyboard', price: 300.0 },
    { id: 3, name: 'Monitor', price: 1000.0 },
  ];

  it('renders cart-empty with "Cart is empty" when the cart is initially empty', () => {
    render(<Cart products={mockProducts} />);
    const emptyElement = screen.getByTestId('cart-empty');
    expect(emptyElement).toBeInTheDocument();
    expect(emptyElement).toHaveTextContent('Cart is empty');
  });

  it('renders an add button add-{id} for each product in the list', () => {
    render(<Cart products={mockProducts} />);
    mockProducts.forEach((p) => {
      const addBtn = screen.getByTestId(`add-${p.id}`);
      expect(addBtn).toBeInTheDocument();
    });
  });

  it('adds product to cart, shows qty-{id}, inc-{id}, dec-{id}, remove-{id}, and total format', () => {
    render(<Cart products={mockProducts} />);

    // Click Add for product 1 (price 170)
    fireEvent.click(screen.getByTestId('add-1'));

    // cart-empty should disappear
    expect(screen.queryByTestId('cart-empty')).not.toBeInTheDocument();

    // Check cart line elements
    expect(screen.getByTestId('qty-1')).toHaveTextContent('1');
    expect(screen.getByTestId('inc-1')).toBeInTheDocument();
    expect(screen.getByTestId('dec-1')).toBeInTheDocument();
    expect(screen.getByTestId('remove-1')).toBeInTheDocument();

    // Check Total: 170.00
    const totalEl = screen.getByTestId('total');
    expect(totalEl).toHaveTextContent('Total: 170.00');

    // Below 1000 threshold: no discount or grand-total
    expect(screen.queryByTestId('discount')).not.toBeInTheDocument();
    expect(screen.queryByTestId('grand-total')).not.toBeInTheDocument();
  });

  it('increments quantity when inc-{id} is clicked', () => {
    render(<Cart products={mockProducts} />);
    fireEvent.click(screen.getByTestId('add-1'));

    fireEvent.click(screen.getByTestId('inc-1'));
    expect(screen.getByTestId('qty-1')).toHaveTextContent('2');
    expect(screen.getByTestId('total')).toHaveTextContent('Total: 340.00');
  });

  it('increments quantity when clicking add button again for existing item', () => {
    render(<Cart products={mockProducts} />);
    fireEvent.click(screen.getByTestId('add-1'));
    fireEvent.click(screen.getByTestId('add-1'));

    expect(screen.getByTestId('qty-1')).toHaveTextContent('2');
    expect(screen.getByTestId('total')).toHaveTextContent('Total: 340.00');
  });

  it('decrements quantity with dec-{id} and removes line when quantity drops to 0', () => {
    render(<Cart products={mockProducts} />);
    fireEvent.click(screen.getByTestId('add-1'));
    fireEvent.click(screen.getByTestId('inc-1')); // qty = 2

    fireEvent.click(screen.getByTestId('dec-1')); // qty = 1
    expect(screen.getByTestId('qty-1')).toHaveTextContent('1');
    expect(screen.getByTestId('total')).toHaveTextContent('Total: 170.00');

    fireEvent.click(screen.getByTestId('dec-1')); // qty = 0 -> removed
    expect(screen.queryByTestId('qty-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('cart-empty')).toHaveTextContent('Cart is empty');
  });

  it('removes cart line immediately when remove-{id} is clicked', () => {
    render(<Cart products={mockProducts} />);
    fireEvent.click(screen.getByTestId('add-1'));
    fireEvent.click(screen.getByTestId('inc-1')); // qty = 2

    fireEvent.click(screen.getByTestId('remove-1'));
    expect(screen.queryByTestId('qty-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('cart-empty')).toHaveTextContent('Cart is empty');
    expect(screen.getByTestId('total')).toHaveTextContent('Total: 0.00');
  });

  it('applies 10% discount when total reaches 1000.00 or more with exact format', () => {
    render(<Cart products={mockProducts} />);

    // Add monitor (price 1000)
    fireEvent.click(screen.getByTestId('add-3'));

    expect(screen.getByTestId('total')).toHaveTextContent('Total: 1000.00');

    // Discount elements must appear
    const discountEl = screen.getByTestId('discount');
    const grandTotalEl = screen.getByTestId('grand-total');

    expect(discountEl).toBeInTheDocument();
    expect(discountEl).toHaveTextContent('Discount: 100.00');

    expect(grandTotalEl).toBeInTheDocument();
    expect(grandTotalEl).toHaveTextContent('Grand Total: 900.00');
  });

  it('removes discount elements if cart total falls back below 1000.00', () => {
    render(<Cart products={mockProducts} />);

    // Add monitor (1000)
    fireEvent.click(screen.getByTestId('add-3'));
    expect(screen.getByTestId('discount')).toBeInTheDocument();

    // Remove monitor
    fireEvent.click(screen.getByTestId('remove-3'));
    expect(screen.queryByTestId('discount')).not.toBeInTheDocument();
    expect(screen.queryByTestId('grand-total')).not.toBeInTheDocument();
    expect(screen.getByTestId('cart-empty')).toHaveTextContent('Cart is empty');
  });
});
