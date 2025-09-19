import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import RoleGuard from '@/shared/guards/RoleGuard'

vi.mock('@/shared/hooks/useAuth', () => {
  return {
    useAuth: () => ({
      loading: false,
      profile: { role: 'employee', company_id: 'c1' },
    }),
  }
})

describe('RoleGuard', () => {
  it('bloqueia acesso quando papel nao esta na lista', async () => {
    render(
      <MemoryRouter initialEntries={['/employees']}>
        <Routes>
          <Route element={<RoleGuard allow={['admin', 'manager']} />}> 
            <Route path="/employees" element={<div>employees</div>} />
          </Route>
          <Route path="/unauthorized" element={<div>unauthorized</div>} />
        </Routes>
      </MemoryRouter>
    )
    expect(await screen.findByText(/unauthorized/i)).toBeInTheDocument()
  })

  it('permite acesso quando papel esta na lista', async () => {
    vi.doMock('@/shared/hooks/useAuth', () => ({
      useAuth: () => ({ loading: false, profile: { role: 'admin', company_id: 'c1' } }),
    }))
    const { default: RoleGuardLocal } = await import('@/shared/guards/RoleGuard')
    render(
      <MemoryRouter initialEntries={['/employees']}>
        <Routes>
          <Route element={<RoleGuardLocal allow={['admin', 'manager']} />}> 
            <Route path="/employees" element={<div>employees</div>} />
          </Route>
          <Route path="/unauthorized" element={<div>unauthorized</div>} />
        </Routes>
      </MemoryRouter>
    )
    expect(await screen.findByText(/employees/i)).toBeInTheDocument()
  })
})
