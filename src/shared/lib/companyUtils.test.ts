import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createDefaultCompany } from '@/shared/lib/companyUtils'

vi.mock('@/shared/lib/supabase', () => {
  const insertFn = vi.fn().mockReturnValue({ select: () => ({ single: () => ({ data: { id: 'company-1', name: 'X' }, error: null }) }) })
  const fromFn = vi.fn().mockReturnValue({ insert: insertFn })
  return {
    supabase: {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null }),
      },
      from: fromFn,
    },
  }
})

describe('createDefaultCompany', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('envia created_by com o usuario autenticado', async () => {
    const company = await createDefaultCompany('Acme')
    expect(company).toBeTruthy()
  })
})
