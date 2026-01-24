import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-black flex items-center justify-center p-4">
                    <div className="bg-[#e6d5ac] rounded-lg p-6 max-w-md w-full border-2 border-[#8a1c1c] shadow-lg">
                        <h2 className="font-rpg text-2xl font-bold text-[#8a1c1c] mb-4 text-center">
                            ⚠️ Erro Inesperado
                        </h2>
                        <p className="font-rpg text-[#5c4033] mb-4 text-center">
                            Algo deu errado. Por favor, recarregue a página.
                        </p>
                        {this.state.error && (
                            <details className="mb-4">
                                <summary className="font-rpg text-sm text-[#5c4033] cursor-pointer mb-2">
                                    Detalhes do erro
                                </summary>
                                <pre className="text-xs bg-black/10 p-2 rounded font-mono text-[#3e2723] overflow-auto">
                                    {this.state.error.toString()}
                                </pre>
                            </details>
                        )}
                        <div className="flex gap-2">
                            <button
                                onClick={this.handleReset}
                                className="flex-1 bg-[#8a1c1c] hover:bg-[#6b1515] text-white font-rpg py-2 px-4 rounded transition-colors"
                            >
                                Tentar Novamente
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="flex-1 bg-[#5c4033] hover:bg-[#3e2723] text-white font-rpg py-2 px-4 rounded transition-colors"
                            >
                                Recarregar Página
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
