import type { Request } from 'express'
import { env } from '../config/env.js'

export type Paginated<T> = {
  data: T[]
  links: { first: string | null; last: string | null; prev: string | null; next: string | null }
  meta: {
    current_page: number
    from: number | null
    last_page: number
    links: { url: string | null; label: string; page: number | null; active: boolean }[]
    path: string
    per_page: number
    to: number | null
    total: number
  }
}

export function currentPage(req: Request): number {
  const page = Number(req.query.page)
  return Number.isInteger(page) && page >= 1 ? page : 1
}

/** Builds Laravel's LengthAwarePaginator JSON shape. */
export async function paginate<Row, Out>(
  req: Request,
  perPage: number,
  query: {
    count: () => Promise<number>
    rows: (args: { skip: number; take: number }) => Promise<Row[]>
  },
  map: (row: Row) => Out,
): Promise<Paginated<Out>> {
  const page = currentPage(req)
  const [total, rows] = await Promise.all([query.count(), query.rows({ skip: (page - 1) * perPage, take: perPage })])
  const lastPage = Math.max(1, Math.ceil(total / perPage))
  const path = `${env().APP_URL}${req.baseUrl}${req.path}`.replace(/\/$/, '')

  const pageUrl = (target: number) => {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(req.query)) {
      if (key !== 'page' && typeof value === 'string') params.set(key, value)
    }
    params.set('page', String(target))
    return `${path}?${params.toString()}`
  }

  const from = rows.length > 0 ? (page - 1) * perPage + 1 : null
  const to = from === null ? null : from + rows.length - 1

  const links: Paginated<Out>['meta']['links'] = [{ url: page > 1 ? pageUrl(page - 1) : null, label: '&laquo; Previous', page: page > 1 ? page - 1 : null, active: false }]
  for (let i = 1; i <= lastPage; i++) links.push({ url: pageUrl(i), label: String(i), page: i, active: i === page })
  links.push({ url: page < lastPage ? pageUrl(page + 1) : null, label: 'Next &raquo;', page: page < lastPage ? page + 1 : null, active: false })

  return {
    data: rows.map(map),
    links: {
      first: pageUrl(1),
      last: pageUrl(lastPage),
      prev: page > 1 ? pageUrl(page - 1) : null,
      next: page < lastPage ? pageUrl(page + 1) : null,
    },
    meta: { current_page: page, from, last_page: lastPage, links, path, per_page: perPage, to, total },
  }
}
