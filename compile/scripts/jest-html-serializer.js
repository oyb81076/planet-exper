module.exports = {
  serialize(val, config, indentation, depth, refs, printer) {
    return val;
  },

  test(val) {
    return typeof val === 'string' && val[0] === '<';
  },
};
