import parseDirectiveStructure from '../directiveStructure';

describe('parse', () => {
  it('normal#{a:1}::{b:$item};true', () => {
    expect(
      parseDirectiveStructure('{a:1}::{b:$item};true'),
    ).toEqual({
      input: '{a:1}',
      output: '{b:$item}',
      mock: 'true',
    });
  });
  it('string', () => {
    expect(parseDirectiveStructure("'a;b::c'==0::{};10")).toEqual({
      input: "'a;b::c'==0",
      output: '',
      mock: '10',
    });
  });
  it('loose#" {a:1} :: {b: $item}  ;  true "', () => {
    expect(
      parseDirectiveStructure(' {a:1} :: {b: $item}  ;  true '),
    ).toEqual({
      input: '{a:1}',
      output: '{b: $item}',
      mock: 'true',
    });
  });
  it(';true', () => {
    expect(parseDirectiveStructure(';true')).toEqual({
      input: '',
      output: '',
      mock: 'true',
    });
  });
  it('1==1;0', () => {
    expect(parseDirectiveStructure('1==1;0'))
      .toEqual({
        input: '1==1',
        output: '',
        mock: '0',
      });
  });
  it('inputIdentifer#$users::$out', () => {
    expect(
      parseDirectiveStructure('$users::$out'),
    ).toEqual({
      input: '$users',
      output: '$out',
      mock: '',
    });
  });
  it('outputIdentifer#{a:1}::$out', () => {
    expect(
      parseDirectiveStructure('{a:1}::$out'),
    ).toEqual({
      input: '{a:1}',
      output: '$out',
      mock: '',
    });
  });
});
