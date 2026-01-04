// ============================================
// Owner Financial Intelligence - Profit Calculations
// File: frontend/src/utils/profitCalculator.js
// ============================================

import { supabase } from '../config/supabase';

/**
 * Calculate Net Profit for Owner Dashboard
 * Formula: Net Profit = Revenue (Tussle Sales) - COGS (Materials + Labor) - OpEx (Salaries)
 * 
 * @param {Object} options - Filter options
 * @param {Date} options.startDate - Start date for filtering
 * @param {Date} options.endDate - End date for filtering
 * @param {string} options.period - 'weekly', 'monthly', 'yearly'
 * @returns {Promise<Object>} Financial summary
 */
export async function calculateNetProfit(options = {}) {
  const { startDate, endDate, period = 'monthly' } = options;

  try {
    // 1. Fetch completed tussles (Revenue & COGS)
    let tussleQuery = supabase
      .from('tussles')
      .select('*')
      .eq('status', 'completed')
      .not('completed_at', 'is', null);

    if (startDate) {
      tussleQuery = tussleQuery.gte('completed_at', startDate.toISOString());
    }
    if (endDate) {
      tussleQuery = tussleQuery.lte('completed_at', endDate.toISOString());
    }

    const { data: tussles, error: tussleError } = await tussleQuery;
    if (tussleError) throw tussleError;

    // Calculate Revenue and COGS
    const revenue = tussles.reduce((sum, t) => sum + (parseFloat(t.sell_price) || 0), 0);
    const materialCost = tussles.reduce((sum, t) => sum + (parseFloat(t.material_cost) || 0), 0);
    const laborCost = tussles.reduce((sum, t) => sum + (parseFloat(t.labor_cost) || 0), 0);
    const cogs = materialCost + laborCost;
    const grossProfit = revenue - cogs;

    // 2. Fetch employee salaries (OpEx)
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('salary')
      .eq('is_active', true);

    if (usersError) throw usersError;

    const totalSalaries = users.reduce((sum, u) => sum + (parseFloat(u.salary) || 0), 0);

    // Calculate OpEx based on period
    let opex = 0;
    if (period === 'weekly') {
      opex = totalSalaries / 4; // Approximate weekly cost
    } else if (period === 'monthly') {
      opex = totalSalaries;
    } else if (period === 'yearly') {
      opex = totalSalaries * 12;
    }

    // 3. Calculate Net Profit
    const netProfit = grossProfit - opex;

    // 4. Calculate metrics
    const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
    const averageOrderValue = tussles.length > 0 ? revenue / tussles.length : 0;

    return {
      success: true,
      data: {
        // Revenue Metrics
        revenue: revenue,
        totalOrders: tussles.length,
        averageOrderValue: averageOrderValue,

        // Cost Breakdown
        cogs: cogs,
        materialCost: materialCost,
        laborCost: laborCost,
        opex: opex,
        totalCosts: cogs + opex,

        // Profit Metrics
        grossProfit: grossProfit,
        netProfit: netProfit,
        profitMargin: profitMargin,

        // Additional Insights
        topPerformingTussles: tussles
          .sort((a, b) => parseFloat(b.gross_profit) - parseFloat(a.gross_profit))
          .slice(0, 5)
          .map(t => ({
            id: t.id,
            name: t.name,
            profit: t.gross_profit,
            margin: (parseFloat(t.gross_profit) / parseFloat(t.sell_price)) * 100
          })),

        // Period info
        period: period,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        calculatedAt: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('Error calculating net profit:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

/**
 * Calculate profit by time period (for charts)
 * @param {string} period - 'daily', 'weekly', 'monthly'
 * @param {number} count - Number of periods to fetch
 * @returns {Promise<Array>} Array of profit data points
 */
export async function getProfitTrends(period = 'monthly', count = 12) {
  try {
    const { data: tussles, error } = await supabase
      .from('tussles')
      .select('*')
      .eq('status', 'completed')
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: true });

    if (error) throw error;

    // Fetch salaries for OpEx
    const { data: users } = await supabase
      .from('users')
      .select('salary')
      .eq('is_active', true);

    const monthlySalaries = users.reduce((sum, u) => sum + (parseFloat(u.salary) || 0), 0);

    // Group tussles by period
    const groupedData = {};
    
    tussles.forEach(tussle => {
      const date = new Date(tussle.completed_at);
      let key;

      if (period === 'daily') {
        key = date.toISOString().split('T')[0];
      } else if (period === 'weekly') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else { // monthly
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!groupedData[key]) {
        groupedData[key] = {
          period: key,
          revenue: 0,
          cogs: 0,
          grossProfit: 0,
          orders: 0
        };
      }

      groupedData[key].revenue += parseFloat(tussle.sell_price) || 0;
      groupedData[key].cogs += (parseFloat(tussle.material_cost) || 0) + (parseFloat(tussle.labor_cost) || 0);
      groupedData[key].grossProfit += parseFloat(tussle.gross_profit) || 0;
      groupedData[key].orders += 1;
    });

    // Convert to array and add OpEx and Net Profit
    const trends = Object.values(groupedData).map(item => {
      let opex = 0;
      if (period === 'daily') {
        opex = monthlySalaries / 30;
      } else if (period === 'weekly') {
        opex = monthlySalaries / 4;
      } else {
        opex = monthlySalaries;
      }

      return {
        ...item,
        opex: opex,
        netProfit: item.grossProfit - opex,
        profitMargin: item.revenue > 0 ? ((item.grossProfit - opex) / item.revenue) * 100 : 0
      };
    });

    // Sort and limit
    return trends
      .sort((a, b) => a.period.localeCompare(b.period))
      .slice(-count);

  } catch (error) {
    console.error('Error fetching profit trends:', error);
    return [];
  }
}

/**
 * Get company-wise profit analysis
 * @returns {Promise<Array>} Array of companies with profit data
 */
export async function getCompanyProfitAnalysis() {
  try {
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select(`
        id,
        name,
        logo_url,
        total_spent,
        tussles!inner(
          id,
          sell_price,
          material_cost,
          labor_cost,
          gross_profit,
          status
        )
      `)
      .eq('tussles.status', 'completed');

    if (companiesError) throw companiesError;

    const analysis = companies.map(company => {
      const tussles = company.tussles || [];
      const revenue = tussles.reduce((sum, t) => sum + (parseFloat(t.sell_price) || 0), 0);
      const totalCost = tussles.reduce((sum, t) => 
        sum + (parseFloat(t.material_cost) || 0) + (parseFloat(t.labor_cost) || 0), 0
      );
      const grossProfit = tussles.reduce((sum, t) => sum + (parseFloat(t.gross_profit) || 0), 0);

      return {
        id: company.id,
        name: company.name,
        logo_url: company.logo_url,
        totalOrders: tussles.length,
        revenue: revenue,
        totalCost: totalCost,
        grossProfit: grossProfit,
        profitMargin: revenue > 0 ? (grossProfit / revenue) * 100 : 0,
        lifetimeSpent: company.total_spent
      };
    });

    return analysis.sort((a, b) => b.grossProfit - a.grossProfit);

  } catch (error) {
    console.error('Error fetching company profit analysis:', error);
    return [];
  }
}

/**
 * Calculate Break-even Analysis
 * @returns {Promise<Object>} Break-even metrics
 */
export async function calculateBreakeven() {
  try {
    // Get total fixed costs (monthly salaries)
    const { data: users } = await supabase
      .from('users')
      .select('salary')
      .eq('is_active', true);

    const fixedCosts = users.reduce((sum, u) => sum + (parseFloat(u.salary) || 0), 0);

    // Get average margins from completed tussles
    const { data: tussles } = await supabase
      .from('tussles')
      .select('sell_price, material_cost, labor_cost, gross_profit')
      .eq('status', 'completed')
      .not('completed_at', 'is', null)
      .limit(100) // Last 100 orders for average
      .order('completed_at', { ascending: false });

    if (!tussles || tussles.length === 0) {
      return {
        breakEvenRevenue: fixedCosts,
        averageMargin: 0,
        ordersNeeded: 0,
        message: 'Insufficient data for break-even analysis'
      };
    }

    const avgRevenue = tussles.reduce((sum, t) => sum + parseFloat(t.sell_price), 0) / tussles.length;
    const avgCOGS = tussles.reduce((sum, t) => 
      sum + (parseFloat(t.material_cost) || 0) + (parseFloat(t.labor_cost) || 0), 0
    ) / tussles.length;
    
    const avgContributionMargin = avgRevenue - avgCOGS;
    const contributionMarginRatio = avgRevenue > 0 ? avgContributionMargin / avgRevenue : 0;

    // Break-even formula: Fixed Costs / Contribution Margin Ratio
    const breakEvenRevenue = contributionMarginRatio > 0 ? fixedCosts / contributionMarginRatio : 0;
    const ordersNeeded = avgRevenue > 0 ? Math.ceil(breakEvenRevenue / avgRevenue) : 0;

    return {
      fixedCosts: fixedCosts,
      averageRevenue: avgRevenue,
      averageCOGS: avgCOGS,
      contributionMargin: avgContributionMargin,
      contributionMarginRatio: contributionMarginRatio * 100,
      breakEvenRevenue: breakEvenRevenue,
      ordersNeeded: ordersNeeded,
      currentMonthOrders: tussles.filter(t => {
        const completedDate = new Date(t.completed_at);
        const now = new Date();
        return completedDate.getMonth() === now.getMonth() && 
               completedDate.getFullYear() === now.getFullYear();
      }).length
    };

  } catch (error) {
    console.error('Error calculating break-even:', error);
    return null;
  }
}

/**
 * Get worker efficiency analysis
 * @returns {Promise<Array>} Worker performance data
 */
export async function getWorkerEfficiency() {
  try {
    const { data: assignments, error } = await supabase
      .from('work_assignments')
      .select(`
        *,
        worker:workers(id, name, specialty),
        tussle:tussles(status, completed_at)
      `)
      .eq('tussle.status', 'completed');

    if (error) throw error;

    const workerStats = {};

    assignments.forEach(assignment => {
      const workerId = assignment.worker?.id;
      if (!workerId) return;

      if (!workerStats[workerId]) {
        workerStats[workerId] = {
          id: workerId,
          name: assignment.worker.name,
          specialty: assignment.worker.specialty,
          totalAssignments: 0,
          totalPay: 0,
          totalQuantity: 0,
          averageRate: 0
        };
      }

      workerStats[workerId].totalAssignments += 1;
      workerStats[workerId].totalPay += parseFloat(assignment.total_pay) || 0;
      workerStats[workerId].totalQuantity += parseInt(assignment.quantity_assigned) || 0;
    });

    // Calculate averages
    return Object.values(workerStats).map(worker => ({
      ...worker,
      averageRate: worker.totalQuantity > 0 ? worker.totalPay / worker.totalQuantity : 0,
      averagePayPerAssignment: worker.totalAssignments > 0 ? 
        worker.totalPay / worker.totalAssignments : 0
    })).sort((a, b) => b.totalPay - a.totalPay);

  } catch (error) {
    console.error('Error calculating worker efficiency:', error);
    return [];
  }
}

/**
 * Export for use in components
 */
export default {
  calculateNetProfit,
  getProfitTrends,
  getCompanyProfitAnalysis,
  calculateBreakeven,
  getWorkerEfficiency
};
