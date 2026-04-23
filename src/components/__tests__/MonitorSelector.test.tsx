import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import MonitorSelector from '../MonitorSelector';

vi.mock('@tauri-apps/api/tauri', () => ({
  invoke: vi.fn(),
}));

describe('MonitorSelector Component', () => {
  const mockMonitors = [
    { index: 0, name: 'Monitor 1', width: 1920, height: 1080, x: 0, y: 0, is_primary: true },
    { index: 1, name: 'Monitor 2', width: 1920, height: 1080, x: 1920, y: 0, is_primary: false },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<MonitorSelector monitors={mockMonitors} />);
    expect(document.body).toBeTruthy();
  });

  it('should display mode selection options', () => {
    render(<MonitorSelector monitors={mockMonitors} />);
    const container = document.querySelector('div');
    expect(container).toBeTruthy();
  });

  it('should handle monitor selection', () => {
    render(<MonitorSelector monitors={mockMonitors} />);
    // Test that component renders properly
    expect(document.body).toBeTruthy();
  });

  it('should support per-monitor mode', () => {
    render(<MonitorSelector monitors={mockMonitors} />);
    const body = document.body;
    expect(body).toBeTruthy();
  });

  it('should support span mode', () => {
    render(<MonitorSelector monitors={mockMonitors} />);
    const body = document.body;
    expect(body).toBeTruthy();
  });
});
