import parseRecordExpr from '../parseRecordExpr';

describe('parseInputObjectExpression', () => {
  it('empty#{}', () => {
    expect(
      parseRecordExpr('{}'),
    ).toEqual({});
  });
  it('normal#{a:1}', () => {
    expect(
      parseRecordExpr('{a:1}'),
    ).toMatchObject({
      a: { type: 'Literal', value: 1 },
    });
  });
  it('binary#{a:$item+2}', () => {
    expect(
      parseRecordExpr('{a:$item+2}'),
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
