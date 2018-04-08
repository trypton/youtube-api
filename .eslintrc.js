module.exports = {
    extends: [ 'last' ],
    rules: {
        'prettier/prettier': [
            'error',
            {
                singleQuote: true,
                tabWidth: 4,
                printWidth: 120
            }
        ]
    },
    env: {
        browser: true,
        es6: true
    }
};
