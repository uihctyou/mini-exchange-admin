import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { setServerAuthCookie } from '@/lib/auth';

/**
 * Login API route (BFF mode)
 * Proxies authentication requests to the backend and manages secure cookies
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Call backend authentication API
    const backendResponse = await fetch(`${env.EXCHANGE_API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const responseData = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        { 
          success: false, 
          message: responseData.message || 'Authentication failed' 
        },
        { status: backendResponse.status }
      );
    }

    // Extract access token from backend response
    const { accessToken, user, expiresIn } = responseData.data;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: 'No access token received' },
        { status: 500 }
      );
    }

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      data: {
        user,
        expiresIn,
      },
      message: 'Login successful',
    });

    // Set secure HTTP-only cookie with the access token
    const cookieHeader = setServerAuthCookie(accessToken);
    response.headers.set('Set-Cookie', cookieHeader);

    return response;

  } catch (error) {
    console.error('Login API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
