
import React from 'react';
import type { ActiveTab } from './types';
import { BriefcaseIcon, MagnifyingGlassIcon, DocumentTextIcon, CalendarDaysIcon, GavelIcon, MicroscopeIcon, UsersIcon, BookOpenIcon, HistoryIcon } from './components/common/Icons';

export const TABS: { id: ActiveTab; name: string; icon: React.ReactNode }[] = [
    { id: 'case-briefer', name: 'Case Briefer', icon: <BriefcaseIcon /> },
    { id: 'legal-research', name: 'Legal Research', icon: <MagnifyingGlassIcon /> },
    { id: 'case-law-explorer', name: 'Case Law Explorer', icon: <BookOpenIcon /> },
    { id: 'evidence-analyzer', name: 'Evidence Analyzer', icon: <MicroscopeIcon /> },
    { id: 'order-drafter', name: 'Order Drafter', icon: <DocumentTextIcon /> },
    { id: 'jury-instruction-drafter', name: 'Jury Drafter', icon: <UsersIcon /> },
    { id: 'daily-docket', name: 'Daily Docket', icon: <CalendarDaysIcon /> },
    { id: 'oral-argument-coach', name: 'Argument Coach', icon: <GavelIcon /> },
    { id: 'history', name: 'Activity History', icon: <HistoryIcon /> },
];
