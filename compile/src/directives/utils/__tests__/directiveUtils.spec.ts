import { parseInputOutput, parseInputObjectExpression, parseOutput } from '../directiveUtils';

describe('parseInputOutput', () => {
  it('normal#{a:1}:{b:$item};true', () => {
    expect(
      parseInputOutput('{a:1}:{b:$item};true'),
    ).toEqual({
      input: '{a:1}',
      output: '{b:$item}',
      mock: 'true',
    });
  });
  it('loose#" {a:1} : {b: $item}  ;  true "', () => {
    expect(
      parseInputOutput(' {a:1} : {b: $item}  ;  true '),
    ).toEqual({
      input: '{a:1}',
      output: '{b: $item}',
      mock: 'true',
    });
  });
  it('throw#";true"', () => {
    expect(() => parseInputOutput(';true'))
      .toThrow('无法解析inputObject表达式;true');
  });
  it('inputIdentifer#$users:$out', () => {
    expect(
      parseInputOutput('$users:$out'),
    ).toEqual({
      input: '$users',
      output: '$out',
      mock: '',
    });
  });
  it('outputIdentifer#{a:1}:$out', () => {
    expect(
      parseInputOutput('{a:1}:$out'),
    ).toEqual({
      input: '{a:1}',
      output: '$out',
      mock: '',
    });
  });
});

describe('parseInputObjectExpression', () => {
  it('empty#{}', () => {
    expect(
      parseInputObjectExpression('{}'),
    ).toEqual({});
  });
  it('normal#{a:1}', () => {
    expect(
      parseInputObjectExpression('{a:1}'),
    ).toMatchObject({
      a: { type: 'Literal', value: 1 },
    });
  });
  it('binary#{a:$item+2}', () => {
    expect(
      parseInputObjectExpression('{a:$item+2}'),
    ).toMatchObject({
      a: {
        type: 'BinaryExpression',
        left: { type: 'Identifier', name: '$item' },
        operator: '+',
        right: { type: 'Literal', value: 2 },
      },
    });
  });
});
describe('parseOutput', () => {
  it('empty#{}', () => {
    expect(
      parseOutput('{}'),
    ).toEqual({});
  });
  it('space#{ user : $user }', () => {
    expect(
      parseOutput('{user: $user}'),
    ).toEqual({ user: '$user' });
  });
  it('shorthand#{user}', () => {
    expect(
      parseOutput('{user}'),
    ).toEqual({ user: '$user' });
  });
  it('identifier#$user', () => {
    expect(
      parseOutput('$user'),
    ).toEqual('$user');
  });
});
