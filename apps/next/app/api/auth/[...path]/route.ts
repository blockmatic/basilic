import { proxyRequest } from './handlers'

type RouteContext = {
  params: Promise<{
    path: string[]
  }>
}

export async function GET(request: Request, context: RouteContext): Promise<Response> {
  const params = await context.params
  return proxyRequest({ request, pathSegments: params.path })
}

export async function POST(request: Request, context: RouteContext): Promise<Response> {
  const params = await context.params
  return proxyRequest({ request, pathSegments: params.path })
}

export async function PUT(request: Request, context: RouteContext): Promise<Response> {
  const params = await context.params
  return proxyRequest({ request, pathSegments: params.path })
}

export async function PATCH(request: Request, context: RouteContext): Promise<Response> {
  const params = await context.params
  return proxyRequest({ request, pathSegments: params.path })
}

export async function DELETE(request: Request, context: RouteContext): Promise<Response> {
  const params = await context.params
  return proxyRequest({ request, pathSegments: params.path })
}

export async function OPTIONS(request: Request, context: RouteContext): Promise<Response> {
  const params = await context.params
  return proxyRequest({ request, pathSegments: params.path })
}
