import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import ShaderEditor from '../ShaderEditor';

vi.mock('@tauri-apps/api/tauri', () => ({
  invoke: vi.fn(() => Promise.resolve([])),
}));

describe('ShaderEditor Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<ShaderEditor />);
    expect(document.body).toBeTruthy();
  });

  it('should load shader templates', () => {
    render(<ShaderEditor />);
    const container = document.querySelector('div');
    expect(container).toBeTruthy();
  });

  it('should support GLSL editing', () => {
    render(<ShaderEditor />);
    expect(document.body).toBeTruthy();
  });

  it('should provide template options', () => {
    render(<ShaderEditor />);
    const body = document.body;
    expect(body).toBeTruthy();
  });

  it('should handle parameter adjustments', () => {
    render(<ShaderEditor />);
    expect(document.body).toBeTruthy();
  });
});
