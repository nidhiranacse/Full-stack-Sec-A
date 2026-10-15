/**
 * Unit Test Suite for Practical B2: Shopping Cart with Discount (React)
 * Verifies all requirements and exact `data-testid` attributes specified in the lab manual.
 */
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Cart from './Cart';

describe('Practical B2: Cart Component', () => {
  const sampleProducts = [
    { id: 1, name: 'Product A', price: 100 },
    { id: 2, name: 'Product B', price: 70 },
  ];

  it('renders cart-empty with "Cart is empty" when initially loaded', () => {
    render(<Cart products={sampleProducts} />);
    const emptyMsg = screen.getByTestId('cart-empty');
    expect(emptyMsg).toBeDefined();
    expect(emptyMsg.textContent.trim()).toBe('Cart is empty');
  });

  it('renders an add button add-{id} for each product in the products list', () => {
    render(<Cart products={sampleProducts} />);
    expect(screen.getByTestId('add-1')).toBeDefined();
    expect(screen.getByTestId('add-2')).toBeDefined();
  });

  it('adds items to the cart and displays quantity, increment, decrement and remove buttons', () => {
    render(<Cart products={sampleProducts} />);

    // Add Product 1 (price 100) and Product 2 (price 70)
    fireEvent.click(screen.getByTestId('add-1'));
    fireEvent.click(screen.getByTestId('add-2'));

    // Cart is no longer empty
    expect(screen.queryByTestId('cart-empty')).toBeNull();

    // Line for Product 1
    expect(screen.getByTestId('qty-1').textContent.trim()).toBe('1');
    expect(screen.getByTestId('inc-1')).toBeDefined();
    expect(screen.getByTestId('dec-1')).toBeDefined();
    expect(screen.getByTestId('remove-1')).toBeDefined();

    // Line for Product 2
    expect(screen.getByTestId('qty-2').textContent.trim()).toBe('1');
    expect(screen.getByTestId('inc-2')).toBeDefined();
    expect(screen.getByTestId('dec-2')).toBeDefined();
    expect(screen.getByTestId('remove-2')).toBeDefined();
  });

  it('increments and decrements product quantity in cart', () => {
    render(<Cart products={sampleProducts} />);
    fireEvent.click(screen.getByTestId('add-1')); // qty 1

    fireEvent.click(screen.getByTestId('inc-1')); // qty 2
    expect(screen.getByTestId('qty-1').textContent.trim()).toBe('2');

    fireEvent.click(screen.getByTestId('dec-1')); // qty 1
    expect(screen.getByTestId('qty-1').textContent.trim()).toBe('1');
  });

  it('removes cart line when remove-{id} is clicked', () => {
    render(<Cart products={sampleProducts} />);
    fireEvent.click(screen.getByTestId('add-1'));
    expect(screen.getByTestId('qty-1')).toBeDefined();

    fireEvent.click(screen.getByTestId('remove-1'));
    expect(screen.queryByTestId('qty-1')).toBeNull();
    expect(screen.getByTestId('cart-empty').textContent.trim()).toBe('Cart is empty');
  });

  it('shows total in the form "Total: 170.00" and does NOT show discount when total is below threshold', () => {
    render(<Cart products={sampleProducts} />);
    // 1x Product 1 (100) + 1x Product 2 (70) = 170.00
    fireEvent.click(screen.getByTestId('add-1'));
    fireEvent.click(screen.getByTestId('add-2'));

    const totalEl = screen.getByTestId('total');
    expect(totalEl.textContent.trim()).toBe('Total: 170.00');

    // Discount and Grand Total must NOT be in the document
    expect(screen.queryByTestId('discount')).toBeNull();
    expect(screen.queryByTestId('grand-total')).toBeNull();
  });

  it('applies automatic 10% discount when total reaches 1000.00 (shows Discount: 100.00 and Grand Total: 900.00)', () => {
    render(<Cart products={sampleProducts} />);
    // Add Product 1 (price 100) 10 times = 1000.00
    for (let i = 0; i < 10; i++) {
      fireEvent.click(screen.getByTestId('add-1'));
    }

    const totalEl = screen.getByTestId('total');
    expect(totalEl.textContent.trim()).toBe('Total: 1000.00');

    const discountEl = screen.getByTestId('discount');
    expect(discountEl.textContent.trim()).toBe('Discount: 100.00');

    const grandTotalEl = screen.getByTestId('grand-total');
    expect(grandTotalEl.textContent.trim()).toBe('Grand Total: 900.00');
  });
});
