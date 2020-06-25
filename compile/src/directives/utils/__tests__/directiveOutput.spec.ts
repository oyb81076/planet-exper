import { parseDirectiveOutput } from '../directiveOutput';

describe('parse', () => {
  it('empty#{}', () => {
    expect(
      parseDirectiveOutput('{}'),
    ).toEqual({});
  });
  it('space#{ user : $user }', () => {
    expect(
      parseDirectiveOutput('{user: $user}'),
    ).toEqual({ user: '$user' });
  });
  it('shorthand#{user}', () => {
    expect(
      parseDirectiveOutput('{user}'),
    ).toEqual({ user: '$user' });
  });
  it('identifier#$user', () => {
    expect(
      parseDirectiveOutput('$user'),
    ).toEqual('$user');
  });
});
