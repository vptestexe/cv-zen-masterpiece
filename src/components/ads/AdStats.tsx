
import React, { useState, useEffect } from 'react';

interface AdMetrics {
  impressions: number;
  clicks: number;
  revenue: number;
  ctr: number;
}

export const AdStats = () => {
  const [metrics, setMetrics] = useState<AdMetrics>({
    impressions: 0,
    clicks: 0,
    revenue: 0,
    ctr: 0
  });

  useEffect(() => {
    // Simuler le chargement des métriques
    const mockMetrics = {
      impressions: Math.floor(Math.random() * 10000),
      clicks: Math.floor(Math.random() * 200),
      revenue: Math.random() * 50,
      ctr: 0
    };
    
    mockMetrics.ctr = (mockMetrics.clicks / mockMetrics.impressions) * 100;
    
    setMetrics(mockMetrics);
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Statistiques publicitaires</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-3 rounded border border-blue-100">
          <p className="text-xs text-blue-800 font-medium">Impressions</p>
          <p className="text-2xl font-bold text-blue-900">{metrics.impressions.toLocaleString()}</p>
        </div>
        
        <div className="bg-green-50 p-3 rounded border border-green-100">
          <p className="text-xs text-green-800 font-medium">Clics</p>
          <p className="text-2xl font-bold text-green-900">{metrics.clicks.toLocaleString()}</p>
        </div>
        
        <div className="bg-yellow-50 p-3 rounded border border-yellow-100">
          <p className="text-xs text-yellow-800 font-medium">CTR</p>
          <p className="text-2xl font-bold text-yellow-900">{metrics.ctr.toFixed(2)}%</p>
        </div>
        
        <div className="bg-purple-50 p-3 rounded border border-purple-100">
          <p className="text-xs text-purple-800 font-medium">Revenus estimés</p>
          <p className="text-2xl font-bold text-purple-900">{metrics.revenue.toFixed(2)} €</p>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500 text-center">
        Données simulées à des fins de démonstration
      </div>
    </div>
  );
};

export default AdStats;
