import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { makeStore } from '../store';

export function renderWithProviders(ui, { preloadedState, route = '/' } = {}) {
  const store = makeStore(preloadedState);
  return { store, ...render(<Provider store={store}><MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter></Provider>) };
}
