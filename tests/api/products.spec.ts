import { test, expect } from '../../src/fixtures';
import { ApiClient } from '../../src/api/ApiClient';
import { ErrorSchema, ProductListSchema, ProductSchema } from '../../src/api/schemas';
import { buildProduct } from '../../src/data/factories';

test.describe('Products API', () => {
  test('list returns products matching the contract @smoke', async ({ api }) => {
    const res = await api.get('/products', { limit: 5 });

    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('application/json');
    const body = await ApiClient.parse(res, ProductListSchema);
    expect(body.products).toHaveLength(5);
  });

  test('pagination returns the requested page without overlap', async ({ api }) => {
    const page1 = await ApiClient.parse(await api.get('/products', { limit: 3, skip: 0 }), ProductListSchema);
    const page2 = await ApiClient.parse(await api.get('/products', { limit: 3, skip: 3 }), ProductListSchema);

    expect(page2.skip).toBe(3);
    const ids1 = page1.products.map((p) => p.id);
    const ids2 = page2.products.map((p) => p.id);
    expect(ids1.filter((id) => ids2.includes(id))).toEqual([]);
  });

  test('get by id returns that product', async ({ api }) => {
    const res = await api.get('/products/1');

    expect(res.status()).toBe(200);
    const product = await ApiClient.parse(res, ProductSchema);
    expect(product.id).toBe(1);
  });

  test('unknown id returns 404 with an error message', async ({ api }) => {
    const res = await api.get('/products/999999');

    expect(res.status()).toBe(404);
    const err = await ApiClient.parse(res, ErrorSchema);
    expect(err.message).toContain('not found');
  });

  test('create echoes the submitted fields', async ({ authedApi }) => {
    const input = buildProduct({ price: 12.5 });

    const res = await authedApi.post('/products/add', input);

    expect([200, 201]).toContain(res.status());
    const created = await res.json();
    expect(created).toMatchObject({ title: input.title, price: input.price });
    expect(created.id).toEqual(expect.any(Number));
  });
});
