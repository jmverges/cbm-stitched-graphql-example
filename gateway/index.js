// Stitches the orders API (and, in real life, several more backends) into one schema.
// Clients only ever talk to this endpoint, so they never name the backend that serves a field.
import { createServer } from 'node:http';
import { createYoga } from 'graphql-yoga';
import { stitchSchemas } from '@graphql-tools/stitch';
import { schemaFromExecutor } from '@graphql-tools/wrap';
import { buildHTTPExecutor } from '@graphql-tools/executor-http';

const ordersExecutor = buildHTTPExecutor({ endpoint: process.env.ORDERS_API_URL + '/graphql' });

const schema = stitchSchemas({
  subschemas: [{ schema: await schemaFromExecutor(ordersExecutor), executor: ordersExecutor }],
});

createServer(createYoga({ schema })).listen(4000);
