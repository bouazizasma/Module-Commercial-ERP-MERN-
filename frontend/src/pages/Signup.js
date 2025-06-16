import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils';
import 'react-toastify/dist/ReactToastify.css';
import useMediaQuery from '@mui/material/useMediaQuery';

function Signup() {
    const [signupInfo, setSignupInfo] = useState({
        name: '',
        email: '',
        password: ''
    });

    const navigate = useNavigate();
    const isMobile = useMediaQuery('(max-width:600px)');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSignupInfo(prev => ({ ...prev, [name]: value }));
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
            minHeight: '100vh',
            display: 'flex',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            backgroundColor: '#f8f9fa',
            alignItems: 'stretch'
        }}>
            {/* Partie gauche - Illustration et texte */}
            <div style={{
                flex: 1,
                background: 'linear-gradient(135deg, #1a237e 0%, #303f9f 100%)',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '0 5%',
                alignItems: 'center',
                display: isMobile ? 'none' : 'flex'
            }}>
                <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                    <img 
                        src="/logooo.png" 
                        alt="Logo" 
                        style={{ 
                            width: '310px', 
                            marginBottom: '2rem',
                        }} 
                    />
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: '700',
                        marginBottom: '1.5rem',
                        lineHeight: '1.2'
                    }}>
                        Rejoignez notre plateforme
                    </h1>
                    <p style={{
                        fontSize: '1.1rem',
                        opacity: 0.9,
                        lineHeight: '1.6',
                        marginBottom: '2rem'
                    }}>
                        Créez votre compte pour accéder à toutes les fonctionnalités de notre solution commerciale.
                    </p>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginTop: '3rem',
                        marginTop: 'auto'
                    }}>
                        <div style={{
                            width: '50px',
                            height: '3px',
                            backgroundColor: 'rgba(255,255,255,0.5)',
                            marginRight: '1rem'
                        }}></div>
                        <span style={{ opacity: 0.8 }}>Solution sécurisée et performante</span>
                    </div>
                </div>
            </div>

            {/* Partie droite - Formulaire */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                backgroundColor: 'white',
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '2.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 5px 20px rgba(0,0,0,0.05)'
                }}>
                    <h2 style={{
                        color: '#1a237e',
                        textAlign: 'center',
                        marginBottom: '2rem',
                        fontSize: '1.8rem',
                        fontWeight: '700'
                    }}>
                        Créer un compte
                    </h2>

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
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    transition: 'all 0.3s',
                                    outline: 'none',
                                    paddingLeft: '1rem',
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    ':focus': {
                                        borderColor: '#1a237e',
                                        boxShadow: '0 0 0 2px rgba(26, 35, 126, 0.2)'
                                    }
                                }}
                            />
                            <label htmlFor='name' style={{
                                position: 'absolute',
                                left: '1rem',
                                top: signupInfo.name ? '0' : '1rem',
                                transform: signupInfo.name ? 'translateY(-50%) scale(0.9)' : 'none',
                                backgroundColor: signupInfo.name ? 'white' : 'transparent',
                                padding: signupInfo.name ? '0 0.5rem' : '0',
                                color: signupInfo.name ? '#1a237e' : '#777',
                                transition: 'all 0.2s',
                                pointerEvents: 'none',
                                fontSize: signupInfo.name ? '0.9rem' : '1rem'
                            }}>
                                Nom complet
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
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    transition: 'all 0.3s',
                                    outline: 'none',
                                    paddingLeft: '1rem',
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    ':focus': {
                                        borderColor: '#1a237e',
                                        boxShadow: '0 0 0 2px rgba(26, 35, 126, 0.2)'
                                    }
                                }}
                            />
                            <label htmlFor='email' style={{
                                position: 'absolute',
                                left: '1rem',
                                top: signupInfo.email ? '0' : '1rem',
                                transform: signupInfo.email ? 'translateY(-50%) scale(0.9)' : 'none',
                                backgroundColor: signupInfo.email ? 'white' : 'transparent',
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
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    transition: 'all 0.3s',
                                    outline: 'none',
                                    paddingLeft: '1rem',
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    ':focus': {
                                        borderColor: '#1a237e',
                                        boxShadow: '0 0 0 2px rgba(26, 35, 126, 0.2)'
                                    }
                                }}
                            />
                            <label htmlFor='password' style={{
                                position: 'absolute',
                                left: '1rem',
                                top: signupInfo.password ? '0' : '1rem',
                                transform: signupInfo.password ? 'translateY(-50%) scale(0.9)' : 'none',
                                backgroundColor: signupInfo.password ? 'white' : 'transparent',
                                padding: signupInfo.password ? '0 0.5rem' : '0',
                                color: signupInfo.password ? '#1a237e' : '#777',
                                transition: 'all 0.2s',
                                pointerEvents: 'none',
                                fontSize: signupInfo.password ? '0.9rem' : '1rem'
                            }}>
                                Mot de passe
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
                            marginTop: '0.5rem',
                            ':hover': {
                                backgroundColor: '#303f9f',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(26, 35, 126, 0.2)'
                            }
                        }}>
                            S'inscrire
                        </button>
                        
                        <div style={{ 
                            textAlign: 'center', 
                            marginTop: '1.5rem',
                            color: '#666'
                        }}>
                            <span>Vous avez déjà un compte ? </span>
                            <Link to="/login" style={{
                                color: '#1a237e',
                                fontWeight: '600',
                                textDecoration: 'none',
                                ':hover': {
                                    textDecoration: 'underline'
                                }
                            }}>
                                Se connecter
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
        </div>
    );
}

export default Signup;