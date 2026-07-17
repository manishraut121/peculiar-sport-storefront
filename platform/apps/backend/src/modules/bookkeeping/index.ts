import BookkeepingModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const BOOKKEEPING_MODULE = "bookkeeping"

export default Module(BOOKKEEPING_MODULE, {
  service: BookkeepingModuleService,
})
