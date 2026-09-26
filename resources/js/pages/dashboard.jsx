import { useEffect, useState } from 'react';

import { useAppContext } from '@/context/AppContext';

const initialFilters = {
    position: '',
    country: '',
    city: '',
    jobCategory: '',
};

export default function Dashboard() {
    const { setPageTitle } = useAppContext();
    const [filters, setFilters] = useState(initialFilters);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        // TODO: wire this up to your job search API / route
        console.log('Searching jobs with:', filters);
    };

    useEffect(() => {
        setPageTitle('Dashboard');
    }, [setPageTitle]);

    return (
        <div className="space-y-5">
            {/* Job Search Form */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
                <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Position
                        </label>
                        <input
                            type="text"
                            name="position"
                            value={filters.position}
                            onChange={handleFilterChange}
                            placeholder="e.g. Frontend Developer"
                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Country
                        </label>
                        <input
                            type="text"
                            name="country"
                            value={filters.country}
                            onChange={handleFilterChange}
                            placeholder="e.g. United States"
                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            State
                        </label>
                        <input
                            type="text"
                            name="state"
                            value={filters.state}
                            onChange={handleFilterChange}
                            placeholder="e.g. New York"
                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            City
                        </label>
                        <input
                            type="text"
                            name="city"
                            value={filters.city}
                            onChange={handleFilterChange}
                            placeholder="e.g. New York"
                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Job Category
                        </label>
                        <select
                            name="jobCategory"
                            value={filters.jobCategory}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="">All Categories</option>
                            <option value="remote">Remote</option>
                            <option value="onsite">Onsite</option>
                            <option value="hybrid">Hybrid</option>
                            
                        </select>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="w-full px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:opacity-90 transition"
                        >
                            Search
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}