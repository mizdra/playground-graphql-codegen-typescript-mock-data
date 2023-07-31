import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './schema.graphql',
  ignoreNoDocuments: true,
  generates: {
    '__generated__/graphql-codegen/types.ts': {
      plugins: ['typescript'],
      config: {
        nonOptionalTypename: true,
        enumsAsTypes: true,
      },
    },
    '__generated__/graphql-codegen/mocks.ts': {
      plugins: ['typescript-mock-data'],
      config: {
        typesFile: './types.ts',
        prefix: 'fake',
        dynamicValues: true,
        addTypename: true,
        terminateCircularRelationships: true,
        enumsAsTypes: true,
      },
    },
  },
};
// eslint-disable-next-line import/no-default-export
export default config;
