module.exports = {
  extends: [
    './base'
  ],
  rules: {
    indent: [
      'error', 2,
      {
        SwitchCase: 1,
        FunctionExpression: {
          parameters: 'first'
        }
      }
    ],
    'prefer-destructuring': ['error', {
      VariableDeclarator: {
        array: false,
        object: false
      },
      AssignmentExpression: {
        array: false,
        object: false
      }
    }]
  }
};
