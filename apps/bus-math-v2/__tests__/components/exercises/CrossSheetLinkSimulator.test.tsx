import { render, screen, fireEvent } from '@testing-library/react'
import { CrossSheetLinkSimulator } from '@/components/activities/exercises/CrossSheetLinkSimulator'
import { describe, it, expect, vi } from 'vitest'

describe('CrossSheetLinkSimulator', () => {
  it('renders without crashing', () => {
    render(<CrossSheetLinkSimulator activity={{}} />)
    expect(screen.getByText(/Cross-Sheet Linking Simulator/i)).toBeInTheDocument()
  })

  it('calls onSubmit when analysis is complete', () => {
    const onSubmit = vi.fn()
    render(<CrossSheetLinkSimulator activity={{}} onSubmit={onSubmit} />)

    const textarea = screen.getByPlaceholderText(/What did you learn about cross-sheet references/i)
    fireEvent.change(textarea, { target: { value: 'Sheet1 total flows into Sheet2 revenue cell' } })
    fireEvent.click(screen.getByRole('button', { name: /Add Insight/i }))
    fireEvent.click(screen.getByRole('button', { name: /Complete Analysis/i }))

    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('calls onComplete when analysis is complete', () => {
    const onComplete = vi.fn()
    render(<CrossSheetLinkSimulator activity={{}} onComplete={onComplete} />)

    const textarea = screen.getByPlaceholderText(/What did you learn about cross-sheet references/i)
    fireEvent.change(textarea, { target: { value: 'Sheet1 total flows into Sheet2 revenue cell' } })
    fireEvent.click(screen.getByRole('button', { name: /Add Insight/i }))
    fireEvent.click(screen.getByRole('button', { name: /Complete Analysis/i }))

    expect(onComplete).toHaveBeenCalledOnce()
  })
})
