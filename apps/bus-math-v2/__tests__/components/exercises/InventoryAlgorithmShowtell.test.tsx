import { render, screen, fireEvent } from '@testing-library/react'
import { InventoryAlgorithmShowtell } from '@/components/activities/exercises/InventoryAlgorithmShowtell'
import { describe, it, expect, vi } from 'vitest'

describe('InventoryAlgorithmShowtell', () => {
  it('renders without crashing', () => {
    render(<InventoryAlgorithmShowtell activity={{}} />)
    expect(screen.getByText(/Inventory Cost Flow Show & Tell/i)).toBeInTheDocument()
  })

  it('calls onSubmit when analysis is complete', () => {
    const onSubmit = vi.fn()
    render(<InventoryAlgorithmShowtell activity={{}} onSubmit={onSubmit} />)

    const textarea = screen.getByPlaceholderText(
      /What did you learn about these inventory costing methods/i
    )
    fireEvent.change(textarea, { target: { value: 'FIFO assigns older costs to COGS' } })
    fireEvent.click(screen.getByRole('button', { name: /Add Insight/i }))
    fireEvent.click(screen.getByRole('button', { name: /Complete Analysis/i }))

    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('calls onComplete when analysis is complete', () => {
    const onComplete = vi.fn()
    render(<InventoryAlgorithmShowtell activity={{}} onComplete={onComplete} />)

    const textarea = screen.getByPlaceholderText(
      /What did you learn about these inventory costing methods/i
    )
    fireEvent.change(textarea, { target: { value: 'FIFO assigns older costs to COGS' } })
    fireEvent.click(screen.getByRole('button', { name: /Add Insight/i }))
    fireEvent.click(screen.getByRole('button', { name: /Complete Analysis/i }))

    expect(onComplete).toHaveBeenCalledOnce()
  })
})
