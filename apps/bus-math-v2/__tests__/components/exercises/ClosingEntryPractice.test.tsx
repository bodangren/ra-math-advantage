import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ClosingEntryPractice } from '@/components/activities/exercises/ClosingEntryPractice'
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('ClosingEntryPractice', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders without crashing', () => {
    render(<ClosingEntryPractice activity={{}} />)
    expect(screen.getByText(/Closing Entry Practice/i)).toBeInTheDocument()
  })

  it('calls onSubmit when answer is checked', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ClosingEntryPractice activity={{}} onSubmit={onSubmit} />)

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
    //   call 1: scenario index = floor(0 * 5) = 0 → close_revenue scenario
    //   call 2: problem id
    //   calls 3+: sort comparator → 0.5 - 0.5 = 0, stable order → correct answer is first
    let callCount = 0
    vi.spyOn(Math, 'random').mockImplementation(() => {
      callCount++
      if (callCount <= 2) return 0
      return 0.5
    })

    const onComplete = vi.fn()
    render(
      <ClosingEntryPractice
        activity={{ props: { masteryThreshold: 1 } }}
        onComplete={onComplete}
      />
    )

    // Correct answer for close_revenue scenario (scenario index 0)
    const correctText = 'Debit Service Revenue $5,000, Credit Income Summary $5,000'
    const correctOption = screen.getByText(correctText)
    await user.click(correctOption)

    await user.click(screen.getByRole('button', { name: /Check Answer/i }))

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledOnce()
    })
  })
})
