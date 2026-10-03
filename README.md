# Stitched GraphQL: an example for codebase-memory-mcp

Three tiny projects, meant to be indexed as **three separate projects**, showing a cross-repo
relationship that static extraction does not see today. Not runnable as is: only the files that
matter for the graph are here.

| Folder | Stack | Role |
|---|---|---|
| `api/` | Laravel + [Lighthouse](https://lighthouse-php.com) | GraphQL service. The schema maps fields to PHP with directives. |
| `gateway/` | GraphQL schema stitching | Single endpoint in front of the services; clients never name the service. |
| `web/` | Vue 3 + Apollo | Client: a `gql` query used by a component. |

## The relationship that should be connected

`web/src/graphql/recentOrders.js` (query `RecentOrders`, used by `OrderList.vue`) reads three fields
that are served by PHP methods whose names do not match the field names:

| Field read by the client | Schema line (`api/graphql/schema.graphql`) | PHP that serves it |
|---|---|---|
| `Order.total` | `total: Int! @rename(attribute: "total_cents")` | `Order::getTotalCentsAttribute()` (Eloquent accessor) |
| `Order.buyer` | `buyer: Customer! @belongsTo(relation: "customer")` | `Order::customer()` |
| `Customer.name` | `name: String! @rename(attribute: "display_name")` | `Customer::getDisplayNameAttribute()` |

An agent asked "who reads `Order.total`, and which PHP serves it?" needs both hops: client file ->
schema field -> PHP method, across two repos and through a gateway that hides which service answers.

## What codebase-memory-mcp 0.11.0 extracts today

Indexed each folder as its own project (`index_repository`, mode `full`), then ran
`cross-repo-intelligence` from `acme-web` with `target_projects: ["*"]`:

- `acme-api` (25 nodes, 27 edges): the schema becomes `Class`/`Field` nodes (`Order.total`,
  `Order.buyer`, `Customer.name`) and the PHP methods are there, but there is **no edge between a field
  and the method that serves it**, and no `Route`/`HANDLES`.
- `acme-web` (11 nodes, 10 edges): **no `GRAPHQL_CALLS` edge**. `GRAPHQL_CALLS` is only emitted on the
  parallel path (more than 50 files); padding this folder past that threshold gives the same result,
  because the emitter keys on a resolved callee whose qualified name contains a GraphQL library token,
  not on `gql` imported from `graphql-tag`.
- Cross-repo pass: `cross_graphql_calls: 0`, `total_cross_edges: 0`.

The route keys in `proposal/links.json` are ours (`__graphql__Type.field`); codebase-memory's own
GraphQL routes are `__graphql__<operation text>`, client side only.

## Reproduce

```sh
for p in api gateway web; do
  codebase-memory-mcp cli index_repository --repo-path "$PWD/$p" --name "acme-$p" --mode full
done
codebase-memory-mcp cli index_repository --repo-path "$PWD/web" --name acme-web \
  --mode cross-repo-intelligence --target-projects '*'
```

`proposal/links.json` sketches the declared-links file discussed upstream.
