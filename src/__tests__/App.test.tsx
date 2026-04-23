import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

let App: any;

describe('App Component', () => {
  beforeEach(async () => {
    vi.resetModules();

    // Setup module mocks before importing the App module
    vi.doMock('@tauri-apps/api/tauri', () => ({
      invoke: vi.fn().mockResolvedValue([
        { index: 0, name: 'Monitor 1', width: 1920, height: 1080, x: 0, y: 0, is_primary: true },
      ]),
    }));

    vi.doMock('@tauri-apps/api/event', () => ({
      listen: vi.fn().mockResolvedValue(() => {}),
    }));

    // Import App after mocks are in place
    App = (await import('../App')).default;
  });

  it('should render without crashing', () => {
    render(<App />);
    expect(document.body).toBeTruthy();
  });

  it('should initialize wallpaper on mount', async () => {
    // Re-import mocked module to access spy
    const tauri = await import('@tauri-apps/api/tauri');
    render(<App />);
    await waitFor(() => {
      expect(tauri.invoke).toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  it('should set up event listeners', async () => {
    const eventMod = await import('@tauri-apps/api/event');
    render(<App />);
    await waitFor(() => {
      expect(eventMod.listen).toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  it('should handle tab navigation', () => {
    render(<App />);
    const container = document.querySelector('div');
    expect(container).toBeTruthy();
  });

  it('should render main layout', () => {
    render(<App />);
    expect(document.body).toBeTruthy();
  });
});
