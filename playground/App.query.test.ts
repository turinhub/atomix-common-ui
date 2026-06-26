import { describe, expect, it } from 'vitest';

import { createPlaygroundSearch, getPlaygroundStateFromSearch } from './App';

describe('playground query state', () => {
  it('parses valid query params and ignores invalid values', () => {
    const state = getPlaygroundStateFromSearch(
      '?page=pdf-reader&theme=dark&tableData=unknown&pdfTab=simple&pdfMode=single&pdfHotkeys=0&image=https%3A%2F%2Fexample.com%2Fcustom.png'
    );

    expect(state.page).toBe('pdf-reader');
    expect(state.theme).toBe('dark');
    expect(state.tableData).toBe('all');
    expect(state.pdfTab).toBe('simple');
    expect(state.pdfMode).toBe('single');
    expect(state.pdfHotkeys).toBe(false);
    expect(state.image).toBe('https://example.com/custom.png');
  });

  it('serializes non-default query params only', () => {
    const state = getPlaygroundStateFromSearch(
      '?page=media-reader&media=video&mediaToolbar=0&video=https%3A%2F%2Fexample.com%2Fclip.mp4'
    );

    expect(createPlaygroundSearch(state)).toBe(
      '?page=media-reader&media=video&video=https%3A%2F%2Fexample.com%2Fclip.mp4&mediaToolbar=0'
    );
  });
});
