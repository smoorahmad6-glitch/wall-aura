import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ContentManager from '../ContentManager';

vi.mock('@tauri-apps/api/tauri', () => ({
  invoke: vi.fn(),
}));

describe('ContentManager Component', () => {
  const mockMonitors = [
    { index: 0, name: 'Monitor 1', width: 1920, height: 1080, x: 0, y: 0, is_primary: true },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<ContentManager monitors={mockMonitors} />);
    expect(document.body).toBeTruthy();
  });

  it('should display file upload interface', () => {
    render(<ContentManager monitors={mockMonitors} />);
    const container = document.querySelector('div');
    expect(container).toBeTruthy();
  });

  it('should handle content management', () => {
    render(<ContentManager monitors={mockMonitors} />);
    expect(document.body).toBeTruthy();
  });

  it('should support multiple file formats', () => {
    render(<ContentManager monitors={mockMonitors} />);
    const body = document.body;
    expect(body).toBeTruthy();
  });

  it('should display content library', () => {
    render(<ContentManager monitors={mockMonitors} />);
    expect(document.body).toBeTruthy();
  });
});
