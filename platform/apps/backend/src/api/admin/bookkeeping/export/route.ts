import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { BOOKKEEPING_MODULE } from "../../../../modules/bookkeeping"
import { isFeatureEnabled } from "../../../../utils/flags"

/**
 * GET /admin/bookkeeping/export?type=sales|expenses|all
 * CSV for CA / Tally import / Google Sheets.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  if (!isFeatureEnabled("bookkeeping")) {
    return res.status(404).json({ message: "Bookkeeping disabled" })
  }

  const type = String(req.query.type || "all")
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const bookkeeping = req.scope.resolve(BOOKKEEPING_MODULE) as any

  const lines: string[] = []
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v)
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
    return s
  }

  if (type === "sales" || type === "all") {
    lines.push("type,date,id,display_id,email,total_inr,status")
    try {
      const { data: orders } = await query.graph({
        entity: "order",
        fields: [
          "id",
          "display_id",
          "email",
          "total",
          "created_at",
          "status",
        ],
        pagination: { take: 5000, skip: 0 },
      })
      for (const o of orders || []) {
        lines.push(
          [
            "sale",
            o.created_at,
            o.id,
            o.display_id,
            o.email,
            Math.round(Number(o.total) || 0),
            o.status,
          ]
            .map(esc)
            .join(",")
        )
      }
    } catch {
      /* empty */
    }
  }

  if (type === "expenses" || type === "all") {
    if (type === "all") lines.push("") // spacer
    if (type === "expenses") {
      lines.push(
        "type,date,category,description,amount_inr,payment_method,reference,created_by"
      )
    } else {
      lines.push(
        "type,date,category,description,amount_inr,payment_method,reference,created_by"
      )
    }
    try {
      const expenses = await bookkeeping.listExpenses({}, { take: 5000 })
      for (const e of expenses || []) {
        lines.push(
          [
            "expense",
            e.date,
            e.category,
            e.description,
            e.amount_inr,
            e.payment_method,
            e.reference,
            e.created_by,
          ]
            .map(esc)
            .join(",")
        )
      }
    } catch {
      /* empty */
    }
  }

  const csv = lines.join("\n")
  res.setHeader("Content-Type", "text/csv; charset=utf-8")
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="onecurve-bookkeeping-${type}.csv"`
  )
  res.send(csv)
}
