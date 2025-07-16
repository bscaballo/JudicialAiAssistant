
import React, { useState, useEffect } from 'react';
import { ActiveTab, User } from './types';
import { TABS } from './constants';
import Sidebar from './components/Sidebar';
import CaseBriefer from './components/CaseBriefer';
import LegalResearch from './components/LegalResearch';
import OrderDrafter from './components/OrderDrafter';
import DailyDocket from './components/DailyDocket';
import OralArgumentCoach from './components/OralArgumentCoach';
import EvidenceAnalyzer from './components/EvidenceAnalyzer';
import JuryInstructionDrafter from './components/JuryInstructionDrafter';
import CaseLawExplorer from './components/CaseLawExplorer';
import AuthPage from './components/auth/AuthPage';
import History from './components/History';
import LoadingSpinner from './components/common/LoadingSpinner';
import * as authService from './services/authService';

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isAuthenticating, setIsAuthenticating] = useState(true);
    const [activeTab, setActiveTab] = useState<ActiveTab>(TABS[0].id);

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (user) {
            setCurrentUser(user);
        }
        setIsAuthenticating(false);
    }, []);

    const handleLoginSuccess = (user: User) => {
        setCurrentUser(user);
    };

    const handleLogout = () => {
        authService.logout();
        setCurrentUser(null);
        setActiveTab(TABS[0].id);
    };

    const renderContent = () => {
        const props = { currentUser };
        switch (activeTab) {
            case 'case-briefer':
                return <CaseBriefer {...props} />;
            case 'legal-research':
                return <LegalResearch {...props} />;
            case 'case-law-explorer':
                return <CaseLawExplorer {...props} />;
            case 'evidence-analyzer':
                return <EvidenceAnalyzer {...props} />;
            case 'order-drafter':
                return <OrderDrafter {...props} />;
            case 'jury-instruction-drafter':
                return <JuryInstructionDrafter {...props} />;
            case 'daily-docket':
                return <DailyDocket {...props} />;
            case 'oral-argument-coach':
                return <OralArgumentCoach {...props} />;
            case 'history':
                return <History {...props} />;
            default:
                return <CaseBriefer {...props} />;
        }
    };

    if (isAuthenticating) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-900">
                <LoadingSpinner />
            </div>
        );
    }

    if (!currentUser) {
        return <AuthPage onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <div className="flex min-h-screen bg-slate-900 text-gray-200">
            <Sidebar 
                activeTab={activeTab} 
                setActiveTab={setActiveTab}
                currentUser={currentUser}
                onLogout={handleLogout}
            />
            <main className="flex-1 p-8 md:p-12 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default App;
