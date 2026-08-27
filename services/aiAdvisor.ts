import { storage } from './storage';
import { CompanyInfo } from './storage';
import { InventoryItem, SaleReceipt, DailyExpense } from '../types';

export function generateAdvisorResponse(
  userQuery: string,
  selectedDate: string,
  company: CompanyInfo
): string {
  const q = userQuery.toLowerCase().trim();
  const currency = company.currency || '$';
  const sales = storage.getSales();
  const expenses = storage.getExpenses();
  const inventory = storage.getInventory();
  const depletionAnalysis = storage.getStockDepletionAnalysis();
  const todaySummary = storage.getDailySummary(selectedDate);

  // 1. Stock / Inventory / Depletion Inquiries
  if (q.includes('stock') || q.includes('deplet') || q.includes('critical') || q.includes('low') || q.includes('run out') || q.includes('burn rate') || q.includes('reorder')) {
    const criticalItems = depletionAnalysis.filter(d => d.status === 'critical' || d.status === 'low');
    if (criticalItems.length === 0) {
      return `✅ **Stock Status: Optimal**\n\nAll ${inventory.length} catalog items are above their safety reorder thresholds. Total stock valuation in inventory is **${currency}${depletionAnalysis.reduce((sum, i) => sum + i.stockValuation, 0).toFixed(2)}**.\n\n*Fastest moving item today:* **${depletionAnalysis[0]?.item.name}** (${depletionAnalysis[0]?.depletionRate} units/day).`;
    }

    const itemLines = criticalItems.map((c, i) => {
      return `${i + 1}. **${c.item.name}**\n   - Current Stock: **${c.item.currentStock} ${c.item.unit}** (Min Threshold: ${c.item.minThreshold})\n   - Burn Rate: **${c.depletionRate} ${c.item.unit}/day**\n   - Estimated Stock Runout: **${c.daysOfStockLeft <= 0 ? 'OUT OF STOCK' : `${c.daysOfStockLeft} day(s)`}**\n   - Suggested Reorder Quantity: **${Math.max(c.item.minThreshold * 2, 20)} ${c.item.unit}** (Est. Cost: ${currency}${(Math.max(c.item.minThreshold * 2, 20) * c.item.unitCost).toFixed(2)})`;
    }).join('\n\n');

    return `⚠️ **Critical Stock & Depletion Velocity Report:**\n\nWe currently have **${criticalItems.length} item(s)** requiring urgent replenishment:\n\n${itemLines}\n\n💡 *Action Plan:* Place replenishment orders for top 2 urgent items before tomorrow morning production run.`;
  }

  // 2. Profit / Revenue / Financial Summary Inquiries
  if (q.includes('profit') || q.includes('revenue') || q.includes('financial') || q.includes('margin') || q.includes('today') || q.includes('sales') || q.includes('money')) {
    const marginPercent = todaySummary.totalRevenue > 0 ? ((todaySummary.netProfit / todaySummary.totalRevenue) * 100).toFixed(1) : '0';
    const expenseRatio = todaySummary.totalRevenue > 0 ? ((todaySummary.totalExpenses / todaySummary.totalRevenue) * 100).toFixed(1) : '0';

    return `📈 **Financial Performance Summary for ${selectedDate}:**\n\n- **Total Revenue:** ${currency}${todaySummary.totalRevenue.toFixed(2)} (${todaySummary.totalTransactions} transactions)\n- **Cost of Goods Sold (COGS):** ${currency}${todaySummary.totalCostOfGoods.toFixed(2)}\n- **Operating Expenses:** ${currency}${todaySummary.totalExpenses.toFixed(2)}\n- **Gross Profit:** ${currency}${todaySummary.grossProfit.toFixed(2)}\n- **Net Profit:** ${currency}${todaySummary.netProfit.toFixed(2)} (**${marginPercent}% net margin**)\n- **Closing Cash in Drawer:** ${currency}${todaySummary.closingCashInDrawer.toFixed(2)}\n\n📊 *Expense-to-Revenue Ratio:* **${expenseRatio}%** (${Number(expenseRatio) < 35 ? 'Healthy operational efficiency' : 'High operating costs relative to daily intake'}).`;
  }

  // 3. Custom Quotation / Print Job Cost Estimator
  if (q.includes('quote') || q.includes('price') || q.includes('cost') || q.includes('calculate') || q.includes('shirt') || q.includes('flyer') || q.includes('book') || q.includes('banner')) {
    // Check if user specified a quantity (e.g. 50, 100, 200)
    const qtyMatch = q.match(/\b(\d+)\b/);
    const quantity = qtyMatch ? parseInt(qtyMatch[1], 10) : 50;

    let baseBlankCost = 3.50; // default t-shirt
    let printCost = 5.00;
    let sellingUnit = 14.00;
    let itemLabel = 'Custom DTF Printed T-Shirts';

    if (q.includes('flyer') || q.includes('paper')) {
      baseBlankCost = 0.08;
      printCost = 0.12;
      sellingUnit = 0.45;
      itemLabel = 'A4 Double-Sided Full Color Flyers (130gsm)';
    } else if (q.includes('book') || q.includes('binding')) {
      baseBlankCost = 4.50;
      printCost = 5.00;
      sellingUnit = 18.00;
      itemLabel = 'Hardcover Book / Thesis Gold-Foil Binding';
    } else if (q.includes('banner') || q.includes('stand')) {
      baseBlankCost = 28.00;
      printCost = 15.00;
      sellingUnit = 65.00;
      itemLabel = 'Roll-Up Banner Stand (85x200cm Full Vinyl)';
    } else if (q.includes('mug')) {
      baseBlankCost = 2.50;
      printCost = 1.50;
      sellingUnit = 7.50;
      itemLabel = 'Sublimation Ceramic Branded Mugs';
    }

    const totalRawCost = (baseBlankCost + printCost) * quantity;
    const totalQuotePrice = sellingUnit * quantity;
    const estimatedProfit = totalQuotePrice - totalRawCost;
    const profitMargin = ((estimatedProfit / totalQuotePrice) * 100).toFixed(1);

    return `🖨️ **Print Job Quote & Margin Breakdown:**\n\n**Job:** ${itemLabel}\n**Quantity:** ${quantity} units\n\n- **Unit Selling Price:** ${currency}${sellingUnit.toFixed(2)}\n- **Total Customer Price:** **${currency}${totalQuotePrice.toFixed(2)}**\n- **Estimated Material & Print Cost:** ${currency}${totalRawCost.toFixed(2)} (${currency}${(baseBlankCost + printCost).toFixed(2)}/unit)\n- **Projected Net Margin:** **${currency}${estimatedProfit.toFixed(2)} (${profitMargin}%)**\n\n💡 *Pricing Tip:* For bulk quantities over 100 units, offering a 5% discount (${currency}${(totalQuotePrice * 0.95).toFixed(2)}) maintains a healthy **${(((totalQuotePrice * 0.95 - totalRawCost) / (totalQuotePrice * 0.95)) * 100).toFixed(1)}% margin** while winning customer loyalty.`;
  }

  // 4. Category & Product Performance
  if (q.includes('category') || q.includes('best') || q.includes('popular') || q.includes('product') || q.includes('top')) {
    const catMap: Record<string, { rev: number; count: number }> = {};
    sales.forEach(s => {
      s.items.forEach(i => {
        if (!catMap[i.category]) catMap[i.category] = { rev: 0, count: 0 };
        catMap[i.category].rev += i.totalPrice;
        catMap[i.category].count += i.quantity;
      });
    });

    const sortedCats = Object.entries(catMap).sort((a, b) => b[1].rev - a[1].rev);
    const catList = sortedCats.map(([cat, data], idx) => `${idx + 1}. **${cat}**: ${currency}${data.rev.toFixed(2)} (${data.count} items sold)`).join('\n');

    return `🏆 **Category Sales Rankings:**\n\n${catList}\n\n💡 **Insight:** Apparel and Book Printing drive the highest gross ticket values. Consider bundle packages (e.g., Flyers + Business Cards) to increase paper printing basket sizes.`;
  }

  // Default Smart Assistant Response
  return `🤖 **PrintTrack Workshop Copilot Analysis:**\n\nHere is your real-time status as of today:\n- **Today's Gross Sales:** ${currency}${todaySummary.totalRevenue.toFixed(2)} (${todaySummary.totalTransactions} receipts issued)\n- **Net Profit:** ${currency}${todaySummary.netProfit.toFixed(2)}\n- **Inventory Items Monitored:** ${inventory.length} SKUs (${depletionAnalysis.filter(i => i.status === 'critical' || i.status === 'low').length} low stock alerts)\n\nTry asking me:\n- *"Which stock is running out the fastest?"*\n- *"What is our net profit and expense ratio today?"*\n- *"Calculate quote for 100 t-shirts"* or *"Calculate quote for 250 flyers"*\n- *"What are our top revenue categories?"*`;
}
