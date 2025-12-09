import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import * as signalR from '@microsoft/signalr'
import { useNavigate } from 'react-router-dom'
import './QRCodeLogin.css'

interface QRSessionData {
    sessionId: string
    expiryTime: string
    qrData: string
}

export default function QRCodeLogin() {
    const navigate = useNavigate()
    const [qrData, setQrData] = useState('')
    const [status, setStatus] = useState<'loading' | 'ready' | 'success' | 'expired' | 'error'>('loading')
    const [errorMessage, setErrorMessage] = useState('')
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null)
    const [sessionIdRef, setSessionIdRef] = useState('')

    useEffect(() => {
        initQRSession()
        return () => {
            // Cleanup on unmount
            if (connection) {
                connection.stop()
            }
        }
    }, [])

    const initQRSession = async () => {
        try {
            setStatus('loading')
            setErrorMessage('')

            // Generate QR session
            const response = await fetch('http://100.73.130.46:7096/api/auth/qr-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error('Failed to generate QR session')
            }

            const data: QRSessionData = await response.json()

            setQrData(data.qrData)
            setSessionIdRef(data.sessionId)
            setStatus('ready')

            // Connect to SignalR
            const newConnection = new signalR.HubConnectionBuilder()
                .withUrl('http://100.73.130.46:7096/authHub')
                .withAutomaticReconnect()
                .configureLogging(signalR.LogLevel.Information)
                .build()

            newConnection.on('NotifyLoginSuccess', (session: string, token: string, user: any) => {
                console.log('Login success notification received', { session, token, user })
                if (session === sessionIdRef || session === data.sessionId) {
                    setStatus('success')

                    // Save auth data
                    localStorage.setItem('auth_token', token)
                    localStorage.setItem('user', JSON.stringify(user))

                    // Redirect to home
                    setTimeout(() => {
                        navigate('/')
                        window.location.reload() // Refresh to update auth state
                    }, 1500)
                }
            })

            newConnection.onclose(() => {
                console.log('SignalR connection closed')
            })

            await newConnection.start()
            console.log('SignalR connected')
            setConnection(newConnection)

            // Set expiry timer (5 minutes)
            setTimeout(() => {
                if (status !== 'success') {
                    setStatus('expired')
                    newConnection.stop()
                }
            }, 5 * 60 * 1000)

        } catch (error: any) {
            console.error('Failed to init QR session:', error)
            setStatus('error')
            setErrorMessage(error.message || 'Failed to generate QR code')
        }
    }

    const handleRefresh = () => {
        if (connection) {
            connection.stop()
        }
        initQRSession()
    }

    return (
        <div className="qr-login-container">
            {status === 'loading' && (
                <div className="qr-status">
                    <div className="spinner"></div>
                    <p>Generating QR code...</p>
                </div>
            )}

            {status === 'ready' && (
                <div className="qr-content">
                    <h3>Scan QR Code to Login</h3>
                    <div className="qr-code-wrapper">
                        <QRCodeSVG
                            value={qrData}
                            size={256}
                            level="H"
                            includeMargin={true}
                            style={{
                                padding: '20px',
                                background: 'white',
                                borderRadius: '12px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                        />
                    </div>
                    <div className="qr-instructions">
                        <p className="instruction-title">📱 How to scan:</p>
                        <ol className="instruction-list">
                            <li>Use your phone camera or QR scanner app</li>
                            <li>Scan the QR code above</li>
                            <li>Sign in with Google on the opened page</li>
                            <li>This page will auto-login after confirmation</li>
                        </ol>
                    </div>
                    <p className="qr-expiry">⏱️ Code expires in 5 minutes</p>
                    <p className="qr-hint">💡 Works with any device that has a camera</p>
                </div>
            )}

            {status === 'success' && (
                <div className="qr-status success">
                    <div className="success-icon">✓</div>
                    <h3>Login Successful!</h3>
                    <p>Redirecting to dashboard...</p>
                </div>
            )}

            {status === 'expired' && (
                <div className="qr-status expired">
                    <div className="error-icon">⏱️</div>
                    <h3>QR Code Expired</h3>
                    <p>The QR code has expired after 5 minutes</p>
                    <button onClick={handleRefresh} className="refresh-button">
                        Generate New QR Code
                    </button>
                </div>
            )}

            {status === 'error' && (
                <div className="qr-status error">
                    <div className="error-icon">⚠️</div>
                    <h3>Error</h3>
                    <p>{errorMessage}</p>
                    <button onClick={handleRefresh} className="refresh-button">
                        Try Again
                    </button>
                </div>
            )}
        </div>
    )
}
