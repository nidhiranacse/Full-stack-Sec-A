/**
 * Comprehensive Automated Tests for Problem 3: React Product Search with Cart
 * BTCS303T Full Stack | Coding Assessment
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import App from '../App';
import { CartProvider, cartReducer, CART_ACTIONS } from '../context/CartContext';

describe('Problem 3: React Product Search with Cart', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  // 1. Reducer unit tests
  describe('Cart Reducer Logic (useReducer)', () => {
    const mockProduct = { id: 1, name: 'MacBook Pro', price: 2000 };

    it('should add item with quantity 1 when ADD_ITEM dispatched', () => {
      const state = cartReducer([], { type: CART_ACTIONS.ADD_ITEM, payload: mockProduct });
      expect(state).toHaveLength(1);
      expect(state[0].quantity).toBe(1);
      expect(state[0].price).toBe(2000);
    });

    it('should increment existing item quantity on duplicate ADD_ITEM or INCREMENT_QTY', () => {
      const state1 = cartReducer([], { type: CART_ACTIONS.ADD_ITEM, payload: mockProduct });
      const state2 = cartReducer(state1, { type: CART_ACTIONS.ADD_ITEM, payload: mockProduct });
      expect(state2[0].quantity).toBe(2);

      const state3 = cartReducer(state2, { type: CART_ACTIONS.INCREMENT_QTY, payload: mockProduct.id });
      expect(state3[0].quantity).toBe(3);
    });

    it('Requirement: DECREMENT_QTY decrements, and quantity of 0 removes the item', () => {
      const state1 = [{ ...mockProduct, quantity: 2 }];
      const state2 = cartReducer(state1, { type: CART_ACTIONS.DECREMENT_QTY, payload: mockProduct.id });
      expect(state2[0].quantity).toBe(1);

      // Decrementing from 1 to 0 MUST remove the item
      const state3 = cartReducer(state2, { type: CART_ACTIONS.DECREMENT_QTY, payload: mockProduct.id });
      expect(state3).toHaveLength(0);
    });

    it('should remove item on REMOVE_ITEM', () => {
      const state = [{ ...mockProduct, quantity: 5 }];
      const nextState = cartReducer(state, { type: CART_ACTIONS.REMOVE_ITEM, payload: mockProduct.id });
      expect(nextState).toHaveLength(0);
    });
  });

  // 2. Integration Tests for App & Test Hooks
  describe('Component Rendering & Test Hooks', () => {
    it('should render all mandatory test hooks: search-input, cart-total', async () => {
      render(
        <CartProvider>
          <App />
        </CartProvider>
      );

      // Check search-input hook
      const searchInput = screen.getByTestId('search-input');
      expect(searchInput).toBeInTheDocument();

      // Check cart-total hook
      const cartTotal = screen.getByTestId('cart-total');
      expect(cartTotal).toBeInTheDocument();
      expect(cartTotal).toHaveTextContent('$0.00');

      // Wait for async fetch to resolve products
      await waitFor(() => {
        expect(screen.queryAllByTestId('product-item').length).toBeGreaterThan(0);
      }, { timeout: 2000 });

      // Check product-item and add-btn hooks
      const productItems = screen.getAllByTestId('product-item');
      expect(productItems.length).toBeGreaterThan(0);

      const addButtons = screen.getAllByTestId('add-btn');
      expect(addButtons.length).toBeGreaterThan(0);

      // Check next-btn hook
      const nextBtn = screen.getByTestId('next-btn');
      expect(nextBtn).toBeInTheDocument();
    });

    it('Requirement: Previous button is disabled on page 1', async () => {
      render(
        <CartProvider>
          <App />
        </CartProvider>
      );

      await waitFor(() => {
        expect(screen.queryAllByTestId('product-item').length).toBeGreaterThan(0);
      }, { timeout: 2000 });

      const prevBtn = screen.getByTestId('prev-btn');
      expect(prevBtn).toBeDisabled();
    });

    it('Requirement: Add to cart updates cart total and persists to localStorage', async () => {
      render(
        <CartProvider>
          <App />
        </CartProvider>
      );

      await waitFor(() => {
        expect(screen.queryAllByTestId('product-item').length).toBeGreaterThan(0);
      }, { timeout: 2000 });

      const firstAddBtn = screen.getAllByTestId('add-btn')[0];
      fireEvent.click(firstAddBtn);

      // Cart total should no longer be $0.00
      const cartTotal = screen.getByTestId('cart-total');
      expect(cartTotal).not.toHaveTextContent('$0.00');

      // Check localStorage persistence
      const savedStorage = localStorage.getItem('btcs303t_cart_state');
      expect(savedStorage).toBeTruthy();
      const parsed = JSON.parse(savedStorage);
      expect(parsed.length).toBe(1);
      expect(parsed[0].quantity).toBe(1);
    });

    it('Requirement: Empty results show "No results" message', async () => {
      render(
        <CartProvider>
          <App />
        </CartProvider>
      );

      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'nonexistentkeywordxyz123' } });

      // Wait for debounce (300ms) + fetch delay
      await waitFor(() => {
        expect(screen.getByText(/No results/i)).toBeInTheDocument();
      }, { timeout: 2500 });
    });
  });
});
