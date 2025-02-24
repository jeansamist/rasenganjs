import matter from 'gray-matter';
import createFilter from './create-filter.js';
import remarkGfm from 'remark-gfm';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypePrettyCode from 'rehype-pretty-code';

function extractTOC(markdown: string) {
  const lines = markdown.split('\n');
  const toc = [];

  lines.forEach((line: string) => {
    const h2Match = line.match(/^## (.+)/); // Titres H2
    const h3Match = line.match(/^### (.+)/); // Titres H3

    if (h2Match) {
      const title = h2Match[1].trim();
      const anchor = generateAnchor(title);
      toc.push({
        title,
        anchor,
        level: 2,
        children: [],
      });
    } else if (h3Match && toc.length > 0) {
      const title = h3Match[1].trim();
      const anchor = generateAnchor(title);
      toc[toc.length - 1].children.push({
        title,
        anchor,
        level: 3,
      });
    }
  });

  return toc;
}

const generateAnchor = (title: string) => {
  // Used the implementation inside the useMemo hooks in src/components/heading.tsx instead

  return `#${title}`;
};

/**
 * A Vite plugin that transforms MDX files into a format that can be used in a RasenganJs application.
 *
 * The plugin performs the following tasks:
 * - Resolves the Vite configuration and stores it for later use.
 * - Transforms MDX files by applying the `@mdx-js/rollup` transformation.
 * - Extracts frontmatter data from the MDX files and creates a `metadata` object.
 * - Appends the `metadata` object to the transformed MDX content.
 *
 * The transformed MDX content can then be used in the RasenganJs application, with the `metadata` object providing additional information about the content.
 */
export default async function plugin(): Promise<{
  name: string;
  enforce: string;
  config(config: unknown, env: any): void;
  configResolved(resolvedConfig: unknown): void;
  transform(
    code: string,
    id: string
  ): Promise<{
    code: string;
    map: any;
  }>;
}> {
  const mdx = (await import('@mdx-js/rollup')).default;

  let config: unknown;
  const filter = createFilter('**/*.md?(x)');
  const mdxInstance = mdx({
    remarkPlugins: [remarkParse, remarkGfm],
    rehypePlugins: [remarkRehype, rehypeStringify, rehypePrettyCode],
  });

  return {
    name: 'vite-plugin-rasengan-mdx',

    // Apply transformation of the mdx file before other plugins
    enforce: 'pre',

    config(config: unknown, env: any) {
      mdxInstance.config(config, env);
    },

    /**
     * Stores the resolved Vite configuration for later use.
     *
     * @param resolvedConfig - The resolved Vite configuration object.
     */
    configResolved(resolvedConfig: unknown) {
      // store the resolved config
      config = resolvedConfig;
    },

    /**
     * Transforms an MDX file by applying the `@mdx-js/rollup` transformation, extracting frontmatter data, and appending a `metadata` object to the transformed content.
     *
     * @param code - The content of the MDX file.
     * @param id - The ID of the MDX file.
     * @returns An object containing the transformed MDX code and a source map, or `null` if the file is not an MDX file.
     */
    async transform(code: string, id: string) {
      if (!filter(id)) {
        return null;
      }

      const { content, data: frontmatter } = matter(code);

      const toc = extractTOC(content);

      console.log({ toc });

      // Apply transformation of the mdx file
      const result = await mdxInstance.transform(content, id);

      // Extract the file name from the path
      const fileName = id
        .split('/')
        .pop()
        .replace(/.page.mdx?$/, '');

      // TODO: Consider other params of metadata from frontmatter
      const metadata = {
        path: frontmatter.path || `/${fileName}`,
        metadata: frontmatter.metadata || {
          title: fileName,
        },
      };

      // console.log(result.code)

      return {
        code: `
          ${result.code}
          const metadata = ${JSON.stringify(metadata)};
          
          MDXContent.metadata = metadata;
        `,
        map: result.map,
      };
    },
  };
}
