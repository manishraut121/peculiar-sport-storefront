import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useEffect, useState, type FormEvent } from "react"

/**
 * Admin UI: Bookkeeping — sales snapshot + expense entry for employees.
 * Route: /app/bookkeeping
 */
const CATEGORIES = [
  "materials",
  "rent",
  "salary",
  "logistics",
  "marketing",
  "tools",
  "other",
]

const BookkeepingPage = () => {
  const [summary, setSummary] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    category: "materials",
    description: "",
    amount_inr: "",
    payment_method: "upi",
    reference: "",
  })

  const load = async () => {
    setError(null)
    try {
      const res = await fetch("/admin/bookkeeping", { credentials: "include" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setSummary(await res.json())
    } catch (e: any) {
      setError(e.message || "Failed to load")
    }
  }

  useEffect(() => {
    load()
  }, [])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/admin/bookkeeping", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount_inr: Number(form.amount_inr),
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.message || `HTTP ${res.status}`)
      }
      setForm((f) => ({ ...f, description: "", amount_inr: "", reference: "" }))
      await load()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const inr = (n: number) =>
    `₹${Math.round(n || 0).toLocaleString("en-IN")}`

  return (
    <div className="flex flex-col gap-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Bookkeeping</h1>
          <p className="text-ui-fg-subtle text-sm mt-1">
            Sales from orders · expenses you record · CSV export for your CA
          </p>
        </div>
        <div className="flex gap-2">
          <a
            className="text-sm underline"
            href="/admin/bookkeeping/export?type=all"
          >
            Export CSV
          </a>
          <button
            type="button"
            className="text-sm underline"
            onClick={() => load()}
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card
            title="Gross sales"
            value={inr(summary.pl?.gross_sales_inr)}
            sub={`${summary.sales?.order_count || 0} orders`}
          />
          <Card
            title="Expenses"
            value={inr(summary.pl?.total_expenses_inr)}
            sub={`${summary.expenses?.count || 0} entries`}
          />
          <Card
            title="Net (sales − expenses)"
            value={inr(summary.pl?.net_inr)}
            sub="Not full COGS yet"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form
          onSubmit={submit}
          className="rounded-lg border border-ui-border-base p-4 flex flex-col gap-3"
        >
          <h2 className="font-medium">Add expense</h2>
          <label className="text-sm">
            Date
            <input
              type="date"
              className="mt-1 w-full border rounded px-2 py-1"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </label>
          <label className="text-sm">
            Category
            <select
              className="mt-1 w-full border rounded px-2 py-1"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Description
            <input
              className="mt-1 w-full border rounded px-2 py-1"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              required
              placeholder="Willow blanks — supplier invoice"
            />
          </label>
          <label className="text-sm">
            Amount (₹)
            <input
              type="number"
              min={1}
              step={1}
              className="mt-1 w-full border rounded px-2 py-1"
              value={form.amount_inr}
              onChange={(e) =>
                setForm({ ...form, amount_inr: e.target.value })
              }
              required
            />
          </label>
          <label className="text-sm">
            Payment method
            <select
              className="mt-1 w-full border rounded px-2 py-1"
              value={form.payment_method}
              onChange={(e) =>
                setForm({ ...form, payment_method: e.target.value })
              }
            >
              <option value="upi">UPI</option>
              <option value="bank">Bank transfer</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
            </select>
          </label>
          <label className="text-sm">
            Reference (invoice / UTR)
            <input
              className="mt-1 w-full border rounded px-2 py-1"
              value={form.reference}
              onChange={(e) => setForm({ ...form, reference: e.target.value })}
            />
          </label>
          <button
            type="submit"
            disabled={saving}
            className="bg-ui-button-inverted text-ui-fg-on-inverted rounded px-3 py-2 text-sm"
          >
            {saving ? "Saving…" : "Save expense"}
          </button>
        </form>

        <div className="rounded-lg border border-ui-border-base p-4">
          <h2 className="font-medium mb-3">Recent expenses</h2>
          <div className="overflow-auto max-h-96">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ui-fg-subtle border-b">
                  <th className="py-1">Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th className="text-right">₹</th>
                </tr>
              </thead>
              <tbody>
                {(summary?.expenses?.recent || []).map((e: any) => (
                  <tr key={e.id} className="border-b border-ui-border-base">
                    <td className="py-1 whitespace-nowrap">
                      {e.date
                        ? new Date(e.date).toLocaleDateString("en-IN")
                        : "—"}
                    </td>
                    <td>{e.category}</td>
                    <td className="max-w-[12rem] truncate">{e.description}</td>
                    <td className="text-right">
                      {Number(e.amount_inr).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
                {!summary?.expenses?.recent?.length && (
                  <tr>
                    <td colSpan={4} className="py-4 text-ui-fg-subtle">
                      No expenses yet — add the first one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

const Card = ({
  title,
  value,
  sub,
}: {
  title: string
  value: string
  sub: string
}) => (
  <div className="rounded-lg border border-ui-border-base p-4">
    <div className="text-xs uppercase tracking-wide text-ui-fg-subtle">
      {title}
    </div>
    <div className="text-2xl font-semibold mt-1">{value}</div>
    <div className="text-xs text-ui-fg-muted mt-1">{sub}</div>
  </div>
)

export const config = defineRouteConfig({
  label: "Bookkeeping",
})

export default BookkeepingPage
