module.exports = {
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
  tabWidth: 2,
  semi: true,
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  importOrder: [
    '^node:(.*)$',
    '<BUILTIN_MODULES>',
    '^@nestjs/(.*)$',
    '^[^.](.*)$',
    '^[./]'
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderParserPlugins: ['typescript', 'decorators-legacy']
};
