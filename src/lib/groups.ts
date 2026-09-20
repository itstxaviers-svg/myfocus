import type { Child, Group, IncomeCurrency } from '../types';

export const childIncome = (child: Child) => child.payments.reduce((sum, payment) => sum + payment.amount, 0);
export const groupIncome = (group: Group) => group.children.reduce((sum, child) => sum + childIncome(child), 0);
export const totalIncome = (groups: Group[]) => groups.reduce((sum, group) => sum + groupIncome(group), 0);
export const paymentCount = (groups: Group[]) => groups.reduce((sum, group) => sum + group.children.reduce((childSum, child) => childSum + child.payments.length, 0), 0);
export const childCount = (groups: Group[]) => groups.reduce((sum, group) => sum + group.children.length, 0);
export const childPaymentsForMonth = (child: Child, monthKey: string, currency?:IncomeCurrency) => child.payments.filter(payment => payment.paidAt.startsWith(`${monthKey}-`)&&(!currency||payment.currency===currency));
export const childIncomeForMonth = (child: Child, monthKey: string, currency?:IncomeCurrency) => childPaymentsForMonth(child, monthKey, currency).reduce((sum, payment) => sum + payment.amount, 0);
export const groupIncomeForMonth = (group: Group, monthKey: string, currency?:IncomeCurrency) => group.children.reduce((sum, child) => sum + childIncomeForMonth(child, monthKey, currency), 0);
export const totalIncomeForMonth = (groups: Group[], monthKey: string, currency?:IncomeCurrency) => groups.reduce((sum, group) => sum + groupIncomeForMonth(group, monthKey, currency), 0);
export const paymentCountForMonth = (groups: Group[], monthKey: string, currency?:IncomeCurrency) => groups.reduce((sum, group) => sum + group.children.reduce((childSum, child) => childSum + childPaymentsForMonth(child, monthKey, currency).length, 0), 0);
export const formatMoney = (amount: number, currency: IncomeCurrency) => new Intl.NumberFormat(currency==='RUB'?'ru-RU':'en-US', {
  style:'currency',
  currency,
  currencyDisplay:'narrowSymbol',
  minimumFractionDigits:Number.isInteger(amount)?0:2,
  maximumFractionDigits:2
}).format(amount);
