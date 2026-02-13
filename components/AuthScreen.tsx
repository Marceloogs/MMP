
import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Mail, Lock, User, ShieldCheck, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

const AuthScreen: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: name,
                        },
                    },
                });
                if (error) throw error;
                alert('Confirme seu e-mail para ativar a conta!');
            }
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro na autenticação');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B1118] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse delay-700"></div>

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-blue-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-blue-500/20 shadow-2xl shadow-blue-500/10">
                        <ShieldCheck className="w-10 h-10 text-blue-500" strokeWidth={2.5} />
                    </div>
                    <h1 className="text-3xl font-black italic tracking-tight text-white uppercase leading-tight mb-2">
                        Mecânica <span className="text-blue-500">MMP</span>
                    </h1>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Painel de Gestão Profissional</p>
                </div>

                <div className="bg-card/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
                    <div className="flex bg-[#0B1118]/50 p-1.5 rounded-2xl mb-8 border border-white/5">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${isLogin ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-500'}`}
                        >
                            Entrar
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${!isLogin ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-500'}`}
                        >
                            Criar Conta
                        </button>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4">
                        {!isLogin && (
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Seu Nome Completo"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-[#0B1118]/60 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 transition-all text-sm font-bold"
                                    required={!isLogin}
                                />
                            </div>
                        )}

                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="email"
                                placeholder="E-mail de acesso"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#0B1118]/60 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 transition-all text-sm font-bold"
                                required
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="password"
                                placeholder="Senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#0B1118]/60 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 transition-all text-sm font-bold"
                                required
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in zoom-in-95">
                                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                                <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter leading-tight">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-2 shadow-2xl shadow-blue-500/40 active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span className="text-xs uppercase tracking-[0.2em]">{isLogin ? 'Iniciar Sessão' : 'Concluir Cadastro'}</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-gray-500 text-[9px] font-black uppercase text-center mt-8 tracking-widest opacity-40">
                        Powered by Supabase & Antigravity
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthScreen;
