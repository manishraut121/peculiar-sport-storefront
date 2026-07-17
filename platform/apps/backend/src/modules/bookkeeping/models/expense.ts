import { model } from "@medusajs/framework/utils"

/**
 * Simple expense line for owner/employee bookkeeping.
 * Sales come from Medusa orders; expenses are entered here.
 * Export both via /admin/bookkeeping for CA / Tally / Zoho Books.
 */
const Expense = model.define("oc_expense", {
  id: model.id().primaryKey(),
  date: model.dateTime(),
  category: model.text(), // materials | rent | salary | logistics | marketing | tools | other
  description: model.text(),
  amount_inr: model.number(), // whole rupees (integer)
  payment_method: model.text().nullable(), // cash | upi | bank | card
  reference: model.text().nullable(), // invoice no / UTR
  notes: model.text().nullable(),
  created_by: model.text().nullable(),
})

export default Expense
