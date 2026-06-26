import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import App from './App';

beforeEach(() => {
  window.history.replaceState(null, '', '/');
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

describe('playground switch controls', () => {
  it('renders labelled switch controls and toggles settings', async () => {
    const user = userEvent.setup();

    render(<App />);

    const headerSwitch = screen.getByRole('switch', { name: '头部区域' });
    expect(headerSwitch).toHaveAttribute('aria-checked', 'true');

    await user.click(headerSwitch);

    expect(headerSwitch).toHaveAttribute('aria-checked', 'false');
  });
});
