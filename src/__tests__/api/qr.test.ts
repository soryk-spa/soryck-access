
jest.mock('next/server', () => {
  class NextResponse {
    status: number
    body: any
    headers: any
    constructor(body?: any, opts?: any) {
      this.status = opts?.status || 200
      this.body = body
      this.headers = opts?.headers || {}
    }
    static json(body: any, opts?: any) {
      return { status: opts?.status || 200, body }
    }
  }
  return { NextResponse }
})

const mockToBuffer = jest.fn()
jest.mock('qrcode', () => ({ toBuffer: (...args: any[]) => mockToBuffer(...args) }))

describe('GET /api/qr/[code]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 400 for invalid format', async () => {
    const { GET } = await import('../../../src/app/api/qr/[code]/route')
    const res = await GET(undefined as any, { params: Promise.resolve({ code: 'invalid-code' }) } as any)
    expect(res.status).toBe(400)
    expect(res.body).toBe('Invalid QR code format')
  })

  it('returns png buffer for valid code', async () => {
    const fakeBuffer = Buffer.from([1,2,3,4])
    mockToBuffer.mockResolvedValueOnce(fakeBuffer)

  const { GET } = await import('../../../src/app/api/qr/[code]/route')
  
  const res = await GET(undefined as any, { params: Promise.resolve({ code: 'EVENT123-USER5678-ABC-DEF-0' }) } as any)

    expect(res.status).toBe(200)
    
    expect(res.body).toBeInstanceOf(Uint8Array)
    expect((res.body as Uint8Array).length).toBe(fakeBuffer.length)
    expect(mockToBuffer).toHaveBeenCalled()
  })
})
