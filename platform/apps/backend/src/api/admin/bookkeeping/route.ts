import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { BOOKKEEPING_MODULE } from "../../../modules/bookkeeping"
import { isFeatureEnabled } from "../../../utils/flags"

/**
 * GET  /admin/bookkeeping  — P&L summary + recent expenses
 * POST /admin/bookkeeping  — create expense { date, category, description, amount_inr, ... }
 *
 * Employee-ready: any admin-authenticated user can record costs and see sales.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  if (!isFeatureEnabled("bookkeeping")) {
    return res.status(404).json({ message: "Bookkeeping disabled by feature flag" })
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const bookkeeping = req.scope.resolve(BOOKKEEPING_MODULE) as any

  const from = (req.query.from as string) || null
  const to = (req.query.to as string) || null

  let orders: any[] = []
  try {
    const r = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "total",
        "currency_code",
        "created_at",
        "status",
        "email",
      ],
      pagination: { take: 2000, skip: 0 },
    })
    orders = r.data || []
  } catch {
    orders = []
  }

  const inRange = (iso: string) => {
    if (!iso) return true
    const t = new Date(iso).getTime()
    if (from && t < new Date(from).getTime()) return false
    if (to && t > new Date(to).getTime()) return false
    return true
  }

  const salesOrders = orders.filter((o) => inRange(o.created_at))
  const revenue_inr = salesOrders.reduce(
    (s, o) => s + (Number(o.total) || 0),
    0
  )

  let expenses: any[] = []
  try {
    const list = await bookkeeping.listExpenses({}, { take: 500 })
    expenses = (list || []).filter((e: any) => {
      const d = e.date ? new Date(e.date).toISOString() : ""
      return inRange(d)
    })
  } catch {
    expenses = []
  }

  const expense_total_inr = expenses.reduce(
    (s: number, e: any) => s + (Number(e.amount_inr) || 0),
    0
  )

  const byCategory: Record<string, number> = {}
  for (const e of expenses) {
    const c = e.category || "other"
    byCategory[c] = (byCategory[c] || 0) + (Number(e.amount_inr) || 0)
  }

  res.json({
    period: { from, to },
    sales: {
      order_count: salesOrders.length,
      revenue_inr: Math.round(revenue_inr),
      currency: "INR",
    },
    expenses: {
      count: expenses.length,
      total_inr: Math.round(expense_total_inr),
      by_category: byCategory,
      recent: expenses
        .slice()
        .sort(
          (a: any, b: any) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        .slice(0, 50),
    },
    pl: {
      gross_sales_inr: Math.round(revenue_inr),
      total_expenses_inr: Math.round(expense_total_inr),
      net_inr: Math.round(revenue_inr - expense_total_inr),
      note: "Net = order totals − recorded expenses. COGS/stock valuation is a later phase.",
    },
  })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  if (!isFeatureEnabled("bookkeeping")) {
    return res.status(404).json({ message: "Bookkeeping disabled by feature flag" })
  }

  const body = (req.body || {}) as Record<string, unknown>
  const amount = Number(body.amount_inr)
  if (!body.category || !body.description || !Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({
      message: "Required: category, description, amount_inr (>0 integer rupees)",
    })
  }

  const bookkeeping = req.scope.resolve(BOOKKEEPING_MODULE) as any
  const expense = await bookkeeping.createExpenses({
    date: body.date ? new Date(String(body.date)) : new Date(),
    category: String(body.category),
    description: String(body.description),
    amount_inr: Math.round(amount),
    payment_method: body.payment_method ? String(body.payment_method) : null,
    reference: body.reference ? String(body.reference) : null,
    notes: body.notes ? String(body.notes) : null,
    created_by: body.created_by ? String(body.created_by) : "admin",
  })

  res.status(201).json({ expense })
}
