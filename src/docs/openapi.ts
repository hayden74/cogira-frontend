type DocFragment = {
  paths?: Record<string, unknown>;
  components?: {
    schemas?: Record<string, unknown>;
  };
};

const mergeDocs = (fragments: DocFragment[]) => {
  const paths = fragments.reduce<Record<string, unknown>>(
    (acc, fragment) => ({ ...acc, ...(fragment.paths ?? {}) }),
    {}
  );

  const schemas = fragments.reduce<Record<string, unknown>>(
    (acc, fragment) => ({
      ...acc,
      ...(fragment.components?.schemas ?? {}),
    }),
    {}
  );

  return { paths, schemas };
};

const merged = mergeDocs([]);

export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Cogira API',
    version: '1.0.0',
    description: 'OpenAPI specification generated from domain fragments.',
  },
  paths: merged.paths,
  components: {
    schemas: merged.schemas,
  },
};
