import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AdjustmentPractice } from '@/components/activities/exercises/AdjustmentPractice'
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('AdjustmentPractice', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders without crashing', () => {
    render(<AdjustmentPractice activity={{}} />)
    expect(screen.getByText(/Adjustment Practice/i)).toBeInTheDocument()
  })

  it('calls onSubmit when answer is checked', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<AdjustmentPractice activity={{}} onSubmit={onSubmit} />)

    // Click any answer option (not the control buttons)
    const allButtons = screen.getAllByRole('button')
    const optionButton = allButtons.find(
      btn => !['Check Answer', 'Show Example'].includes(btn.textContent?.trim() ?? '')
    )
    expect(optionButton).toBeDefined()
    await user.click(optionButton!)

    await user.click(screen.getByRole('button', { name: /Check Answer/i }))

    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('calls onComplete when mastery is achieved', async () => {
    const user = userEvent.setup()
    // Mock Math.random deterministically:
    //   call 1: scenario index = floor(0 * 3) = 0 → deferral scenario
    //   call 2: problem id (value doesn't matter)
    //   calls 3+: sort comparator returns 0.5 - 0.5 = 0 → stable order, correct answer first
    let callCount = 0
    vi.spyOn(Math, 'random').mockImplementation(() => {
      callCount++
      if (callCount <= 2) return 0
      return 0.5
    })

    const onComplete = vi.fn()
    render(
      <AdjustmentPractice
        activity={{ props: { masteryThreshold: 1 } }}
        onComplete={onComplete}
      />
    )

    // Correct answer for deferral scenario (scenario index 0)
    const correctText = 'Debit Insurance Expense $200, Credit Prepaid Insurance $200'
    const correctOption = screen.getByText(correctText)
    await user.click(correctOption)

    await user.click(screen.getByRole('button', { name: /Check Answer/i }))

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledOnce()
    })
  })
})
