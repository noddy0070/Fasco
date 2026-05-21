import { LeadingZeroPipe } from './leading-zero-pipe';

describe('LeadingZeroPipe', () => {
  let pipe: LeadingZeroPipe;

  beforeEach(() => {
    pipe = new LeadingZeroPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return "00" for null-like values', () => {
    expect(pipe.transform(null as unknown as number)).toBe('00');
  });

  it('should pad single-digit numbers with a leading zero', () => {
    expect(pipe.transform(0)).toBe('00');
    expect(pipe.transform(1)).toBe('01');
    expect(pipe.transform(9)).toBe('09');
  });

  it('should not pad numbers >= 10', () => {
    expect(pipe.transform(10)).toBe('10');
    expect(pipe.transform(59)).toBe('59');
    expect(pipe.transform(100)).toBe('100');
  });
});
