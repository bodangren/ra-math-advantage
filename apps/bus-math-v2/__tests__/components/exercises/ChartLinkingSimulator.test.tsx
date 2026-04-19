import { render, screen, fireEvent } from '@testing-library/react'
import { ChartLinkingSimulator } from '@/components/activities/exercises/ChartLinkingSimulator'
import { describe, it, expect, vi } from 'vitest'

describe('ChartLinkingSimulator', () => {
  it('renders without crashing', () => {
    render(<ChartLinkingSimulator activity={{}} />)
    expect(screen.getByText(/Financial Statement Linking Simulator/i)).toBeInTheDocument()
  })

  it('calls onSubmit when analysis is complete', () => {
    const onSubmit = vi.fn()
    render(<ChartLinkingSimulator activity={{}} onSubmit={onSubmit} />)

    const textarea = screen.getByPlaceholderText(
      /What did you learn about how financial statements link together/i
    )
    fireEvent.change(textarea, { target: { value: 'Revenue changes cascade to retained earnings' } })
    fireEvent.click(screen.getByRole('button', { name: /Add Insight/i }))
    fireEvent.click(screen.getByRole('button', { name: /Complete Analysis/i }))

    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('calls onComplete when analysis is complete', () => {
    const onComplete = vi.fn()
    render(<ChartLinkingSimulator activity={{}} onComplete={onComplete} />)

    const textarea = screen.getByPlaceholderText(
      /What did you learn about how financial statements link together/i
    )
    fireEvent.change(textarea, { target: { value: 'Revenue changes cascade to retained earnings' } })
    fireEvent.click(screen.getByRole('button', { name: /Add Insight/i }))
    fireEvent.click(screen.getByRole('button', { name: /Complete Analysis/i }))

    expect(onComplete).toHaveBeenCalledOnce()
  })
})
