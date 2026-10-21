import ProductCard from "@/components/product-card"
import { HttpTypes } from "@medusajs/types"
import { Link, useLoaderData } from "@tanstack/react-router"

const Search = () => {
  const { countryCode, query, page, products, count, next_page } = useLoaderData({
    from: "/$countryCode/search",
  })

  return (
    <div className="content-container pt-32 pb-12">
      <h1 className="text-4xl font-display font-semibold text-neutral-900 tracking-tight mb-8">
        {query ? `Search results for "${query}"` : "Search"}
      </h1>

      <form
        role="search"
        method="get"
        action={`/${countryCode}/search`}
        className="flex gap-2 mb-10 max-w-xl"
      >
        <label htmlFor="search-page-q" className="sr-only">
          Search products
        </label>
        <input
          id="search-page-q"
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search products"
          className="flex-1 border border-neutral-300 px-4 py-2.5 text-base text-neutral-900 outline-none focus:border-neutral-900"
        />
        <button
          type="submit"
          className="bg-neutral-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-neutral-700 transition-colors"
        >
          Search
        </button>
      </form>

      {query && (
        <p className="text-sm text-neutral-600 mb-6" data-testid="search-count">
          {count} {count === 1 ? "product" : "products"} found
        </p>
      )}

      {query && products.length === 0 ? (
        <p className="text-neutral-600" data-testid="search-no-results">
          No products found for &quot;{query}&quot;. Try a different term or{" "}
          <Link to="/$countryCode/store" params={{ countryCode }} className="underline">
            browse all products
          </Link>
          .
        </p>
      ) : (
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10" data-testid="search-results">
          {products.map((product: HttpTypes.StoreProduct) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}

      {(page > 1 || next_page) && (
        <nav aria-label="Search results pages" className="flex justify-between mt-12 text-sm">
          {page > 1 ? (
            <Link
              to="/$countryCode/search"
              params={{ countryCode }}
              search={{ q: query, page: page - 1 }}
              className="underline"
            >
              Previous page
            </Link>
          ) : (
            <span />
          )}
          {next_page && (
            <Link
              to="/$countryCode/search"
              params={{ countryCode }}
              search={{ q: query, page: next_page }}
              className="underline"
            >
              Next page
            </Link>
          )}
        </nav>
      )}
    </div>
  )
}

export default Search
