const demoCode = [{
  helpText: "Let’s say you are a contractor and you got a $12/hour gig offer. How much is that really?",
  code: `$$$: rate = $12/h`,
}, {
  helpText: "Well, that depends. How much are you going to work per day?",
  code: `$$$: rate = $12/h
workhours = 8h
workdays = 22 / month`,
}, {
  helpText: "Also, you need to pay taxes on that. It’s not a fixed amount, but it’s roughly 30%.",
  code: `$$$: rate = $12/h
workhours = 8h
workdays = 22 / month
after_tax = 1 - 30%`,
}, {
  helpText: "Next we need to know what day-to-day expenses you have.",
  code: `$$$: rate = $12/h
workhours = 8h
workdays = 22 / month
after_tax = 1 - 30%

rent = $230/month
food = $200/month
others = $30/day`,
}, {
  helpText: "You need to pay the rent, buy food and other things. They all add up to quite a bit.",
  code: `$$$: rate = $12/h
workhours = 8h
workdays = 22 / month
after_tax = 1 - 30%

rent = $230/month
food = $200/month
others = $30/day
monthly_expenses = sum`,
}, {
  helpText: "Now let’s see what the gross versus net pay is, and what you take home after the monthly payments.",
  code: `$$$: rate = $12/h
workhours = 8h
workdays = 22 / month
after_tax = 1 - 30%

rent = $230/month
food = $200/month
others = $30/day
monthly_expenses = sum

monthly_salary_gross = rate * workhours * workdays
monthly_salary_net = prev * after_tax
yearly_salary = prev * 12
monthly_after_expenses = monthly_salary_net - monthly_expenses
yearly_after_expenses = 1 year * monthly_after_expenses`,
}, {
  helpText: "How much is that in pounds?",
  code: `$$$: rate = $12/h
workhours = 8h
workdays = 22 / month
after_tax = 1 - 30%

rent = $230/month
food = $200/month
others = $30/day
monthly_expenses = sum

monthly_salary_gross = rate * workhours * workdays
monthly_salary_net = prev * after_tax
yearly_salary = prev * 12
monthly_after_expenses = monthly_salary_net - monthly_expenses
yearly_after_expenses = 1 year * monthly_after_expenses

yearly_after_expenses in gbp`,
}, {
  helpText: "What if you negotiated $16/hour instead of 12?",
  code: `$$$: rate = $16/h
workhours = 8h
workdays = 22 / month
after_tax = 1 - 30%

rent = $230/month
food = $200/month
others = $30/day
monthly_expenses = sum

monthly_salary_gross = rate * workhours * workdays
monthly_salary_net = prev * after_tax
yearly_salary = prev * 12
monthly_after_expenses = monthly_salary_net - monthly_expenses
yearly_after_expenses = 1 year * monthly_after_expenses

yearly_after_expenses in gbp`,
}, {
  helpText: "That’s quite a difference! What if you moved to a bigger home?",
  code: `$$$: rate = $16/h
workhours = 8h
workdays = 22 / month
after_tax = 1 - 30%

rent = $430/month
food = $200/month
others = $30/day
monthly_expenses = sum

monthly_salary_gross = rate * workhours * workdays
monthly_salary_net = prev * after_tax
yearly_salary = prev * 12
monthly_after_expenses = monthly_salary_net - monthly_expenses
yearly_after_expenses = 1 year * monthly_after_expenses

yearly_after_expenses in gbp`,
}, {
  helpText: "Oops, forgot about pension. With a 4% pension contribution, how do things change?",
  code: `$$$: rate = $16/h
workhours = 8h
workdays = 22 / month
after_tax = 1 - 30%

rent = $430/month
food = $200/month
others = $30/day
monthly_expenses = sum

after_pension = 1 - 4%

monthly_salary_gross = rate * workhours * workdays
monthly_salary_net = prev * after_tax * after_pension
yearly_salary = prev * 12
monthly_after_expenses = monthly_salary_net - monthly_expenses
yearly_after_expenses = 1 year * monthly_after_expenses

yearly_after_expenses in gbp`,
}, {
  helpText: "Awesome! You have the results on the left, they are always updated immediately. Now let’s see what YOU come up with. You can change this pad right here.",
  code: `$$$: rate = $16/h
workhours = 8h
workdays = 22 / month
after_tax = 1 - 30%

rent = $430/month
food = $200/month
others = $30/day
monthly_expenses = sum

after_pension = 1 - 4%

monthly_salary_gross = rate * workhours * workdays
monthly_salary_net = prev * after_tax * after_pension
yearly_salary = prev * 12
monthly_after_expenses = monthly_salary_net - monthly_expenses
yearly_after_expenses = 1 year * monthly_after_expenses

yearly_after_expenses in gbp`
}];

export default demoCode;
