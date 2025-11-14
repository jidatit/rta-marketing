// src/App.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
    Car,
    Loader2,
    AlertCircle,
    Heart,
    Clock,
    List,
    Package,
    Filter,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FilterPanel } from './components/FilterPanel';
import { CarCard } from './components/CarCard';
import { SavedDrawer } from './components/SavedDrawer';
import { PriceAnalyticsSidebar } from './components/PriceAnalyticsSidebar';
import { useScrape } from './hooks/useScrape';
import { useGlobalSavedCars } from './hooks/useGlobalSavedCars';
import { normalizeCar } from './lib/normalizeCar';
import { NormalizedCar } from './types';

const LOADING_MESSAGES = [
    { text: "Searching AutoTrader...", duration: 8000 },
    { text: "Checking Auto Planet inventory...", duration: 8000 },
    { text: "Scanning Humberview listings...", duration: 8000 },
    { text: "Checking Yorkdalevw inventory...", duration: 8000 },
    { text: "Fetching and combining results...", duration: 6000 },
    { text: "Almost there, finalizing results...", duration: 5000 },
];

export const App: React.FC = () => {
    const { mutate, data, isPending, error } = useScrape();
    const { savedCars, saveCar, removeCar, isSaved } = useGlobalSavedCars();
    const [showDrawer, setShowDrawer] = useState(false);
    const [allCars, setAllCars] = useState<NormalizedCar[]>([]);
    const [selectedSources, setSelectedSources] = useState<string[]>([]);
    const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

    const handleSearch = (filters: Record<string, any>) => {
        mutate(filters);
        setLoadingMessageIndex(0);
    };

    // ----- loading messages rotation -----
    useEffect(() => {
        if (!isPending) {
            setLoadingMessageIndex(0);
            return;
        }
        const timer = setTimeout(() => {
            setLoadingMessageIndex((i) =>
                i < LOADING_MESSAGES.length - 1 ? i + 1 : i
            );
        }, LOADING_MESSAGES[loadingMessageIndex].duration);
        return () => clearTimeout(timer);
    }, [isPending, loadingMessageIndex]);

    // ----- normalize cars -----
    useEffect(() => {
        if (!data?.results) return;
        const normalized: NormalizedCar[] = [];
        Object.entries(data.results).forEach(
            ([source, srcData]: [string, any]) => {
                if (srcData.cars) {
                    srcData.cars.forEach((c: any, i: number) =>
                        normalized.push(normalizeCar(c, source, i))
                    );
                }
            }
        );
        setAllCars(normalized);
        const sources = [...new Set(normalized.map((c) => c.source))];
        setSelectedSources(sources);
    }, [data]);

    // ----- summary -----
    const summary = useMemo(() => {
        if (!data) return null;
        const { duration, totalCars, summary: siteSummary = [] } = data;
        const sites = siteSummary
            .filter((s: any) => s.cars > 0)
            .map((s: any) => ({ site: s.site, count: s.cars }));
        return {
            duration: typeof duration === 'string' ? duration : `${duration}s`,
            totalCars,
            sites,
        };
    }, [data]);

    const availableSources = useMemo(
        () => [...new Set(allCars.map((c) => c.source))],
        [allCars]
    );

    const filteredCars = useMemo(() => {
        if (!selectedSources.length) return allCars;
        return allCars.filter((c) => selectedSources.includes(c.source));
    }, [allCars, selectedSources]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ---------- HEADER ---------- */}
            <header className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                    <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <Car className="h-5 w-5 text-blue-600" />
                        Car Search
                    </h1>
                    <Button
                        onClick={() => setShowDrawer(true)}
                        variant="ghost"
                        size="sm"
                        className="text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    >
                        <Heart className="h-4 w-4 mr-1.5" />
                        Saved{' '}
                        {savedCars.length > 0 && <span className="ml-1">({savedCars.length})</span>}
                    </Button>
                </div>
            </header>

            {/* ---------- MAIN LAYOUT (full-width) ---------- */}
            <div className="relative flex flex-row-reverse p-4">
                {/* LEFT ANALYTICS – outside max-w-7xl */}
                {allCars.length > 0 && !isPending && (
                    <aside className="hidden 2xl:block w-78 flex-shrink-0 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto pr-4">
                        <PriceAnalyticsSidebar cars={allCars} />
                    </aside>
                )}

                {/* CENTRAL CONTENT (max-w-7xl) */}
                <main className="flex-1 max-w-7xl mx-auto px-4 py-8">
                    <FilterPanel onSearch={handleSearch} />

                    {/* ----- error / loading / empty ----- */}
                    {error && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Failed to fetch results. Please try again.
                            </AlertDescription>
                        </Alert>
                    )}

                    {isPending && (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                            <div className="text-center space-y-2">
                                <p className="text-lg font-medium text-gray-700 animate-pulse">
                                    {LOADING_MESSAGES[loadingMessageIndex].text}
                                </p>
                                <p className="text-sm text-gray-500">
                                    This may take 20-70 seconds...
                                </p>
                            </div>
                            <div className="flex gap-2">
                                {LOADING_MESSAGES.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-2 w-2 rounded-full transition-all ${i <= loadingMessageIndex
                                            ? 'bg-sky-800 scale-110'
                                            : 'bg-gray-300'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {!isPending && allCars.length === 0 && data && (
                        <div className="text-center py-12">
                            <Car className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                            <p className="text-xl text-gray-600">No results found</p>
                        </div>
                    )}

                    {/* ----- summary ----- */}
                    {summary && !isPending && allCars.length > 0 && (
                        <div className="mb-6 p-4 bg-white rounded-lg border shadow-sm">
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span className="font-medium text-foreground">
                                        {summary.duration}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <Package className="h-4 w-4" />
                                    <span className="font-medium text-foreground">
                                        {summary.totalCars} cars
                                    </span>
                                </div>
                                {summary.sites.length > 0 && (
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <List className="h-4 w-4 text-muted-foreground" />
                                        {summary.sites.map((s) => (
                                            <Badge
                                                key={s.site}
                                                variant="secondary"
                                                className="capitalize"
                                            >
                                                {s.site}: {s.count}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ----- source tabs ----- */}
                    {!isPending && allCars.length > 0 && (
                        <div className="mb-6 flex gap-2 border-b">
                            <button
                                onClick={() => setSelectedSources(availableSources)}
                                className={`px-4 py-2 font-medium transition-colors border-b-2 ${selectedSources.length === availableSources.length
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                All ({allCars.length})
                            </button>
                            {availableSources.map((src) => (
                                <button
                                    key={src}
                                    onClick={() => setSelectedSources([src])}
                                    className={`px-4 py-2 font-medium capitalize transition-colors border-b-2 ${selectedSources.length === 1 && selectedSources[0] === src
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    {src} ({allCars.filter((c) => c.source === src).length})
                                </button>
                            ))}
                        </div>
                    )}

                    {/* ----- 3-column car grid ----- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCars.map((car) => (
                            <CarCard
                                key={car.id}
                                car={car}
                                onSave={() => (isSaved(car.id) ? null : saveCar(car))}
                                isSaved={isSaved(car.id)}
                            />
                        ))}
                    </div>

                    {/* ----- filtered empty ----- */}
                    {filteredCars.length === 0 && allCars.length > 0 && (
                        <div className="text-center py-12">
                            <Filter className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                            <p className="text-xl text-gray-600">
                                No cars match the selected sources
                            </p>
                            <Button
                                onClick={() => setSelectedSources(availableSources)}
                                variant="outline"
                                className="mt-4"
                            >
                                Clear Filters
                            </Button>
                        </div>
                    )}
                </main>
            </div>

            {/* ---------- SAVED DRAWER ---------- */}
            {showDrawer && (
                <SavedDrawer
                    savedCars={savedCars}
                    onRemove={removeCar}
                    onClose={() => setShowDrawer(false)}
                />
            )}
        </div>
    );
};