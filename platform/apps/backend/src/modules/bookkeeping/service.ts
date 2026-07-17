import { MedusaService } from "@medusajs/framework/utils"
import Expense from "./models/expense"

class BookkeepingModuleService extends MedusaService({
  Expense,
}) {}

export default BookkeepingModuleService
