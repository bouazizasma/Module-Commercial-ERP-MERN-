import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils';
import 'react-toastify/dist/ReactToastify.css';

function Signup() {
    const [signupInfo, setSignupInfo] = useState({
        name: '',
        email: '',
        password: ''
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        const copySignupInfo = { ...signupInfo };
        copySignupInfo[name] = value;
        setSignupInfo(copySignupInfo);
    }

    const handleSignup = async (e) => {
        e.preventDefault();
        const { name, email, password } = signupInfo;
        if (!name || !email || !password) {
            return handleError('Name, email and password are required');
        }
        try {
            const url = `http://localhost:5000/auth/signup`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(signupInfo)
            });
            const result = await response.json();
            const { success, message, error } = result;
            if (success) {
                handleSuccess(message);
                setTimeout(() => {
                    navigate('/login');
                }, 1000);
            } else if (error) {
                const details = error?.details[0]?.message;
                handleError(details || 'An error occurred');
            } else if (!success) {
                handleError(message);
            }
        } catch (err) {
            handleError(err.message || 'An error occurred');
        }
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "linear-gradient(180deg, #1a237e 0%, rgb(117, 120, 141) 100%)",
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            overflow: 'auto',
            padding: '20px'
        }}>
            <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                padding: '2.5rem',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                width: '100%',
                maxWidth: '400px',
                backdropFilter: 'blur(5px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                <h2 style={{
                    color: '#1a237e',
                    textAlign: 'center',
                    marginBottom: '1rem',
                    fontSize: '24px',
                    fontWeight: '700'
                }}>Commercial Application</h2>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <img 
                        src="/logoLE.png" 
                        alt="Logo" 
                        style={{ maxWidth: '120px', height: 'auto' }} 
                    />
                </div>

                <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            onChange={handleChange}
                            type='text'
                            name='name'
                            placeholder=' '
                            value={signupInfo.name}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                transition: 'all 0.3s',
                                outline: 'none',
                                paddingLeft: '1rem',
                                backgroundColor: 'rgba(255, 255, 255, 0.8)'
                            }}
                        />
                        <label htmlFor='name' style={{
                            position: 'absolute',
                            left: '1rem',
                            top: signupInfo.name ? '0' : '1rem',
                            transform: signupInfo.name ? 'translateY(-50%) scale(0.9)' : 'none',
                            backgroundColor: signupInfo.name ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
                            padding: signupInfo.name ? '0 0.5rem' : '0',
                            color: signupInfo.name ? '#1a237e' : '#777',
                            transition: 'all 0.2s',
                            pointerEvents: 'none',
                            fontSize: signupInfo.name ? '0.9rem' : '1rem'
                        }}>
                            Name
                        </label>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <input
                            onChange={handleChange}
                            type='email'
                            name='email'
                            placeholder=' '
                            value={signupInfo.email}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                transition: 'all 0.3s',
                                outline: 'none',
                                paddingLeft: '1rem',
                                backgroundColor: 'rgba(255, 255, 255, 0.8)'
                            }}
                        />
                        <label htmlFor='email' style={{
                            position: 'absolute',
                            left: '1rem',
                            top: signupInfo.email ? '0' : '1rem',
                            transform: signupInfo.email ? 'translateY(-50%) scale(0.9)' : 'none',
                            backgroundColor: signupInfo.email ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
                            padding: signupInfo.email ? '0 0.5rem' : '0',
                            color: signupInfo.email ? '#1a237e' : '#777',
                            transition: 'all 0.2s',
                            pointerEvents: 'none',
                            fontSize: signupInfo.email ? '0.9rem' : '1rem'
                        }}>
                            Email
                        </label>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <input
                            onChange={handleChange}
                            type='password'
                            name='password'
                            placeholder=' '
                            value={signupInfo.password}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                transition: 'all 0.3s',
                                outline: 'none',
                                paddingLeft: '1rem',
                                backgroundColor: 'rgba(255, 255, 255, 0.8)'
                            }}
                        />
                        <label htmlFor='password' style={{
                            position: 'absolute',
                            left: '1rem',
                            top: signupInfo.password ? '0' : '1rem',
                            transform: signupInfo.password ? 'translateY(-50%) scale(0.9)' : 'none',
                            backgroundColor: signupInfo.password ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
                            padding: signupInfo.password ? '0 0.5rem' : '0',
                            color: signupInfo.password ? '#1a237e' : '#777',
                            transition: 'all 0.2s',
                            pointerEvents: 'none',
                            fontSize: signupInfo.password ? '0.9rem' : '1rem'
                        }}>
                            Password
                        </label>
                    </div>

                    <button type='submit' style={{
                        backgroundColor: '#1a237e',
                        color: 'white',
                        padding: '1rem',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        marginTop: '1rem'
                    }}>
                        Sign Up
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <span style={{ color: '#555' }}>Already have an account? </span>
                        <Link to="/login" style={{
                            color: '#1a237e',
                            fontWeight: '600',
                            textDecoration: 'none'
                        }}>
                            Login
                        </Link>
                    </div>
                </form>

                <ToastContainer
                    position="top-center"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />
            </div>
        </div>
    );
}

export default Signup;
